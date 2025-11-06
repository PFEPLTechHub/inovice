// Global variables
let globalValidData = [];
let globalEmployeeData = []; // To store employee data fetched from the server

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const downloadTemplateBtn = document.getElementById('downloadTemplate');
    const monthYearPicker = document.getElementById('monthYear');
    const excelFileUpload = document.getElementById('excelFileUpload');
    const uploadedDataTableBody = document.getElementById('uploadedDataTableBody');
    
    // Pre-select current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-11
    const currentYear = currentDate.getFullYear();
    const formattedCurrentMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
    monthYearPicker.value = `${currentYear}-${formattedCurrentMonth}`;

    // Initialize
    setupSubmitButton();
    
    // Fetch employee data on page load for calculations
    fetchEmployeeData();

    // Event Listeners
    downloadTemplateBtn.addEventListener('click', handleDownloadTemplate);
    excelFileUpload.addEventListener('change', handleFileUpload);

    // Functions
    function getSelectedMonthAndYear() {
        if (!monthYearPicker.value) return { month: null, year: null };
        
        const [year, monthNum] = monthYearPicker.value.split('-');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Convert from numeric month to name (1 -> January)
        const month = monthNames[parseInt(monthNum) - 1];
        
        return { month, year };
    }

    function handleDownloadTemplate() {
        const { month, year } = getSelectedMonthAndYear();
        
        if (!month || !year) {
            showAlert('Please select both month and year before downloading the template', 'warning');
            return;
        }
        
        // Request template file from backend
        fetch(`/api/download-template?month=${month}&year=${year}`, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Invoice_Template_${month}_${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error downloading template:', error);
            showAlert('Failed to download template. Please try again.', 'danger');
        });
    }

    function fetchEmployeeData() {
        // Fetch employee data from the server for calculations
        fetch('/api/employees-with-salary')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch employee data');
                }
                return response.json();
            })
            .then(employees => {
                globalEmployeeData = employees;
                console.log('Employee data loaded successfully');
            })
            .catch(error => {
                console.error('Error loading employee data:', error);
                showAlert('Failed to load employee data for calculations. Some features may not work properly.', 'warning');
            });
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Show loading indicator
        showAlert('Processing file, please wait...', 'info');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                // Add missing Total Amount fields or recalculate
                const processedData = preprocessDataWithTotalAmount(jsonData);
                
                // Validate the data 
                validateUploadedData(processedData)
                    .then(result => {
                        // Display data with validation results
                        displayUploadedDataWithStatus(result.processedData);
                        
                        // Store valid data for later submission
                        globalValidData = result.validData;
                    })
                    .catch(error => {
                        console.error('Validation error:', error);
                        showAlert('Error validating data: ' + error.message, 'danger');
                    });
            } catch (error) {
                console.error('Error processing Excel file:', error);
                showAlert('Failed to process Excel file. Please check the format and try again.', 'danger');
            }
        };
        
        reader.onerror = function() {
            showAlert('Error reading file. Please try again.', 'danger');
        };
        
        reader.readAsArrayBuffer(file);
    }

    function preprocessDataWithTotalAmount(data) {
        // Skip if no employee data is available yet
        if (!globalEmployeeData || globalEmployeeData.length === 0) {
            console.warn('Employee data not available for total calculation');
            return data;
        }
        
        return data.map(row => {
            // Only calculate if Total Amount is missing
            if (!row['Total Amount'] || row['Total Amount'].toString().trim() === '') {
                const calculatedTotal = calculateTotalAmount(globalEmployeeData, row);
                if (calculatedTotal !== null) {
                    // Create a new object with the calculated total
                    return {
                        ...row,
                        'Total Amount': calculatedTotal
                    };
                }
            }
            return row; // Return unchanged if we already have a total or can't calculate
        });
    }

    function displayUploadedDataWithStatus(data) {
        // Clear existing data
        uploadedDataTableBody.innerHTML = '';
        
        // Track counts for summary
        let validCount = 0;
        let rejectedCount = 0;
        let errorCount = 0;
        
        // Populate table with uploaded data and status
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // Set row color based on validation status
            if (row['_isRejected']) {
                tr.classList.add('table-secondary'); // Grey for rejected
                rejectedCount++;
            } else if (row['_isValid'] === false) {
                tr.classList.add('table-danger'); // Red for errors
                errorCount++;
            } else {
                tr.classList.add('table-success'); // Green for valid
                validCount++;
            }
            
            // Format total amount with commas if present
            let formattedTotal = '';
            if (row['Total Amount']) {
                formattedTotal = formatNumberWithCommas(row['Total Amount']);
            }
            
            tr.innerHTML = `
                <td>${row['Yes/No'] || ''}</td>
                <td>${index + 1}</td>
                <td>${row['Name'] || ''}</td>
                <td>${row['Month'] || ''}</td>
                <td>${row['Payable Days'] || ''}</td>
                <td>${row['Food Amount'] || ''}</td>
                <td>${row['Arrears Month'] || ''}</td>
                <td>${row['Arrears Payable Days'] || ''}</td>
                <td>${formattedTotal}</td>
                <td>${row['Status']}</td>
            `;
            
            uploadedDataTableBody.appendChild(tr);
        });
        
        // Show summary of validation
        const submitBtn = document.getElementById('submitInvoices');
        
        if (errorCount > 0) {
            // If there are errors, don't allow submission
            showAlert(`<strong>Cannot submit:</strong> Found ${errorCount} records with errors. Please fix errors and reupload.`, 'danger');
            submitBtn.disabled = true;
        } else if (validCount === 0 && rejectedCount > 0) {
            // If all are rejected, show warning but don't enable submit
            showAlert(`All ${rejectedCount} records are marked as rejected. No data to submit.`, 'warning');
            submitBtn.disabled = true;
        } else if (validCount > 0) {
            // If we have valid records, allow submission
            let message = `<strong>Ready to submit:</strong> ${validCount} valid records`;
            if (rejectedCount > 0) {
                message += ` (${rejectedCount} rejected records will be skipped)`;
            }
            showAlert(message, 'success');
            submitBtn.disabled = false;
        } else {
            // No valid or rejected records (shouldn't happen but handle it)
            showAlert('No valid records found.', 'warning');
            submitBtn.disabled = true;
        }
    }
});

// Helper functions
function showAlert(message, type) {
    // Find or create summary element
    let summaryElement = document.getElementById('validation-summary');
    if (!summaryElement) {
        summaryElement = document.createElement('div');
        summaryElement.id = 'validation-summary';
        summaryElement.className = 'alert mt-3';
        document.querySelector('#data').appendChild(summaryElement);
    }
    
    summaryElement.className = `alert alert-${type} mt-3`;
    summaryElement.innerHTML = message;
}

function setupSubmitButton() {
    // Check if submit button already exists
    let submitBtn = document.getElementById('submitInvoices');
    
    if (!submitBtn) {
        // Create submit button
        submitBtn = document.createElement('button');
        submitBtn.id = 'submitInvoices';
        submitBtn.className = 'btn btn-primary mt-3';
        submitBtn.textContent = 'Submit Invoices';
        submitBtn.disabled = true; // Initially disabled until valid data is uploaded
        
        // Add to the data tab
        document.getElementById('data').appendChild(submitBtn);
        
        // Add event listener
        submitBtn.addEventListener('click', submitInvoiceData);
    }
    
    return submitBtn;
}




   

let currentManagerZipFiles = {}; // Changed from currentZipFilePath
    let currentManagersData = [];
    let currentProcessedUids = [];

    function submitInvoiceData() {
        if (!globalValidData || globalValidData.length === 0) {
            showAlert('No valid data to submit', 'warning');
            return;
        }

        const submitBtn = document.getElementById('submitInvoices');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        fetch('/api/submit-invoice-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(globalValidData),
            // Add timeout handling
            signal: AbortSignal.timeout(300000) // 5 minutes timeout
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                // Log response for debugging
                console.log('Submit invoice response:', result);

                // Update button to show success
                submitBtn.textContent = 'Submitted Successfully';
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-success');
                
                showAlert(`<strong>Success:</strong> ${result.message}`, 'success');

                // Store data for manager modal
                currentManagerZipFiles = result.manager_zip_files || {}; // Changed
                currentManagersData = result.managers_data || [];
                currentProcessedUids = result.processed_uids || [];

                // Log stored data for debugging
                console.log('Stored currentManagerZipFiles:', currentManagerZipFiles);
                console.log('Stored currentProcessedUids:', currentProcessedUids);

                // Get current month for modal title
                const monthYearPicker = document.getElementById('monthYear');
                const [year, monthNum] = monthYearPicker.value.split('-');
                const monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                const currentMonth = monthNames[parseInt(monthNum) - 1];
                const monthYearString = `${currentMonth} ${year}`;

                // Show manager modal first, then automation prompt, then reload
                setTimeout(() => {
                    if (result.templates_generated && currentManagersData.length > 0) {
                        showManagerSelectionModal(monthYearString, () => {
                            // After manager modal closes, show automation prompt
                            showAutomationPrompt(monthYearString, () => {
                                // After automation prompt closes, schedule page reload
                                schedulePageReload();
                            });
                        });
                    } else {
                        // No managers, just show automation prompt then reload
                        showAutomationPrompt(monthYearString, () => {
                            schedulePageReload();
                        });
                    }
                }, 1000);

            } else {
                // Handle error case - reset button
                if (result.errors && result.errors.length > 0) {
                    showAlert(`<strong>Error:</strong> ${result.message}<br><ul>` + 
                        result.errors.map(err => `<li>${err}</li>`).join('') + 
                        '</ul>', 'danger');
                } else {
                    showAlert(`<strong>Error:</strong> ${result.message}`, 'danger');
                }
                resetSubmitButton(submitBtn, originalText);
            }
        })
        .catch(error => {
            console.error('Error submitting data:', error);
            let errorMessage = 'Failed to submit data. Please try again.';
            
            if (error.name === 'TimeoutError') {
                errorMessage = 'Request timed out. The operation is taking longer than expected. Please try again.';
            } else if (error.name === 'AbortError') {
                errorMessage = 'Request was cancelled. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Connection lost. Please check your internet connection and try again.';
            }
            
            showAlert(`<strong>Error:</strong> ${errorMessage}`, 'danger');
            resetSubmitButton(submitBtn, originalText);
        });
    }



// Helper function to reset submit button state
function resetSubmitButton(submitBtn, originalText) {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-primary');
}



function showManagerSelectionModal(monthYear, onCloseCallback = null) {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('managerSelectionModal')) {
        createManagerSelectionModal();
    }

    // Populate manager list
    const managerList = document.getElementById('managerList');
    managerList.innerHTML = '';

    if (currentManagersData.length === 0) {
        managerList.innerHTML = '<p>No managers found for the selected employees.</p>';
        // If no managers, call callback immediately
        if (typeof onCloseCallback === 'function') {
            setTimeout(onCloseCallback, 500);
        }
        return;
    }

    // Create checkboxes for each manager
    currentManagersData.forEach(manager => {
        const managerDiv = document.createElement('div');
        managerDiv.className = 'form-check mb-2';
        managerDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${manager.manager_id}" 
                   id="manager_${manager.manager_id}" checked>
            <label class="form-check-label" for="manager_${manager.manager_id}">
                <strong>${manager.manager_name}</strong><br>
                <small class="text-muted">${manager.manager_email}</small>
            </label>
        `;
        managerList.appendChild(managerDiv);
    });

    // Update modal title with month/year
    document.getElementById('modalMonthYear').textContent = monthYear;

    // Get modal element
    const modalElement = document.getElementById('managerSelectionModal');
    const modal = new bootstrap.Modal(modalElement);

    // If a callback is provided, attach a one-time listener for when modal is fully hidden
    if (typeof onCloseCallback === 'function') {
        const handler = () => {
            onCloseCallback();
            modalElement.removeEventListener('hidden.bs.modal', handler);
        };
        modalElement.addEventListener('hidden.bs.modal', handler);
    }

    // Show the modal
    modal.show();
}


function createManagerSelectionModal() {
    const modalHTML = `
        <div class="modal fade" id="managerSelectionModal" tabindex="-1" 
             aria-labelledby="managerSelectionModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="managerSelectionModalLabel">
                            Send Templates to Managers - <span id="modalMonthYear"></span>
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" 
                                aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <p class="text-muted">
                                Select the managers who should receive the invoice templates via email:
                            </p>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">Managers List:</h6>
                                    <div>
                                        <button type="button" class="btn btn-sm btn-outline-primary me-2" 
                                                onclick="selectAllManagers()">Select All</button>
                                        <button type="button" class="btn btn-sm btn-outline-secondary" 
                                                onclick="deselectAllManagers()">Deselect All</button>
                                    </div>
                                </div>
                                <div id="managerList" class="border rounded p-3" 
                                     style="max-height: 300px; overflow-y: auto;">
                                    <!-- Manager checkboxes will be populated here -->
                                </div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                The invoice templates will be sent as a ZIP file attachment to the selected managers.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="sendTemplatesToManagers()">
                            <i class="fas fa-envelope me-2"></i>Send Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to the document body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function selectAllManagers() {
    const checkboxes = document.querySelectorAll('#managerList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function deselectAllManagers() {
    const checkboxes = document.querySelectorAll('#managerList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function sendTemplatesToManagers() {
        // Get selected managers
        const selectedCheckboxes = document.querySelectorAll('#managerList input[type="checkbox"]:checked');
        const selectedManagers = Array.from(selectedCheckboxes).map(cb => cb.value);
        
        if (selectedManagers.length === 0) {
            showAlert('Please select at least one manager to send templates to.', 'warning');
            return;
        }
        
        // Get current month/year for the email
        const monthYearElement = document.getElementById('modalMonthYear');
        const monthYear = monthYearElement ? monthYearElement.textContent : '';
        
        // Show loading state
        const sendBtn = event.target;
        const originalText = sendBtn.innerHTML;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        sendBtn.disabled = true;
        
        console.log('Sending templates with processed_uids:', currentProcessedUids);
        console.log('Sending templates with manager_zip_files:', currentManagerZipFiles);
        
        // Send request to backend
        fetch('/api/send-templates-to-managers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selected_managers: selectedManagers,
                manager_zip_files: currentManagerZipFiles, // Changed from zip_file_path
                month_year: monthYear,
                processed_uids: currentProcessedUids
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                // Show success message
                showAlert(`<strong>Success:</strong> ${result.message}`, 'success');
                
                // Close the modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('managerSelectionModal'));
                modal.hide();
                
                // Show summary if there were any errors
                if (result.error_count > 0) {
                    setTimeout(() => {
                        showAlert(`Note: ${result.error_count} email(s) could not be sent. Please check the manager email addresses.`, 'warning');
                    }, 1000);
                }
            } else {
                showAlert(`<strong>Error:</strong> ${result.message}`, 'danger');
            }
        })
        .catch(error => {
            console.error('Error sending templates:', error);
            showAlert('<strong>Error:</strong> Failed to send templates. Please try again.', 'danger');
        })
        .finally(() => {
            // Reset button state
            sendBtn.innerHTML = originalText;
            sendBtn.disabled = false;
        });
    }

// Utility function to show alerts (if not already defined)
function showAlert(message, type) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert-dismissible');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find a container to add the alert (adjust selector based on your HTML structure)
    const container = document.querySelector('.container') || document.querySelector('.container-fluid') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Event listener for when the modal is hidden (cleanup)
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for modal cleanup if needed
    document.addEventListener('hidden.bs.modal', function (event) {
        if (event.target.id === 'managerSelectionModal') {
            // Clean up any resources if needed
            console.log('Manager selection modal closed');
        }
    });
});

// Function to reset the form state (call this when you want to allow new submissions)
function resetFormState() {
    const submitBtn = document.getElementById('submitInvoices');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Invoices';
    }
    
    // Clear global variables
    globalValidData = [];
    currentZipFilePath = '';
    currentManagersData = [];
    
    // Clear file input
    const fileInput = document.getElementById('excelFileUpload');
    if (fileInput) {
        fileInput.value = '';
    }
}

// Optional: Add keyboard shortcuts for the modal
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('managerSelectionModal');
    const isModalVisible = modal && modal.classList.contains('show');
    
    if (isModalVisible) {
        // Ctrl/Cmd + A to select all
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            event.preventDefault();
            selectAllManagers();
        }
        
        // Ctrl/Cmd + D to deselect all
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            deselectAllManagers();
        }
        
        // Enter to send email
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendTemplatesToManagers();
        }
    }
});

// Export functions if using modules (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        submitInvoiceData,
        showManagerSelectionModal,
        sendTemplatesToManagers,
        resetFormState
    };
}
// New function to show automation prompt
// Updated function to show automation prompt with toggle off functionality
// Updated function to show automation prompt with toggle off functionality
function showAutomationPrompt(monthYear, onCloseCallback = null) {
    // Create a custom modal for automation prompt
    const modalHtml = `
        <div class="modal fade" id="automationPromptModal" tabindex="-1" aria-labelledby="automationPromptModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="automationPromptModalLabel">
                            <i class="fas fa-robot me-2"></i>Setup Automation
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="fas fa-calendar-check text-success" style="font-size: 3rem;"></i>
                        </div>
                        <h6 class="mb-3">Great! Your invoices have been submitted successfully.</h6>
                        <p class="mb-4">
                            Current month data for <strong>${monthYear}</strong> is now available.<br>
                            Would you like to automatically enable automation for this month?
                        </p>
                        <div class="alert alert-info">
                            <small><i class="fas fa-info-circle me-1"></i>
                            This will automatically save ${monthYear} as your automation setting.
                            </small>
                        </div>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-outline-secondary" id="noThanksBtn" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>No Thanks
                        </button>
                        <button type="button" class="btn btn-primary" id="setupAutomationBtn">
                            <i class="fas fa-magic me-1"></i>Yes, Auto-Enable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('automationPromptModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Get modal element and show it
    const modal = document.getElementById('automationPromptModal');
    const bsModal = new bootstrap.Modal(modal);
    
    // Add event listener for setup automation button (YES)
    document.getElementById('setupAutomationBtn').addEventListener('click', function() {
        // Mark that we handled this action
        modal.dataset.actionTaken = 'yes';
        
        // Setup automation
        setupAutomationForMonth(monthYear);
        
        // Hide the prompt modal
        bsModal.hide();
    });
    
    // Add event listener for "No Thanks" button
    document.getElementById('noThanksBtn').addEventListener('click', function() {
        // Turn off automation when user clicks "No Thanks"
        turnOffAutomation();
        
        // Mark that we handled this action
        modal.dataset.actionTaken = 'no';
    });
    
    // Single event listener for modal cleanup
    modal.addEventListener('hidden.bs.modal', function() {
        const actionTaken = modal.dataset.actionTaken;
        
        // Only call turnOffAutomation if no specific action was taken (X button or backdrop)
        if (!actionTaken) {
            turnOffAutomation();
        }
        
        // Always clean up modal and call callback
        modal.remove();
        if (typeof onCloseCallback === 'function') {
            onCloseCallback();
        }
    }, { once: true });
    
    // Show the modal
    bsModal.show();
}

// New function to turn off automation
function turnOffAutomation() {
    // Show loading message
    showToast('Turning off automation...', 'info');
    
    // Automation settings to turn off
    const automationSettings = {
        is_enabled: 0,
        default_month: '' // Clear the month
    };
    
    // Save automation settings to turn off
    fetch('/save_automation_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationSettings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI elements in background
            const automateToggle = document.getElementById('automateDataToggle');
            const monthInput = document.getElementById('automateDataMonth');
            const settingsDiv = document.getElementById('automateDataSettings');
            
            if (automateToggle && monthInput && settingsDiv) {
                automateToggle.checked = false; // Turn off the toggle
                monthInput.value = ''; // Clear the month input
                settingsDiv.style.display = 'none'; // Hide the settings div
            }
            
            // Show success message
            showToast('Automation has been turned off.', 'success');
        } else {
            showToast('Failed to turn off automation. Please try manually.', 'error');
        }
    })
    .catch(error => {
        console.error('Error turning off automation:', error);
        showToast('Error turning off automation. Please try manually.', 'error');
    });
}

// Updated function to setup automation for the specified month (unchanged)
function setupAutomationForMonth(monthYear) {
    // Show loading message
    showToast('Setting up automation...', 'info');
    
    // Convert monthYear (e.g., "May, 2025") to the format expected by the date input field
    // Handle both "May 2025" and "May, 2025" formats
    const cleanMonthYear = monthYear.replace(',', '').trim();
    const [monthName, year] = cleanMonthYear.split(' ');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
        showToast('Invalid month format. Please try manual setup.', 'error');
        return;
    }
    
    // Format as YYYY-MM for the date input
    const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    // Directly save the automation settings without opening modal
    const automationSettings = {
        is_enabled: 1,
        default_month: formattedDate // <- use formattedDate here instead of monthYear
    };
    
    // Save automation settings directly
    fetch('/save_automation_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationSettings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI elements in background with correct format
            const automateToggle = document.getElementById('automateDataToggle');
            const monthInput = document.getElementById('automateDataMonth');
            const settingsDiv = document.getElementById('automateDataSettings');
            
            if (automateToggle && monthInput && settingsDiv) {
                automateToggle.checked = true;
                // Set the date input with the correct format (YYYY-MM)
                monthInput.value = formattedDate;
                settingsDiv.style.display = 'block';
                
                console.log(`Original: ${monthYear}, Cleaned: ${cleanMonthYear}, Formatted: ${formattedDate}`);
            }
            
            // Show success message
            showToast(`🎉 Automation enabled for ${monthYear}! Your settings have been saved automatically.`, 'success');
        } else {
            showToast('Failed to setup automation. Please try manual setup.', 'error');
        }
    })
    .catch(error => {
        console.error('Error setting up automation:', error);
        showToast('Error setting up automation. Please try manual setup.', 'error');
    });
}

// New function to turn off automation
function turnOffAutomation() {
    // Show loading message
    showToast('Turning off automation...', 'info');
    
    // Automation settings to turn off
    const automationSettings = {
        is_enabled: 0,
        default_month: '' // Clear the month
    };
    
    // Save automation settings to turn off
    fetch('/save_automation_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationSettings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI elements in background
            const automateToggle = document.getElementById('automateDataToggle');
            const monthInput = document.getElementById('automateDataMonth');
            const settingsDiv = document.getElementById('automateDataSettings');
            
            if (automateToggle && monthInput && settingsDiv) {
                automateToggle.checked = false; // Turn off the toggle
                monthInput.value = ''; // Clear the month input
                settingsDiv.style.display = 'none'; // Hide the settings div
            }
            
            // Show success message
            showToast('Automation has been turned off.', 'success');
        } else {
            showToast('Failed to turn off automation. Please try manually.', 'error');
        }
    })
    .catch(error => {
        console.error('Error turning off automation:', error);
        showToast('Error turning off automation. Please try manually.', 'error');
    });
}

// Updated function to setup automation for the specified month (unchanged)
function setupAutomationForMonth(monthYear) {
    // Show loading message
    showToast('Setting up automation...', 'info');
    
    // Convert monthYear (e.g., "May, 2025") to the format expected by the date input field
    // Handle both "May 2025" and "May, 2025" formats
    const cleanMonthYear = monthYear.replace(',', '').trim();
    const [monthName, year] = cleanMonthYear.split(' ');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
        showToast('Invalid month format. Please try manual setup.', 'error');
        return;
    }
    
    // Format as YYYY-MM for the date input
    const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    // Directly save the automation settings without opening modal
    const automationSettings = {
        is_enabled: 1,
        default_month: formattedDate // <- use formattedDate here instead of monthYear
    };
    
    // Save automation settings directly
    fetch('/save_automation_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationSettings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI elements in background with correct format
            const automateToggle = document.getElementById('automateDataToggle');
            const monthInput = document.getElementById('automateDataMonth');
            const settingsDiv = document.getElementById('automateDataSettings');
            
            if (automateToggle && monthInput && settingsDiv) {
                automateToggle.checked = true;
                // Set the date input with the correct format (YYYY-MM)
                monthInput.value = formattedDate;
                settingsDiv.style.display = 'block';
                
                console.log(`Original: ${monthYear}, Cleaned: ${cleanMonthYear}, Formatted: ${formattedDate}`);
            }
            
            // Show success message
            showToast(`🎉 Automation enabled for ${monthYear}! Your settings have been saved automatically.`, 'success');
        } else {
            showToast('Failed to setup automation. Please try manual setup.', 'error');
        }
    })
    .catch(error => {
        console.error('Error setting up automation:', error);
        showToast('Error setting up automation. Please try manual setup.', 'error');
    });
}

// New function to schedule page reload
function schedulePageReload() {
    showAlert('<strong>All Done!</strong> Page will refresh shortly...', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 4000); // 4 second delay before reload
}

// New function to setup automation for the specified month
function setupAutomationForMonth(monthYear) {
    // Show loading message
    showToast('Setting up automation...', 'info');
    
    // Convert monthYear (e.g., "May, 2025") to the format expected by the date input field
    // Handle both "May 2025" and "May, 2025" formats
    const cleanMonthYear = monthYear.replace(',', '').trim();
    const [monthName, year] = cleanMonthYear.split(' ');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) {
        showToast('Invalid month format. Please try manual setup.', 'error');
        return;
    }
    
    // Format as YYYY-MM for the date input
    const formattedDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    // Directly save the automation settings without opening modal
    const automationSettings = {
    is_enabled: 1,
    default_month: formattedDate // <- use formattedDate here instead of monthYear
};

    
    // Save automation settings directly
    fetch('/save_automation_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationSettings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the UI elements in background with correct format
            const automateToggle = document.getElementById('automateDataToggle');
            const monthInput = document.getElementById('automateDataMonth');
            const settingsDiv = document.getElementById('automateDataSettings');
            
            if (automateToggle && monthInput && settingsDiv) {
                automateToggle.checked = true;
                // Set the date input with the correct format (YYYY-MM)
                monthInput.value = formattedDate;
                settingsDiv.style.display = 'block';
                
                console.log(`Original: ${monthYear}, Cleaned: ${cleanMonthYear}, Formatted: ${formattedDate}`);
            }
            
            // Show success message
            showToast(`🎉 Automation enabled for ${monthYear}! Your settings have been saved automatically.`, 'success');
        } else {
            showToast('Failed to setup automation. Please try manual setup.', 'error');
        }
    })
    .catch(error => {
        console.error('Error setting up automation:', error);
        showToast('Error setting up automation. Please try manual setup.', 'error');
    });
}

// Add CSS for pulse animation (add this to your CSS file or in a style tag)
const pulseAnimationCSS = `
<style>
.pulse-animation {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
    }
    70% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
    }
}
</style>
`;

// Add the CSS to the document head
if (!document.getElementById('pulseAnimationStyle')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'pulseAnimationStyle';
    styleElement.innerHTML = pulseAnimationCSS;
    document.head.appendChild(styleElement);
}

// Update the page refresh logic to avoid interrupting the automation setup
function delayedPageRefresh() {
    // Set timeout for page refresh (only if automation modal is not open)
    setTimeout(() => {
        const automationPromptModal = document.getElementById('automationPromptModal');
        const automateModal = document.getElementById('automateModal');
        
        // Only refresh if no automation modals are open
        if (!automationPromptModal && !automateModal?.classList.contains('show')) {
            showAlert('<strong>Done!</strong> Refreshing page...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }, 8000); // Increased time to allow for automation setup
}
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.log('Location access denied or error:', error);
                resolve(null); // Resolve with null instead of rejecting
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}
// Updated function to calculate the expected total amount
function calculateTotalAmount(employeeData, row) {
    try {
        // Find employee info by name
        const employeeName = row['Name'] ? row['Name'].toLowerCase().trim() : '';
        if (!employeeName) return null;
        
        const employeeInfo = employeeData.find(emp => 
            emp.employee_name.toLowerCase().trim() === employeeName);
        
        if (!employeeInfo) return null;
        
        // Get monthly salary and food allowance from employee data
        const monthlySalary = parseFloat(employeeInfo.monthly_salary);
        const foodAllowancePerDay = parseFloat(employeeInfo.food_allowance_per_day_amount);
        
        if (isNaN(monthlySalary)) return null;
        
        // Get main month payable days
        const mainPayableDays = row['Payable Days'] ? parseFloat(row['Payable Days']) : 0;
        
        // Get arrears days if present
        const arrearsPayableDays = row['Arrears Payable Days'] ? parseFloat(row['Arrears Payable Days']) : 0;
        
        // Get food amount if present (or calculate from food allowance and days)
        const foodAmount = row['Food Amount'] && row['Food Amount'].toString().trim() !== '' 
            ? parseFloat(row['Food Amount']) 
            : (foodAllowancePerDay * mainPayableDays);
        
        // Calculate days in main month (current month)
        const monthYearPicker = document.getElementById('monthYear');
        const [mainYear, mainMonthNum] = monthYearPicker.value.split('-');
        const mainMonth = parseInt(mainMonthNum) - 1; // JS months are 0-indexed
        const daysInMainMonth = new Date(parseInt(mainYear), mainMonth + 1, 0).getDate();
        
        // Calculate days in arrears month if provided
        let daysInArrearsMonth = 30; // Default value
        if (row['Arrears Month'] && row['Arrears Month'].toString().trim() !== "") {
            const [arrMonth, arrYear] = row['Arrears Month'].split(' ');
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const arrMonthIdx = monthNames.indexOf(arrMonth);
            if (arrMonthIdx !== -1) {
                daysInArrearsMonth = new Date(parseInt(arrYear), arrMonthIdx + 1, 0).getDate();
            }
        }
        
        // Using your calculation logic
        const mainPayableDaysPart = (monthlySalary / daysInMainMonth) * mainPayableDays;
        const arrearsPayableDaysPart = (monthlySalary / daysInArrearsMonth) * arrearsPayableDays;
        
        // Calculate total
        const totalSalary = mainPayableDaysPart + arrearsPayableDaysPart + foodAmount;
        
        // Round the total to match your rounding logic
        return Math.round(totalSalary);
    } catch (error) {
        console.error('Error calculating total amount:', error);
        return null;
    }
}

// Modify the API endpoint to fetch employee data with salary information
function validateUploadedData(data) {
    return new Promise((resolve, reject) => {
        // Get selected month and year for validation
        const monthYearPicker = document.getElementById('monthYear');
        
        if (!monthYearPicker.value) {
            reject(new Error('Please select month and year before uploading data'));
            return;
        }
        
        // Extract month and year from the picker
        const [yearStr, monthNumStr] = monthYearPicker.value.split('-');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const selectedMonth = monthNames[parseInt(monthNumStr) - 1];
        const selectedYear = yearStr;
        
        // Get days in the selected month
        const monthIdx = parseInt(monthNumStr) - 1; // 0-based index
        const year = parseInt(selectedYear);
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        
        // First fetch employees from database with salary information
        // Check if we already have employee data in global variable
        let employeeDataPromise;
        
        if (globalEmployeeData && globalEmployeeData.length > 0) {
            employeeDataPromise = Promise.resolve(globalEmployeeData);
        } else {
            employeeDataPromise = fetch('/api/employees-with-salary')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch employees');
                    }
                    return response.json();
                })
                .then(employees => {
                    globalEmployeeData = employees; // Save for future use
                    return employees;
                });
        }
        
        employeeDataPromise
            .then(employees => {
                // Create a map of employee names for easy lookup
                const validEmployeeNames = new Set(employees.map(emp => emp.employee_name.toLowerCase().trim()));
                
                // Process each row for validation
                const validData = [];
                const processedData = [];
                let hasErrors = false; // Flag to track if there are any validation errors
                
                data.forEach((row) => {
                    let isValid = true;
                    let isRejected = false; // New flag to track explicitly rejected invoices
                    let statusMessages = [];
                    
                    // Check if this invoice is marked as "No" (rejected)
                    const yesNoValue = row['Yes/No'] ? row['Yes/No'].toString().trim().toLowerCase() : '';
                    if (yesNoValue === 'no') {
                        statusMessages.push('Invoice rejected (marked as No)');
                        isRejected = true;
                        isValid = false; // Mark as invalid to skip processing
                    }
                    
                    if (!isRejected) { // Only validate if not explicitly rejected
                        // 1. Validate Name - exact match required (REQUIRED)
                        if (!row['Name'] || !validEmployeeNames.has(row['Name'].toLowerCase().trim())) {
                            statusMessages.push(`Employee name "${row['Name'] || 'Empty'}" not found in database`);
                            isValid = false;
                            hasErrors = true; // This is an error, not just a rejection
                        }
                        
                        // 2. Validate Month - must match selected month/year (REQUIRED)
                        const expectedMonthYear = `${selectedMonth} ${selectedYear}`;
                        if (!row['Month'] || row['Month'].trim() !== expectedMonthYear) {
                            statusMessages.push(`Month "${row['Month'] || 'Empty'}" does not match "${expectedMonthYear}"`);
                            isValid = false;
                            hasErrors = true;
                        }
                        
                        // 3. Validate Payable Days - not more than days in month (REQUIRED)
                        if (!row['Payable Days'] || row['Payable Days'].toString().trim() === '') {
                            statusMessages.push('Payable Days is required');
                            isValid = false;
                            hasErrors = true;
                        } else {
                            const payableDays = parseFloat(row['Payable Days']);
                            if (isNaN(payableDays) || payableDays < 0 || payableDays > daysInMonth) {
                                statusMessages.push(`Payable Days must be between 0-${daysInMonth}`);
                                isValid = false;
                                hasErrors = true;
                            }
                        }
                        
                        // 4. Validate Food Amount - only integers (OPTIONAL)
                        if (row['Food Amount'] && row['Food Amount'].toString().trim() !== '') {
                            const foodAmount = row['Food Amount'];
                            if (isNaN(foodAmount) || parseFloat(foodAmount) != foodAmount) {
                                statusMessages.push('Food Amount must be a whole number');
                                isValid = false;
                                hasErrors = true;
                            }
                        }
                        
                        // 5. Validate Arrears Month - should be a valid month/year format (OPTIONAL)
                        if (row['Arrears Month'] && row['Arrears Month'].toString().trim() !== "") {
                            const arrearsMonthRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/;
                            if (!arrearsMonthRegex.test(row['Arrears Month'])) {
                                statusMessages.push(`Arrears Month format invalid`);
                                isValid = false;
                                hasErrors = true;
                            }
                            
                            // 6. Validate Arrears Payable Days if Arrears Month is specified
                            if (row['Arrears Payable Days'] && row['Arrears Payable Days'].toString().trim() !== "") {
                                const arrearsPayableDays = parseFloat(row['Arrears Payable Days']);
                                
                                if (isNaN(arrearsPayableDays) || arrearsPayableDays < 0) {
                                    statusMessages.push('Arrears Payable Days must be positive');
                                    isValid = false;
                                    hasErrors = true;
                                } else {
                                    // Get days in the arrears month
                                    const [arrMonth, arrYear] = row['Arrears Month'].split(' ');
                                    const arrMonthIdx = new Date(Date.parse(arrMonth + " 1, " + arrYear)).getMonth();
                                    const arrYearNum = parseInt(arrYear);
                                    const daysInArrearsMonth = new Date(arrYearNum, arrMonthIdx + 1, 0).getDate();
                                    
                                    if (arrearsPayableDays > daysInArrearsMonth) {
                                        statusMessages.push(`Arrears Days exceeds max (${daysInArrearsMonth})`);
                                        isValid = false;
                                        hasErrors = true;
                                    }
                                }
                            }
                        } else if (row['Arrears Payable Days'] && row['Arrears Payable Days'].toString().trim() !== "") {
                            statusMessages.push('Arrears Days provided but no Arrears Month');
                            isValid = false;
                            hasErrors = true;
                        }
                        
                        // 7. Validate Total Amount (now automatically calculated if missing)
                        if (row['Total Amount'] && row['Total Amount'].toString().trim() !== '') {
                            // Parse the uploaded total (handle comma-formatted numbers)
                            const uploadedTotal = parseFloat(row['Total Amount'].toString().replace(/,/g, ''));
                            
                            // Calculate the expected total amount
                            const calculatedTotal = calculateTotalAmount(employees, row);
                            
                            // Check if we could calculate a total and if it matches
                            if (calculatedTotal !== null) {
                                // Allow for minor rounding differences (1 unit)
                                if (Math.abs(uploadedTotal - calculatedTotal) > 1) {
                                    const formattedCalc = calculatedTotal.toLocaleString('en-US');
                                    statusMessages.push(`Total Amount incorrect (expected: ${formattedCalc})`);
                                    isValid = false;
                                    hasErrors = true;
                                }
                            }
                        } else {
                            // If Total Amount is missing, calculate it
                            const calculatedTotal = calculateTotalAmount(employees, row);
                            if (calculatedTotal !== null) {
                                row['Total Amount'] = calculatedTotal;
                            } else {
                                statusMessages.push('Unable to calculate Total Amount automatically');
                                isValid = false;
                                hasErrors = true;
                            }
                        }
                    }
                    
                    // Create a processed row with status
                    const processedRow = {...row};
                    
                    if (isRejected) {
                        processedRow['Status'] = 'Rejected (No)';
                        processedRow['_isValid'] = false;
                        processedRow['_isRejected'] = true;
                    } else if (isValid) {
                        processedRow['Status'] = 'Valid';
                        processedRow['_isValid'] = true;
                        validData.push(row);
                    } else {
                        processedRow['Status'] = statusMessages.join('; ');
                        processedRow['_isValid'] = false;
                        processedRow['_hasError'] = true;
                    }
                    
                    processedData.push(processedRow);
                });
                
                resolve({
                    validData: validData,
                    processedData: processedData,
                    hasErrors: hasErrors
                });
            })
            .catch(error => {
                console.error('Error fetching employees for validation:', error);
                reject(new Error('Failed to validate employee names. Please try again.'));
            });
    });
}

// Helper function to format numbers with commas (like in your original code)
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function logout() {
    // Send a request to the backend to end the session
    fetch("/logout", { method: "POST" })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/"; // Redirect to the login page or home
        } else {
          alert("Logout failed. Please try again.");
        }
      })
      .catch(() => {
        alert("Error during logout. Please try again.");
      });
  }

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("mainContent");
    sidebar.classList.toggle("open");
    content.classList.toggle("shifted");
  }


  // Highlight active sidebar link
  window.addEventListener("DOMContentLoaded", () => {
const currentPath = window.location.pathname;
const links = document.querySelectorAll('.sidebar a');

links.forEach(link => {
  if (link.getAttribute("href") === currentPath) {
    link.classList.add("active");
  }
});
});

document.addEventListener('DOMContentLoaded', function() {
  const automateToggle = document.getElementById('automateDataToggle');
  const settingsDiv = document.getElementById('automateDataSettings');
  const monthInput = document.getElementById('automateDataMonth');
  const saveButton = document.getElementById('saveAutomateSettings');
  const automateButton = document.querySelector('button[data-bs-target="#automateModal"]');
  const modalElement = document.getElementById('automateModal');

  if (!automateToggle || !settingsDiv || !monthInput || !saveButton) return;
  
  // Add tabindex to body to make it focusable
  document.body.setAttribute('tabindex', '-1');

  // Add event listener for when modal is shown
  modalElement.addEventListener('shown.bs.modal', function() {
    // When modal is shown, store the element that had focus
    modalElement.returnFocusTo = document.activeElement;
  });

  // Add event listener for when modal is about to be hidden
  modalElement.addEventListener('hide.bs.modal', function() {
    // Clear any active focus inside modal
    if (document.activeElement && modalElement.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });

  // Add event listener for when modal is fully hidden
  modalElement.addEventListener('hidden.bs.modal', function() {
    // Return focus to the element that had focus before the modal was shown
    if (modalElement.returnFocusTo && typeof modalElement.returnFocusTo.focus === 'function') {
      setTimeout(() => {
        modalElement.returnFocusTo.focus();
      }, 10);
    }
  });

  // Fetch current automation settings
  fetchAutomationSettings();

  // Toggle settings visibility when the switch changes
  automateToggle.addEventListener('change', function() {
    settingsDiv.style.display = this.checked ? 'block' : 'none';
  });

  // Save automation settings - using mousedown instead of click to handle focus better
  saveButton.addEventListener('mousedown', function(e) {
    // Prevent default to manage focus manually
    e.preventDefault();
    
    const selectedMonth = monthInput.value;

    if (!selectedMonth) {
      showToast('Please select a month first', 'error');
      return;
    }

    // First move focus to trigger button before any async operations
    if (automateButton) {
      automateButton.focus();
    }

    // Check if invoice data exists for selected month before saving
    fetch('/check_invoices_for_month', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: selectedMonth })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        showToast('Error validating month: ' + data.message, 'error');
        return;
      }

      if (!data.exists) {
        // Show warning if no invoice data for selected month
        showToast('No invoices found for the selected month. Please choose a different month.', 'warning');
        return;
      }

      // Save settings only if invoices exist
      saveAutomationSettings({
        is_enabled: automateToggle.checked ? 1 : 0,
        default_month: selectedMonth
      });
    })
    .catch(error => {
      console.error('Error checking invoices:', error);
      showToast('Error checking invoices for selected month.', 'error');
    });
  });

  // Function to fetch current automation settings
  function fetchAutomationSettings() {
    fetch('/get_automation_settings')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          automateToggle.checked = data.settings.is_enabled === 1;
          monthInput.value = data.settings.default_month || '';
          settingsDiv.style.display = automateToggle.checked ? 'block' : 'none';
        }
      })
      .catch(error => {
        console.error('Error fetching automation settings:', error);
      });
  }

  // Function to save automation settings
  function saveAutomationSettings(settings) {
    fetch('/save_automation_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast('Automation settings saved successfully', 'success');
        
        // Instead of programmatically hiding the modal, click the cancel button
        // This uses Bootstrap's built-in focus management
        const cancelButton = modalElement.querySelector('button[data-bs-dismiss="modal"]');
        if (cancelButton) {
          cancelButton.click();
        }
      } else {
        showToast('Failed to save automation settings', 'error');
      }
    })
    .catch(error => {
      console.error('Error saving automation settings:', error);
      showToast('Error saving automation settings', 'error');
    });
  }
});
document.getElementById('automateDataToggle').addEventListener('change', function() {
  const settingsDiv = document.getElementById('automateDataSettings');
  if(this.checked) {
    settingsDiv.style.display = 'block';
  } else {
    settingsDiv.style.display = 'none';
  }
});
function showToast(message, type = 'info') {
  // Create toast container if not exists
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1055';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${getToastColor(type)} border-0 show mb-2`;
  toast.role = 'alert';
  toast.ariaLive = 'assertive';
  toast.ariaAtomic = 'true';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Append and auto-remove toast
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Utility function to map type to Bootstrap background color
function getToastColor(type) {
  switch (type) {
    case 'success': return 'success';
    case 'error': return 'danger';
    case 'warning': return 'warning';
    default: return 'primary';
  }
}

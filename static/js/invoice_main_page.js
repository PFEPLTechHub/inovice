// Add debounce function for search
function debounce(func, delay) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}
// JavaScript for the automation settings in the admin panel
document.addEventListener('DOMContentLoaded', function() {
  // Check if the admin panel exists (admin user only)
  const automateDataCard = document.getElementById('automateDataCard');
  if (!automateDataCard) return;

  const automateToggle = document.getElementById('automateDataToggle');
  const settingsDiv = document.getElementById('automateDataSettings');
  const monthInput = document.getElementById('automateDataMonth');
  const saveButton = document.getElementById('saveAutomateSettings');

  // Fetch current automation settings
  fetchAutomationSettings();

  // Toggle settings visibility when the switch changes
  automateToggle.addEventListener('change', function() {
    settingsDiv.style.display = this.checked ? 'block' : 'none';
  });

  // Save automation settings
  saveButton.addEventListener('click', function() {
    if (!monthInput.value) {
      showToast('Please select a month first', 'error');
      return;
    }

    saveAutomationSettings({
      is_enabled: automateToggle.checked ? 1 : 0,
      default_month: monthInput.value
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
function checkAutomationSettings() {
  fetch('/get_automation_settings')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.settings.is_enabled === 1 && data.settings.default_month) {
        console.log('Automation is enabled, setting month to:', data.settings.default_month);
        
        // Set the month value
        const mainMonthInput = document.getElementById('invoice_main_month');
        if (mainMonthInput) {
          mainMonthInput.value = data.settings.default_month;
          
          // Trigger the month change event to load data
          const event = new Event('input', { bubbles: true });
          mainMonthInput.dispatchEvent(event);
          
          // After data is loaded, auto-select approved employees
          setTimeout(autoSelectApprovedEmployees, 1000);
        }
      }
    })
    .catch(error => {
      console.error('Error checking automation settings:', error);
    });
}

// Function to automatically select all approved employees
function autoSelectApprovedEmployees() {
  const rows = document.querySelectorAll('#invoiceTable tbody tr');
  let anySelected = false;
  
  rows.forEach(row => {
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    
    // Only select checkboxes for approved employees (that don't have data-needs-approval)
    if (checkbox && !checkbox.disabled && !checkbox.dataset.needsApproval) {
      checkbox.checked = true;
      anySelected = true;
    }
  });
  
  if (anySelected) {
    // Update the "Select All" checkbox state
    updateSelectAllCheckboxState();
    
    // Enable the edit button for the selected rows
    updateAdminEditButtonState();
    
    // Show a toast notification
    showToast('Approved employees automatically selected', 'info');
  }
}
window.onload = function () {
  // Fetch data from Flask backend
  fetch("/get_initial_invoice_data")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#invoiceTable tbody");
      data.forEach((item, index) => {
        const row = document.createElement("tr");

        // Add data-monthly-salary attribute to the row
        row.setAttribute("data-monthly-salary", item.monthly_salary);

        row.innerHTML = `
          <td data-uid="${item.contractuserinfo_uid}" id="checkbox" >
              <input type="checkbox" name="selected" disabled>
          </td>
          <td id="serial_no">${index + 1}</td>  <!-- Serial Number Column -->
          <td id="name">${item.name}<input type="hidden" value="${
          item.name
        }"></td>
          <td id="invoice_no"><input type="text" disabled></td>
          <td id="payable_days"><input type="number" step="0.01" disabled></td>
          <td id="invoice_arrears_month" class="arrears"><input type="month" disabled></td>
          <td id="arrears_payable_days" class="arrears"><input type="number" step="0.01" disabled></td>
          <td id="arrears_salary" class="arrears"></td>
          <td id="food_amount_salary"><input type="number" step="0.01" disabled></td>
          <td id="monthly_calculated_salary"></td>
          <td id="total_calculated_salary"></td>
          <td id="project" class="manager-buttons"></td>
          <td id="remarks" class="manager-button">
  <div class="remark-container d-flex">
    <input type="text" class="form-control" >
    <button type="button" class="btn btn-sm btn-primary ml-2" title="Send remark to HR"  style="margin-left: 5px;">
      <i class="bi bi-envelope"></i>
    </button>
  </div>
</td>
          <td id="manager" class="manager-button"></td>
        `;

        tableBody.appendChild(row);

        // Store salary information
        const monthlySalary = item.monthly_salary;
        const foodAllowancePerDay = item.food_allowance_per_day_amount;

        const payableDaysInput = row.cells[4].querySelector("input");
        const foodamountsalary = row.cells[8].querySelector("input");
        const arrearsMonthInput = row.cells[5].querySelector("input");
        const arrearsPayableDaysInput = row.cells[6].querySelector("input");

        // Handle payable days input change
        payableDaysInput.addEventListener("input", function () {
          updateSalary(row, monthlySalary, foodAllowancePerDay);
          // Save changes to database after calculation
          setTimeout(() => saveRowToDatabase(row), 100);
        });

        foodamountsalary.addEventListener("input", function () {
          updateSalary(row, monthlySalary, foodAllowancePerDay);
          // Save changes to database after calculation
          setTimeout(() => saveRowToDatabase(row), 100);
        });

        // Handle arrears payable days input change
        arrearsPayableDaysInput.addEventListener("input", function () {
          updateSalary(row, monthlySalary, foodAllowancePerDay);
          // Save changes to database after calculation
          setTimeout(() => saveRowToDatabase(row), 100);
        });

        // Handle arrears month input change
        arrearsMonthInput.addEventListener("input", function () {
          if (arrearsMonthInput.value) {
            arrearsPayableDaysInput.disabled = false;
          } else {
            arrearsPayableDaysInput.disabled = true;
            arrearsPayableDaysInput.value = ""; // Clear the arrears payable days when month is cleared
          }
          updateSalary(row, monthlySalary, foodAllowancePerDay);
          // Save changes to database after calculation
          setTimeout(() => saveRowToDatabase(row), 100);
        });
      });

      // After loading all rows, setup functionality
      setupSelectAllCheckbox();
      setupCheckboxHandlers(); // Set up our role-based checkbox handlers
      setupAutoSave(); // Set up auto-save functionality
      modifyRowToIncludeRemarkSendButton();
      setupSearchFunctionality();
      hideArrearsColumns();
      disableAllInputs();
      loadProjects();
      loadManagers();
      checkAutomationSettings();
      fetch("/get_user_role")
        .then((response) => response.json())
        .then((data) => {
          console.log("User role for displaying manager elements:", data.role);
          document.querySelectorAll(".manager-button").forEach((el) => {
            el.style.display = data.role === 0 ? "table-cell" : "none";
          });
        })
        .catch((error) =>
          console.error("Error setting manager visibility:", error)
        );
    })

    .catch((error) =>
      console.error("Error fetching initial invoice data:", error)
    );
};
const mainMonthInput = document.getElementById("invoice_main_month");

mainMonthInput.addEventListener("input", function () {

  const editButton = document.getElementById("adminEditButton");
  const saveButton = document.getElementById("adminSaveButton");
  const cancelButton = document.getElementById("adminCancelButton");
  
  if (editButton && saveButton && cancelButton) {
    // Reset to edit state
    editButton.style.display = "inline-block";
    editButton.disabled = true; // Initially disabled until rows are checked
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
  }

  let month = mainMonthInput.value; // Get selected month
  console.log("Month chosen:", `"${month}"`);

  // First, uncheck all checkboxes and disable editing
  uncheckAllCheckboxes();

  if (month) {
    fetch("/get_invoice_nos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: month }),
    })
      .then((response) => response.json())
      .then((data) => {
        enablecheckbox(); // Enable checkboxes only after selecting a month
        displayinvoice(data);
        // Clear search when month changes
        document.getElementById('invoiceSearchInput').value = '';
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  } else {
    disableAllInputs(); // If no month selected, disable all inputs
  }
});

function disableAllInputs() {
  const inputs = document.querySelectorAll("#invoiceTable tbody td input");

  inputs.forEach((input) => {
    if (
      input.type === "number" ||
      input.type === "month" ||
      input.type === "checkbox"
    ) {
      input.disabled = true; // disable number and month inputs
    }
  });
}

// Function to update the salary when the month is changed
function updateSalaryOnMonthChange(row, monthlySalary, foodAllowancePerDay) {
  const mainMonthInput = document.getElementById("invoice_main_month");

  mainMonthInput.addEventListener("input", function () {
    let selectedMonth = mainMonthInput.value;
    console.log("Month selected:", selectedMonth);

    // Get the checkbox for this row
    const checkboxInput = row.cells[0].querySelector('input[type="checkbox"]');

    if (selectedMonth && checkboxInput.checked) {
      console.log("Row selected, updating salary...");
      updateSalary(row, monthlySalary, foodAllowancePerDay);
    } else {
      console.log("Row not selected, salary update skipped.");
    }
  });
}

// Function to update the salary in the row
function updateSalary(row, monthlySalary, foodAllowancePerDay) {
  if (!row) {
    console.error("Error: Row is undefined in updateSalary!");
    return;
  }
  console.log("Updating salary for row:", row);
  const mainMonthDays = checkmainmonth();
  const arrearsMonthDays = checkarrearsmonth(row);

  const mainPayableDaysInput = row.cells[4]?.querySelector("input");
  const arrearsPayableDaysInput = row.cells[6]?.querySelector("input");
  const foodamountsalary = row.cells[8]?.querySelector("input"); // Corrected this line

  if (!mainPayableDaysInput || !arrearsPayableDaysInput || !foodamountsalary) {
    console.error("Missing input fields in row:", row);
    return;
  }

  const MainpayableDays = parseFloat(mainPayableDaysInput.value) || 0;
  const arrearsPayableDays = parseFloat(arrearsPayableDaysInput.value) || 0;
  const food_amount_salary = parseFloat(foodamountsalary.value) || 0;

  const totalSalary = calculateSalary(
    monthlySalary,
    MainpayableDays,
    arrearsPayableDays,
    food_amount_salary,
    mainMonthDays,
    arrearsMonthDays,
    row
  );
  console.log("Updated Salary:", totalSalary);
}

// Function to calculate the salary based on inputs
function calculateSalary(
  monthlySalary,
  MainpayableDays,
  arrearsPayableDays,
  food_amount_salary,
  mainMonthDays,
  arrearsMonthDays,
  row
) {
  if (isNaN(arrearsPayableDays)) {
    arrearsPayableDays = 0;
  }

  if (isNaN(arrearsMonthDays) || arrearsMonthDays === 0) {
    arrearsMonthDays = 30; // Default to 30 to avoid division by zero
  }

  if (isNaN(mainMonthDays) || mainMonthDays === 0) {
    mainMonthDays = 30; // Default to 30 to avoid division by zero
  }

  if (isNaN(food_amount_salary)) {
    food_amount_salary = 0;
  }
  const mainPayableDaysPart = (monthlySalary / mainMonthDays) * MainpayableDays;
  const arrearsPayableDaysPart =
    (monthlySalary / arrearsMonthDays) * arrearsPayableDays;

  const totalSalary =
    mainPayableDaysPart + arrearsPayableDaysPart + food_amount_salary;

  console.log("=== Calculating Salary ===");
  console.log("Monthly Salary:", monthlySalary);
  console.log("Main Payable Days:", MainpayableDays);
  console.log("Arrears Payable Days:", arrearsPayableDays);
  console.log("Food Amount Salary:", food_amount_salary);
  console.log("Total Days in Month for main:", mainMonthDays);
  console.log("Total Days in Month for arrears:", arrearsMonthDays);
  console.log("Salary for Payable Days for main:", mainPayableDaysPart);
  console.log("Salary for Payable Days for arrears:", arrearsPayableDaysPart);
  console.log("Final Calculated Salary:", totalSalary);

  // Calculate rounded values first
  const roundedArrearsPart = Math.round(arrearsPayableDaysPart);
  const roundedMainPart = Math.round(mainPayableDaysPart);
  const roundedTotal = Math.round(totalSalary);

  // Update the table cells with the calculated values - formatted with commas
  row.cells[7].textContent = formatNumberWithCommas(roundedArrearsPart);
  row.cells[9].textContent = formatNumberWithCommas(roundedMainPart);
  row.cells[10].textContent = formatNumberWithCommas(roundedTotal);

  return totalSalary;
}

// Modify the displayinvoice function to handle the yes/no column
function displayinvoice(invoiceData) {
  const rows = document.querySelectorAll("#invoiceTable tbody tr");
  const selectedMonth = mainMonthInput.value;

  // Clear all calculation fields first
  rows.forEach((row) => {
    // Make sure checkboxes are unchecked when switching months
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = false;
      enableEditableFields(row, true); // Disable all fields
    }
  });

  // Now update with new data
  rows.forEach((row) => {
    const cells = row.children;
    const uid = cells[0].getAttribute("data-uid"); // Get UID from row

    if (invoiceData.hasOwnProperty(uid)) {
      const data = invoiceData[uid];

      // Check if this row should be enabled based on yes_no
      const checkbox = cells[0].querySelector('input[type="checkbox"]');
      if (checkbox) {

if (data.yes_no !== "Yes") {
  // For unapproved employees (no data for month)
  isUserAdmin().then((isAdmin) => {
    checkbox.disabled = !isAdmin; // Only enable for admins
    checkbox.dataset.needsApproval = "true";
    checkbox.title = "This employee is not approved for this month";
    row.classList.add("not-approved-row");
  });
} else {
  // For approved employees (with data)
  checkbox.disabled = false;
  checkbox.title = "";
  row.classList.remove("not-approved-row");
  delete checkbox.dataset.needsApproval;
}
      }
      const remarksInput = cells[12].querySelector("input");
      if (remarksInput && data.remarks) {
        remarksInput.value = data.remarks;
      }
      // Set invoice number
      const invoiceInput = cells[3].querySelector("input");
      if (invoiceInput) {
        invoiceInput.value = data.invoice_no;
      }

      // Set payable days if exists
      const payableDaysInput = cells[4].querySelector("input");
      if (payableDaysInput && data.payable_days !== null) {
        payableDaysInput.value = data.payable_days;
      }

      // Set food amount if exists
      const foodAmountInput = cells[8].querySelector("input");
      if (foodAmountInput && data.food_amount !== null) {
        foodAmountInput.value = data.food_amount;
      }

      // Set arrears month if exists
      const arrearsMonthInput = cells[5].querySelector("input");
      if (arrearsMonthInput && data.arrears_month) {
        arrearsMonthInput.value = data.arrears_month;
      }

      // Set arrears payable days if exists
      const arrearsPayableDaysInput = cells[6].querySelector("input");
      if (arrearsPayableDaysInput && data.arrears_payable_days !== null) {
        arrearsPayableDaysInput.value = data.arrears_payable_days;
      }

      // Set project if exists and if there's a project select dropdown
      const projectSelect = cells[11].querySelector("select");
      if (projectSelect && data.project_id) {
        projectSelect.value = data.project_id;
      }

      if (invoiceData.hasOwnProperty(uid)) {
        // Only recalculate for rows that had data loaded
        const monthlySalary =
          parseFloat(row.getAttribute("data-monthly-salary")) || 0;
        const foodAllowancePerDay = 0; // Adjust if needed

        // Update calculations
        setTimeout(
          () => updateSalary(row, monthlySalary, foodAllowancePerDay),
          100
        );
      }
    }
  });
}

// Helper function to get monthly salary from the row
function getMonthlySalaryForRow(row) {
  // You'll need to store this information somewhere in your table
  // For example, you could add a data attribute to the row
  return parseFloat(row.getAttribute("data-monthly-salary")) || 0;
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
    .catch((error) => {
      alert("Error during logout. Please try again.");
    });
}

// Load managers and attach Manager dropdowns
function loadManagers() {
  fetch("/get_managers")
    .then((response) => response.json())
    .then((managers) => {
      const rows = document.querySelectorAll("#invoiceTable tbody tr");
      rows.forEach((row) => {
        const uid = row.cells[0].getAttribute("data-uid");
        const managerCell = row.cells[13]; // Manager column index

        const select = document.createElement("select");
        select.classList.add("form-control", "manager-select");
        select.disabled = true; // enabled only on edit/select

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Manager";
        select.appendChild(defaultOption);

        managers.forEach((m) => {
          const option = document.createElement("option");
          option.value = m.manager_id || m.id || m.managerinfo_uid; // backend returns manager_id per get_managers
          option.textContent = m.name || m.manager_name;
          select.appendChild(option);
        });

        // Fetch current manager for this employee
        fetch(`/get_employee_manager/${uid}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.manager_id) {
              select.value = String(data.manager_id);
            }
          })
          .catch(() => {});

        select.addEventListener("change", function () {
          updateEmployeeManager(uid, this.value).then(() => {
            // After updating manager, row will be hidden for current manager on reload.
          });
        });

        managerCell.innerHTML = "";
        managerCell.appendChild(select);
      });

      // Extend enableEditableFields to toggle manager select
      const originalEnableEditableFields = enableEditableFields;
      enableEditableFields = function (row, value) {
        originalEnableEditableFields(row, value);
        const managerSelect = row.cells[13]?.querySelector("select");
        if (managerSelect) managerSelect.disabled = value;
      };
    })
    .catch((err) => console.error("Error loading managers:", err));
}

function updateEmployeeManager(employeeId, managerId) {
  return fetch("/update_employee_manager", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id: employeeId, manager_id: managerId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success) {
        showToast("Manager updated", "success");
      } else {
        showToast(data.error || "Failed to update manager", "error");
      }
    })
    .catch((e) => {
      console.error("Error updating manager:", e);
      showToast("Error updating manager", "error");
    });
}

fetch("/get_user_role") // Create an endpoint that returns user role
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    if (data.role === 1) {
      // Show buttons only for role 1
      document.querySelectorAll(".admin-button").forEach((button) => {
        button.style.display = "inline-block";
      });
    }
  })
  .catch((error) => console.error("Error fetching user role:", error));

// After the table is fully loaded, check role and hide/show manager elements

// Function to load projects and populate dropdowns
function loadProjects() {
  // Only load projects if user is a manager (role 0)
  fetch("/get_user_role")
    .then((response) => response.json())
    .then((userData) => {
      if (userData.role === 0 || userData.role === 1) {
        // Only managers (role 0) can see this feature
        // Fetch projects
        fetch("/get_projects")
          .then((response) => response.json())
          .then((projects) => {
            console.log("Projects loaded:", projects);

            // Get all employee rows
            const rows = document.querySelectorAll("#invoiceTable tbody tr");

            rows.forEach((row) => {
              const uid = row.cells[0].getAttribute("data-uid");
              const projectCell = row.cells[11];

              // Create select element for projects
              const projectSelect = document.createElement("select");
              projectSelect.classList.add("form-control", "project-select");
              projectSelect.disabled = true; // Initially disabled until checkbox is checked

              // Add default option
              const defaultOption = document.createElement("option");
              defaultOption.value = "";
              defaultOption.textContent = "Select Project";
              projectSelect.appendChild(defaultOption);

              // Add all projects as options
              projects.forEach((project) => {
                const option = document.createElement("option");
                option.value = project.project_id;
                const labelManager = project.manager_name ? ` (${project.manager_name})` : "";
                option.textContent = `${project.project_name}${labelManager}`;
                projectSelect.appendChild(option);
              });

              // Set current project if exists
              fetch(`/get_employee_project/${uid}`)
                .then((response) => response.json())
                .then((data) => {
                  if (data.project_id) {
                    projectSelect.value = data.project_id;
                  }
                })
                .catch((error) =>
                  console.error("Error fetching employee project:", error)
                );

              // Add event listener for project change
              projectSelect.addEventListener("change", function () {
                updateEmployeeProject(uid, this.value);
              });

              // Replace cell content with dropdown
              projectCell.innerHTML = "";
              projectCell.appendChild(projectSelect);
            });

            // Update the enableEditableFields function to also handle project select
            const originalEnableEditableFields = enableEditableFields;
            enableEditableFields = function (row, value) {
              originalEnableEditableFields(row, value);
              const projectSelect = row.cells[11].querySelector("select");
              if (projectSelect) projectSelect.disabled = value;
            };
          })
          .catch((error) => console.error("Error fetching projects:", error));
      }
    })
    .catch((error) => console.error("Error fetching user role:", error));
}

// Function to update employee project
function updateEmployeeProject(employeeId, projectId) {
  fetch("/update_employee_project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employee_id: employeeId,
      project_id: projectId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast("Project updated successfully", "success");

        // Also save the full row data to make sure project is linked in invoice table
        const row = document
          .querySelector(`#invoiceTable tbody td[data-uid="${employeeId}"]`)
          .closest("tr");
        if (row) {
          saveRowToDatabase(row);
        }
      } else {
        showToast("Failed to update project", "error");
      }
    })
    .catch((error) => {
      console.error("Error updating project:", error);
      showToast("Error updating project", "error");
    });
}


function setupSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");

  if (selectAllCheckbox) {
    // Initially disable the select all checkbox until a month is selected
    selectAllCheckbox.disabled = true;

    // In setupSelectAllCheckbox function (around line 484)
    selectAllCheckbox.addEventListener("change", function () {
      const isChecked = this.checked;
      const allCheckboxes = document.querySelectorAll(
        '#invoiceTable tbody td input[type="checkbox"]'
      );
    
      allCheckboxes.forEach((checkbox) => {
        const row = checkbox.closest("tr");
        
        // Only check boxes that don't need approval or if admin explicitly checks them individually
        if (!checkbox.disabled && (!checkbox.dataset.needsApproval || !isChecked)) {
          checkbox.checked = isChecked;
    
          if (row) {
            if (isChecked) {
              // Both admin and manager - just update edit button state
              // Don't enable fields until edit button is clicked
              updateAdminEditButtonState();
            } else {
              // When unchecking, disable all fields
              enableEditableFields(row, true);
            }
          }
        }
      });
    
      // Update edit button state
      updateAdminEditButtonState();
    });
  }
}

function updateSelectAllCheckboxState() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  if (!selectAllCheckbox) return;

  const allCheckboxes = document.querySelectorAll(
    '#invoiceTable tbody td input[type="checkbox"]:not(:disabled)'
  );
  const allChecked = Array.from(allCheckboxes).every(
    (checkbox) => checkbox.checked
  );
  const noneChecked = Array.from(allCheckboxes).every(
    (checkbox) => !checkbox.checked
  );

  if (allChecked) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (noneChecked) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.indeterminate = true;
  }
}

function uncheckAllCheckboxes() {
  // Uncheck the "Select All" checkbox
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }

  // Uncheck all individual checkboxes
  const checkboxes = document.querySelectorAll(
    '#invoiceTable tbody td input[type="checkbox"]'
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;

    // Get the row for this checkbox and disable all input fields
    const row = checkbox.closest("tr");
    if (row) {
      enableEditableFields(row, true); // Disable editing
    }
  });

  // Update admin buttons state
  updateAdminEditButtonState();

  // Also disable save and cancel buttons
  const saveButton = document.getElementById("adminSaveButton");
  const cancelButton = document.getElementById("adminCancelButton");

  if (saveButton) saveButton.disabled = true;
  if (cancelButton) cancelButton.disabled = true;
}

function isUserAdmin() {
  // We'll use a promise to get the user role asynchronously
  return new Promise((resolve, reject) => {
    fetch("/get_user_role")
      .then((response) => response.json())
      .then((data) => {
        // Role 1 is admin, Role 0 is manager
        resolve(data.role === 1);
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        reject(error);
      });
  });
}

// Update the checkbox input change handler to consider user role
// Update the checkbox event handler in setupCheckboxHandlers function to include this line
function setupCheckboxHandlers() {
  const checkboxes = document.querySelectorAll(
    '#invoiceTable tbody td input[type="checkbox"]'
  );

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const row = this.closest("tr");
      if (!row) return;

      if (this.checked) {
        // Both admin and manager now follow the same flow - wait for edit button
        updateAdminEditButtonState();
        
        // Enable remarks input and button for this row
        enableRemarksForSelectedRows();
      } else {
        // When unchecking, disable all fields
        enableEditableFields(row, true);
        
        // Disable remarks input and button for this row
        enableRemarksForSelectedRows();

        // Update admin edit button state
        updateAdminEditButtonState();
      }

      // Update select all checkbox state
      updateSelectAllCheckboxState();
    });
  });
}

// Function to enable only the project field for managers
function enableProjectFieldOnly(row, disabled) {
  // Only enable the project field (unchanged functionality to maintain backward compatibility)
  const projectSelect = row.cells[11].querySelector("select");
  if (projectSelect) {
    projectSelect.disabled = disabled;
  }
  
  enableRemarksForSelectedRows();
}

// Function to handle admin-only fields (payable days, arrears, etc.)
function enableAdminOnlyFields(row, disabled) {
  // Fields that only admin can edit
  const adminFieldIndexes = [4, 5, 6, 8]; // Payable days, arrears month, arrears days, food amount

  adminFieldIndexes.forEach((index) => {
    const inputField = row.cells[index].querySelector("input");
    if (inputField) {
      inputField.disabled = disabled;
    }
  });
}

function setupAutoSave() {
  const table = document.getElementById("invoiceTable");
  const tbody = table.querySelector("tbody");

  tbody.addEventListener("change", function (event) {
    const target = event.target;   
    const row = target.closest("tr");

    // Only proceed if this is a field we want to auto-save
    if (row && ["number", "month", "text"].includes(target.type)) {
      // Find which field was changed
      const cell = target.closest("td");
      if (!cell) return;

      // Save all editable fields regardless of user role
      saveRowToDatabase(row);
    }
  });

}

// In your saveRowToDatabase JavaScript function:
function saveRowToDatabase(row) {
  const uid = row.cells[0].getAttribute("data-uid");
  const invoiceNo = row.cells[3].querySelector("input").value.trim();
  const payableDays = row.cells[4].querySelector("input").value.trim();
  const arrearsMonth = row.cells[5].querySelector("input")
    ? row.cells[5].querySelector("input").value.trim()
    : "";
  const arrearsPayableDays = row.cells[6].querySelector("input").value.trim();
  const foodAmount = row.cells[8].querySelector("input").value.trim();

  // Get the total amount and remove commas before saving
  const totalAmountWithCommas = row.cells[10].textContent.trim();
  const totalAmount = totalAmountWithCommas.replace(/,/g, "");

  // Get project ID if there's a project select
  let projectId = "";
  const projectSelect = row.cells[11].querySelector("select");
  if (projectSelect) {
      projectId = projectSelect.value;
  }
  const remarksInput = row.cells[12].querySelector("input");
  const remarks = remarksInput ? remarksInput.value.trim() : "";
  
  // Get the selected month
  const mainMonthInput = document.getElementById("invoice_main_month");
  const selectedMonth = mainMonthInput.value;

  // Only proceed if we have a month selected
  if (!selectedMonth) {
      console.error("No month selected for saving data");
      return;
  }

  // Prepare data for API call - FIXED: Changed 'remarks' to 'remark'
  const data = {
      contract_employee_uid: uid,
      invoice_no: invoiceNo,
      month_date: selectedMonth,
      payable_days: payableDays,
      food_amount: foodAmount,
      arrears_month: arrearsMonth,
      arrears_payable_days: arrearsPayableDays,
      total_amount: totalAmount, // Using number without commas
      project_id: projectId,
      remark: remarks, // CHANGED FROM 'remarks' to 'remark' to match backend
  };

  // Send data to server
  fetch("/update_invoice_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
  })
  .then((response) => response.json())
  .then((result) => {
      if (result.success) {
          // showToast("Data saved successfully", "success");
      } else {
          // showToast("Failed to save data", "error");
      }
  })
  .catch((error) => {
      console.error("Error saving data:", error);
      showToast("Error saving data", "error");
  });
}


document.addEventListener("DOMContentLoaded", function () {
  const inputContainer = document.querySelector(".input-container");

  // Create the admin action buttons group
  const adminActionButtons = document.createElement("div");
  adminActionButtons.className = "admin-action-buttons";
  adminActionButtons.style.display = "none"; // Hidden by default
  adminActionButtons.style.marginLeft = "10px"; // Add some left margin to separate from other elements

  // Create Edit button
  const editButton = document.createElement("button");
  editButton.id = "adminEditButton";
  editButton.type = "button";
  editButton.disabled = true;
  editButton.innerHTML = '<i class="bi bi-pencil"></i> Edit';
  editButton.style.marginRight = "8px"; // Add right margin for spacing

  // Create Save button
  const saveButton = document.createElement("button");
  saveButton.id = "adminSaveButton";
  saveButton.type = "button";
  saveButton.disabled = true;
  saveButton.innerHTML = '<i class="bi bi-check-lg"></i> Save';
  saveButton.style.marginRight = "8px"; // Add right margin for spacing

  // Create Cancel button
  const cancelButton = document.createElement("button");
  cancelButton.id = "adminCancelButton";
  cancelButton.type = "button";
  cancelButton.disabled = true;
  cancelButton.innerHTML = '<i class="bi bi-x-lg"></i> Cancel';

  // Add buttons to the container
  adminActionButtons.appendChild(editButton);
  adminActionButtons.appendChild(saveButton);
  adminActionButtons.appendChild(cancelButton);

  // Insert before the submit container
  const submitContainer = document.querySelector(".submit-container");
  inputContainer.insertBefore(adminActionButtons, submitContainer);

  // Check if user is admin and show buttons accordingly
  fetch("/get_user_role")
    .then((response) => response.json())
    .then((data) => {
      if (data.role === 1 || data.role === 0) {
        // Only show for admins (role 1)
        adminActionButtons.style.display = "inline-block";
      }
    })
    .catch((error) => console.error("Error fetching user role:", error));

  // Set up event listeners for the buttons
  setupAdminButtonHandlers();
});

// Function to set up the admin button event handlers
function setupAdminButtonHandlers() {
  const editButton = document.getElementById("adminEditButton");
  const saveButton = document.getElementById("adminSaveButton");
  const cancelButton = document.getElementById("adminCancelButton");

  if (!editButton || !saveButton || !cancelButton) return;

  // Initially hide save and cancel buttons
  saveButton.style.display = "none";
  cancelButton.style.display = "none";

  // Store original values when editing starts
  let originalValues = {};

  // Edit button handler
editButton.addEventListener("click", function () {
  // Get all checked rows
  const checkedRows = getCheckedRows();
  
  // Check if any selected rows need approval
  const unapprovedRows = checkedRows.filter(row => {
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    return checkbox && checkbox.dataset.needsApproval === "true";
  });
  
  if (unapprovedRows.length > 0) {
    // Ask for confirmation
    if (!confirm("Some selected employees are not approved for this month. Do you want to add data for them?")) {
      return; // Cancel edit if the user says no
    }
  }

  // Continue with original code
  originalValues = storeOriginalValues(checkedRows);
  
  // Enable fields in checked rows
  checkedRows.forEach((row) => {
    enableEditableFields(row, false); // Enable fields
  });

  // Update button states - hide edit, show save and cancel
  editButton.style.display = "none";
  saveButton.style.display = "inline-block";
  saveButton.disabled = false;
  cancelButton.style.display = "inline-block";
  cancelButton.disabled = false;
});

  // Save button handler
  // Save button handler
saveButton.addEventListener("click", function () {
  const checkedRows = getCheckedRows();

  // Save all rows
  let savePromises = [];
  checkedRows.forEach((row) => {
    savePromises.push(
      new Promise((resolve) => {
        saveRowToDatabase(row);
        resolve();
      })
    );
  });

  // After all saves complete
  Promise.all(savePromises).then(() => {
    // Show success message
    showToast("Changes saved successfully", "success");

    // Uncheck all checkboxes
    checkedRows.forEach((row) => {
      const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = false;
      }

      // Disable editing
      enableEditableFields(row, true); // Disable fields
    });

    // Reset select all checkbox
    const selectAllCheckbox = document.getElementById("selectAllCheckbox");
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }

    // Reset button states - show edit, hide save and cancel
    editButton.style.display = "inline-block";
    editButton.disabled = true; // Disable until rows are checked again
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

    // Update checkbox states
    updateSelectAllCheckboxState();
    updateAdminEditButtonState();
  });
});

  // Cancel button handler
  cancelButton.addEventListener("click", function () {
    const checkedRows = getCheckedRows();

    // Restore original values
    restoreOriginalValues(checkedRows, originalValues);

    // Disable editing
    checkedRows.forEach((row) => {
      enableEditableFields(row, true); // Disable fields
    });

    // Reset button states - show edit, hide save and cancel
    editButton.style.display = "inline-block";
    editButton.disabled = false;
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

    showToast("Edit canceled", "info");
  });
}

// Function to get all checked rows
function getCheckedRows() {
  const allRows = document.querySelectorAll("#invoiceTable tbody tr");
  return Array.from(allRows).filter((row) => {
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    return checkbox && checkbox.checked;
  });
}

// Function to store original values before editing
function storeOriginalValues(rows) {
  let values = {};

  rows.forEach((row) => {
    const uid = row.cells[0].getAttribute("data-uid");
    values[uid] = {
      payableDays: row.cells[4].querySelector("input").value,
      arrearsMonth: row.cells[5].querySelector("input")
        ? row.cells[5].querySelector("input").value
        : "",
      arrearsPayableDays: row.cells[6].querySelector("input").value,
      foodAmount: row.cells[8].querySelector("input").value,
    };
  });

  return values;
}

// Function to restore original values when canceling
function restoreOriginalValues(rows, originalValues) {
  rows.forEach((row) => {
    const uid = row.cells[0].getAttribute("data-uid");
    if (originalValues[uid]) {
      const values = originalValues[uid];

      row.cells[4].querySelector("input").value = values.payableDays;

      if (row.cells[5].querySelector("input")) {
        row.cells[5].querySelector("input").value = values.arrearsMonth;
      }

      row.cells[6].querySelector("input").value = values.arrearsPayableDays;
      row.cells[8].querySelector("input").value = values.foodAmount;

      // Update calculations after restoring
      const monthlySalary =
        parseFloat(row.getAttribute("data-monthly-salary")) || 0;
      updateSalary(row, monthlySalary, 0);
    }
  });
}


// Add function to update admin edit button state
function updateAdminEditButtonState() {
  const editButton = document.getElementById("adminEditButton");
  const saveButton = document.getElementById("adminSaveButton");
  const cancelButton = document.getElementById("adminCancelButton");

  if (!editButton) return;

  const checkedRows = getCheckedRows();

  // Only update if we're not in edit mode (edit button is visible)
  if (editButton.style.display !== "none") {
    // Only enable the edit button when there's at least one checked row
    editButton.disabled = checkedRows.length === 0;
  }
}
function setupSearchFunctionality() {
  const searchInput = document.getElementById('invoiceSearchInput');
  if (!searchInput) return;
  
  // Call search with debounce
  const debouncedSearch = debounce(function() {
    const searchValue = searchInput.value.trim();
    if (searchValue.length > 0) {
      searchInvoices(searchValue);
    } else {
      // If search is cleared, restore all rows
      document.querySelectorAll('#invoiceTable tbody tr').forEach(row => {
        row.style.display = '';
      });
    }
  }, 300);
  
  searchInput.addEventListener('input', debouncedSearch);
}

function searchInvoices(searchTerm) {
  // Get the currently selected month
  // const selectedMonth = document.getElementById('invoice_main_month').value;
  
  // if (!selectedMonth) {
  //   showToast("Please select a month before searching", "warning");
  //   return;
  // }
  
  fetch("/search_invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      search_term: searchTerm,
      // month: selectedMonth
    })
  })
  .then(response => response.json())
  .then(data => {
    // Hide all rows first
    document.querySelectorAll('#invoiceTable tbody tr').forEach(row => {
      row.style.display = 'none';
    });
    
    // Show only matching rows
    data.results.forEach(uid => {
      const matchingCell = document.querySelector(`#invoiceTable tbody td[data-uid="${uid}"]`);
      if (matchingCell) {
        const matchingRow = matchingCell.closest('tr');
        if (matchingRow) {
          matchingRow.style.display = '';
        }
      }
    });
    
    
    if (data.results.length === 0) {
      showToast("No matching records found", "info");
    }
  })
  .catch(error => {
    console.error("Error searching invoices:", error);
    showToast("Error searching invoices", "error");
  });
}


// Add this function to handle sending remarks
function sendRemarkEmail(row) {
  console.log("Send button clicked for row:", row);
  
  try {
    const uidElement = row.cells[0];
    if (!uidElement) {
      console.error("UID element not found");
      showToast("Error: Could not identify employee", "error");
      return;
    }
    
    const uid = uidElement.getAttribute("data-uid");
    if (!uid) {
      console.error("Missing data-uid attribute");
      showToast("Error: Employee ID not found", "error");
      return;
    }
    
    const employeeNameInput = row.cells[2].querySelector("input[type='hidden']");
    if (!employeeNameInput) {
      console.error("Employee name input not found");
      showToast("Error: Employee name not found", "error");
      return;
    }
    
    const employeeName = employeeNameInput.value;
    
    const remarkContainer = row.cells[12];
    if (!remarkContainer) {
      console.error("Remarks cell not found");
      showToast("Error: Remarks field not found", "error");
      return;
    }
    
    const remarkInput = remarkContainer.querySelector("input");
    if (!remarkInput) {
      console.error("Remark input not found");
      showToast("Error: Remarks input not found", "error");
      return;
    }
    
    const remark = remarkInput.value.trim();
    const month = document.getElementById("invoice_main_month").value;
    
    if (!remark) {
      showToast("Please enter a remark before sending", "warning");
      return;
    }
    
    if (!month) {
      showToast("Please select a month first", "warning");
      return;
    }
    
    console.log("Sending remark data:", {
      contractuserinfo_uid: uid,
      employee_name: employeeName,
      remark: remark,
      month: month
    });
    
    // Send the remark via email
    fetch("/send_remark_email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractuserinfo_uid: uid,
        employee_name: employeeName,
        remark: remark,
        month: month
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast("Remark sent successfully", "success");
        
        // Save to database through normal row save mechanism
        saveRowToDatabase(row);
      } else {
        showToast(data.message || "Failed to send remark", "error");
      }
    })
    .catch(error => {
      console.error("Error sending remark:", error);
      showToast("Error sending remark: " + error.message, "error");
    });
  } catch (err) {
    console.error("Exception in sendRemarkEmail:", err);
    showToast("An unexpected error occurred", "error");
  }
}

// Modify the row structure to include a send button for remarks
// Add this to the part where you're setting up each row in the window.onload function
// Replace the modifyRowToIncludeRemarkSendButton function with this improved version
function modifyRowToIncludeRemarkSendButton() {
  const rows = document.querySelectorAll("#invoiceTable tbody tr");
  
  rows.forEach(row => {
    // Check if row already has a remarks column
    if (row.cells.length > 12) {
      const remarksCell = row.cells[12];
      
      // Check if we've already modified this cell
      if (!remarksCell.querySelector(".remark-container")) {
        // Create a container for the input and button
        const container = document.createElement("div");
        container.className = "remark-container d-flex";
        
        // Get the existing input or create a new one
        let input = remarksCell.querySelector("input");
        if (!input) {
          input = document.createElement("input");
          input.type = "text";
          input.className = "form-control";
          input.disabled = true;
        } else {
          // Remove the input from its current position
          if (input.parentNode === remarksCell) {
            remarksCell.removeChild(input);
          }
        }
        
        // Add input to container
        container.appendChild(input);
        
        // Create send button
        const sendButton = document.createElement("button");
        sendButton.type = "button";
        sendButton.className = "btn btn-sm btn-primary ml-2";
        sendButton.innerHTML = '<i class="bi bi-envelope"></i>';
        sendButton.title = "Send remark to HR";
        sendButton.disabled = true; // Initially disabled
        sendButton.style.marginLeft = "5px";
        
        // Add button to container
        container.appendChild(sendButton);
        
        // Replace cell content with container
        remarksCell.innerHTML = "";
        remarksCell.appendChild(container);
        
        // Add click event after appending to DOM
        const attachedSendButton = container.querySelector('button');
        if (attachedSendButton) {
          attachedSendButton.addEventListener("click", function() {
            console.log("Send button clicked from attached listener!");
            sendRemarkEmail(row);
          });
        }
      }
    }
  });
  
  // Add listeners to all send remark buttons to ensure they work
  document.querySelectorAll("#invoiceTable tbody tr td:nth-child(13) button").forEach(button => {
    // Remove existing listeners to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", function() {
      const currentRow = this.closest('tr');
      console.log("Send button clicked via delegated handler!");
      sendRemarkEmail(currentRow);
    });
  });
}
function enableRemarksForSelectedRows() {
  const rows = document.querySelectorAll("#invoiceTable tbody tr");
  
  rows.forEach(row => {
    const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    const isSelected = checkbox && checkbox.checked;
    
    // Enable/disable the remarks input and send button based on row selection
    if (row.cells.length > 12) {
      const remarksCell = row.cells[12];
      const input = remarksCell.querySelector('input');
      const sendButton = remarksCell.querySelector('button');
      
      if (input) input.disabled = !isSelected;
      if (sendButton) sendButton.disabled = !isSelected;
    }
  });
}






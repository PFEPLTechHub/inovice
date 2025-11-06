// Function to check the days in the main month (selected month)
function checkmainmonth() {
  const mainMonthInput = document.getElementById("invoice_main_month");
  console.log("this checkm", mainMonthInput);
  if (!mainMonthInput.value) {
    const today = new Date();
    const defaultMonth =
      today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0");

    mainMonthInput.value = defaultMonth;
  }

  const [year, month] = mainMonthInput.value.split("-");
  const monthDays = getDaysInMonth(year, parseInt(month)); // Get correct number of days for selected month
  console.log("Main Month Days (checkmainmonth):", monthDays); // Log the month days
  return monthDays;
}

// Function to check the days in the arrears month (selected arrears month)
function checkarrearsmonth(row) {
  // Ensure we get the arrears month input from the correct cell
  const arrearsMonthInput = row.cells[5].querySelector("input");

  if (!arrearsMonthInput || !arrearsMonthInput.value) {
    return 30; // Default to 30 if not selected
  }

  const [year, month] = arrearsMonthInput.value.split("-");
  const monthDays = getDaysInMonth(year, parseInt(month));
  console.log("Arrears Month Days:", monthDays);
  return monthDays;
}

// Function to get the number of days in a given month
function getDaysInMonth(year, month) {
  const date = new Date(year, month - 1, 1); // Use correct month (0-indexed)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); // Get last day of the month
}

function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  function convertLessThanThousand(n) {
    if (n === 0) return "";

    let result = "";
    let num = n; // Create a local copy to modify

    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
      if (num > 0) result += "and ";
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
      if (num > 0) result += ones[num] + " ";
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
    } else if (num > 0) {
      result += ones[num] + " ";
    }

    return result;
  }

  if (num === 0) return "Zero Rupees";

  let wholePart = Math.floor(num);
  let decimalPart = Math.round((num - wholePart) * 100);
  let result = "";
  let remainingWhole = wholePart; // Create a variable to modify

  if (remainingWhole >= 100000) {
    result +=
      convertLessThanThousand(Math.floor(remainingWhole / 100000)) + "Lakh ";
    remainingWhole %= 100000;
  }

  if (remainingWhole >= 1000) {
    result +=
      convertLessThanThousand(Math.floor(remainingWhole / 1000)) + "Thousand ";
    remainingWhole %= 1000;
  }

  result += convertLessThanThousand(remainingWhole);

  result = result.trim() + " Rupees";

  if (decimalPart > 0) {
    result += " and " + convertLessThanThousand(decimalPart).trim() + "Paise";
  }

  return result.trim();
}

function formatNumberWithCommas(number) {
  // Convert to number first in case it's a string, then format with commas
  return Number(number).toLocaleString('en-US');
}


// Function to hide arrears columns
// Function to hide arrears columns with smooth slide animation
function hideArrearsColumns() {
  const table = document.getElementById("invoiceTable");
  const headers = table.querySelectorAll("thead th.arrears");
  const rows = table.querySelectorAll("tbody tr");

  headers.forEach((th) => {
    th.style.transition = "opacity 0.5s ease-in-out, width 0.5s ease-in-out";
    setTimeout(() => {
      th.style.opacity = "0";
    }, 100);
    setTimeout(() => {
      th.style.width = "0";
      th.style.display = "none";
    }, 600);
  });

  rows.forEach((row) => {
    const arrearsCells = row.querySelectorAll("td.arrears");
    arrearsCells.forEach((cell) => {
      cell.style.transition =
        "opacity 0.5s ease-in-out, width 0.5s ease-in-out";
      setTimeout(() => {
        cell.style.opacity = "0";
      }, 100);
      setTimeout(() => {
        cell.style.width = "0";
        cell.style.display = "none";
      }, 600);
    });
  });

  document.getElementById("toggleArrearsBtn").textContent = "Show Arrears";
}

// Toggle function with smooth animation
const toggleButton = document.getElementById("toggleArrearsBtn");
toggleButton.addEventListener("click", function () {
  const table = document.getElementById("invoiceTable");
  const arrearsHeaders = table.querySelectorAll("thead th.arrears");
  const rows = table.querySelectorAll("tbody tr");
  const isHidden = arrearsHeaders[0].style.display === "none";

  arrearsHeaders.forEach((th) => {
    if (isHidden) {
      th.style.display = "table-cell";
      setTimeout(() => {
        th.style.opacity = "1";
        th.style.width = "auto";
      }, 100);
    } else {
      th.style.transition = "opacity 0.5s ease-in-out, width 0.5s ease-in-out";
      setTimeout(() => {
        th.style.opacity = "0";
      }, 100);
      setTimeout(() => {
        th.style.width = "0";
        th.style.display = "none";
      }, 600);
    }
  });

  rows.forEach((row) => {
    const arrearsCells = row.querySelectorAll("td.arrears");
    arrearsCells.forEach((cell) => {
      if (isHidden) {
        cell.style.display = "table-cell";
        setTimeout(() => {
          cell.style.opacity = "1";
          cell.style.width = "auto";
        }, 100);
      } else {
        cell.style.transition =
          "opacity 0.5s ease-in-out, width 0.5s ease-in-out";
        setTimeout(() => {
          cell.style.opacity = "0";
        }, 100);
        setTimeout(() => {
          cell.style.width = "0";
          cell.style.display = "none";
        }, 600);
      }
    });
  });

  toggleButton.textContent = isHidden ? "Hide Arrears" : "Show Arrears";
});



let userLocation = "";

// Function to get the user's current location when the page loads
window.addEventListener("DOMContentLoaded", function() {
    // Check if geolocation is available
    if (navigator.geolocation) {
        // Request the current position
        navigator.geolocation.getCurrentPosition(
            // Success callback
            function(position) {
                userLocation = position.coords.latitude + "," + position.coords.longitude;
                console.log("Location obtained:", userLocation);
                
                // Optional: Display location status to user
                const locationStatus = document.getElementById("locationStatus");
                if (locationStatus) {
                    locationStatus.textContent = "✅ Location detected";
                    locationStatus.style.color = "green";
                }
            },
            // Error callback
            function(error) {
                console.error("Error getting location:", error.message);
                
                // Optional: Display error to user
                const locationStatus = document.getElementById("locationStatus");
                if (locationStatus) {
                    locationStatus.textContent = "⚠️ Could not get location";
                    locationStatus.style.color = "orange";
                }
            },
            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser");
        
        // Optional: Display error to user
        const locationStatus = document.getElementById("locationStatus");
        if (locationStatus) {
            locationStatus.textContent = "❌ Location not supported";
            locationStatus.style.color = "red";
        }
    }
});



document.getElementById("invoiceForm").addEventListener("submit", function (event) {
    event.preventDefault();
    let checkboxChecked = false;
    const rows = document.querySelectorAll("#invoiceTable tbody tr");
    let tableData = [];
    
    rows.forEach((row) => {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            checkboxChecked = true;
            const totalSalary = parseFloat(row.cells[10].textContent.trim());
            const amountInWords = numberToWords(totalSalary);
            
            let rowData = {
                uid: row.cells[0].getAttribute("data-uid"),
                name: row.cells[2].textContent.trim(),
                invoice_no: row.cells[3].querySelector("input").value.trim(),
                payable_days: row.cells[4].querySelector("input").value.trim(),
                arrears_month: row.cells[5].querySelector("input") 
                    ? row.cells[5].querySelector("input").value.trim() 
                    : "",
                arrears_payable_days: row.cells[6]
                    .querySelector("input")
                    .value.trim(),
                arrears_amount: row.cells[7].textContent.trim(),
                food_amount_salary: row.cells[8].querySelector("input").value.trim(),
                monthly_calculated_salary: row.cells[9].textContent.trim(),
                total_calculated_salary: row.cells[10].textContent.trim(),
                amount_in_words: amountInWords,
            };
            
            tableData.push(rowData);
            console.log(rowData);
        }
    });
    
    // ✅ Prevent submission if no checkbox is selected
    if (!checkboxChecked) {
        alert("Please select at least one checkbox.");
        return;
    }
    
    checkInvoiceNos();
    totaldays = checkmainmonth();
    const mainMonthInput = document.getElementById("invoice_main_month");
    let invoice_date = `${mainMonthInput.value}-${totaldays}`;
    
    // Show loading indicator
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Generating Invoices...";
    submitBtn.disabled = true;
    
    fetch("/submit_invoice", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            invoice_data: tableData,
            invoice_date: invoice_date,
            current_location: userLocation  // Include the user's location
        }),
    })
    .then((response) => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (!response.ok) {
            throw new Error("Failed to download ZIP file.");
        }
        return response.blob(); // Convert the response to a blob
    })
    .then((blob) => {
        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob); // Create a URL for the blob
        a.download = "invoices.zip"; // Set the default file name
        document.body.appendChild(a);
        a.click(); // Trigger the download
        document.body.removeChild(a); // Clean up
    })
    .catch((error) => {
        console.error("Error:", error);
        // Reset button state on error
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        alert("Error generating invoices: " + error.message);
    });
});

// document
//   .getElementById("editInvoicesBtn")
//   .addEventListener("click", function () {
//     const inputs = document.querySelectorAll(
//       "#invoiceTable tbody td#invoice_no input"
//     );
//     const isDisabled = inputs[0].disabled; // Check if the first input is disabled

//     inputs.forEach((input) => {
//       input.disabled = !isDisabled; // Toggle disabled state
//     });

//     // Change button text based on state
//     this.textContent = isDisabled
//       ? "Disable Invoice Editing"
//       : "Edit Invoice Numbers";
//   });

function enablecheckbox() {
  const rows = document.querySelectorAll("#invoiceTable tbody tr");
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  
  // Enable the select all checkbox
  if (selectAllCheckbox) {
    selectAllCheckbox.disabled = false;
  }

  rows.forEach((row) => {
    const cells = row.children;
    const checkbox = cells[0].querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.disabled = false;
      // Ensure checkbox is unchecked when enabled
      checkbox.checked = false;
    }
  });
  
  // Update select all checkbox state
  updateSelectAllCheckboxState();
}

function enableEditableFields(row, value) {
  const cells = row.children;

  // Enable/Disable specific input fields
  const fieldsToModify = [4, 5, 6, 8]; // Column indexes including arrears fields

  fieldsToModify.forEach((index) => {
    const inputField = cells[index].querySelector("input");
    if (inputField) {
      // Special case for arrears month and its related fields
      if (index === 5) {
        // This is the arrears month input
        inputField.disabled = value;
      } else if (index === 6) {
        // This is the arrears payable days input
        // Only enable if the arrears month has a value
        const arrearsMonthInput = cells[5].querySelector("input");
        inputField.disabled = value || !arrearsMonthInput.value;
      } else {
        inputField.disabled = value;
      }

      // Add required attribute only for columns 4 (for payable days)
      if (!value && index === 4) {
        inputField.setAttribute("required", "true");
      } else {
        inputField.removeAttribute("required");
      }
    }
  });

  // Also enable/disable the project field
  const projectSelect = row.cells[11].querySelector("select");
  if (projectSelect) {
    projectSelect.disabled = value;
  }

}

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");
  const toastContainers = document.getElementById("toastContainers");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style = `
        background-color: ${type === "success" ? "green" : "red"};
        color: white;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        font-size: 16px;
        max-width: 300px;
        animation: fadeIn 0.5s, fadeOut 0.5s 5s; /* Changed fade-out to be slower (5 seconds) */
    `;
  toast.textContent = message;

  // Append to container
  toastContainer.appendChild(toast);
  toastContainers.appendChild(toast);

  // Remove the toast after 5.5 seconds (after the fade-out effect is complete)
  setTimeout(() => {
    toast.remove();
  }, 5500); // Keep the toast visible for 5 seconds
}

function checkInvoiceNos() {
  const rows = document.querySelectorAll("#invoiceTable tbody tr");
  let invalidRows = []; // List to store incorrect row numbers

  rows.forEach((row, index) => {
    const cells = row.children;
    const invoiceInput = cells[2].querySelector('input[type="text"]'); // Selects the invoice input field

    if (invoiceInput) {
      const invoiceNo = invoiceInput.value.trim();
      const regex = /^\d{2}\/\d{2}-\d{2}$/; // Format: 01/24-25

      if (!regex.test(invoiceNo)) {
        invalidRows.push(index + 1); // Store row number (1-based index)
      }
    }
  });

  // Display toast message
  if (invalidRows.length > 0) {
    const errorMessage = invalidRows
      .map((rowNo) => `Invoice no for row ${rowNo} has incorrect format`)
      .join("\n");
    showToast(errorMessage, "error"); // Show an error toast
  } else {
    showToast("Invoice submitted successfully", "success"); // Show a success toast
  }
}

// Initialize with hidden arrears on page load
// This ensures arrears columns are hidden as soon as the script loads
document.addEventListener("DOMContentLoaded", function () {
  // Call after DOM is loaded but before window.onload which loads the data
  hideArrearsColumns();
});


function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("mainContent");
  sidebar.classList.toggle("open");
  content.classList.toggle("shifted");
}

// Highlight active sidebar link
window.addEventListener("DOMContentLoaded", () => {
const links = document.querySelectorAll(".sidebar-link");
const currentPath = window.location.pathname;

links.forEach(link => {
const href = link.getAttribute("href");

// Exact match
if (href === currentPath) {
link.classList.add("active");

// Highlight parent section (for submenu items)
const parent = link.closest(".submenu");
if (parent) {
  const parentLink = parent.previousElementSibling;
  if (parentLink && parentLink.classList.contains("sidebar-link")) {
    parentLink.classList.add("active");
  }
}
}
});
});

window.onload = function () {
  fetch("/get_all_database_values")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#dataTable tbody");
      tableBody.innerHTML = ""; // Clear table before adding new data
      data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td>${index + 1}</td> <!-- Serial Number -->

                        <!-- Name Column with UID as Data Attribute -->
                        <td>
                            <span class="data" data-uid="${item.uid}">${
          item.name
        }</span>  
                            <input name = "employee_name" type="text" class="edit-input" value="${
                              item.name
                            }" style="display:none;">
                        </td>
                        <td>
                            ${item.last_invoice_no || "N/A"}
                        </td>

                        <td><span class="data">${
                          item.address
                        }</span><input name = "employee_address" type="text" class="edit-input" value="${
          item.address
        }" style="display:none;"></td>
         <td><span class="data">${
                          item.pincode
                        }</span><input name = "employee_pincode" type="text" class="edit-input" value="${
          item.pincode
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.pan_no
                        }</span><input  name = "pan_no" type="text" class="edit-input" value="${
          item.pan_no
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.account_number
                        }</span><input  name = "account_number" type="text" class="edit-input" value="${
          item.account_number
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.bank_name
                        }</span><input  name = "bank_name" type="text" class="edit-input" value="${
          item.bank_name
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.ifsc_code
                        }</span><input  name = "ifsc_code" type="text" class="edit-input" value="${
          item.ifsc_code
        }" style="display:none;"></td>
                        <!-- Display project name but keep project_id for backend -->
                       <td>
  <span class="data" data-project-id="${item.project_id || ''}">${item.manager_name ? `${item.project_name} (${item.manager_name})` : item.project_name}</span>
  <select name="project_id" class="edit-input" style="display:none;"></select>
</td>


                        <td><span class="data">${
                          item.monthly_salary
                        }</span><input name = "monthly_salary"  type="text" class="edit-input" value="${
          item.monthly_salary
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.food_allowance
                        }</span><input name = "food_allowance_per_day_amount"  type="text" class="edit-input" value="${
          item.food_allowance
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.phone_no
                        }</span><input  name = "phone_no" type="text" class="edit-input" value="${
          item.phone_no
        }" style="display:none;"></td>
                        <td><span class="data">${
                          item.mailid
                        }</span><input  name = "mailid" type="text" class="edit-input" value="${
          item.mailid
        }" style="display:none;"></td>
<td>
    <span class="data">${item.gender}</span>
    <select name="gender" class="edit-input" style="display:none;">
        <option value="Male">Male</option>
        <option value="Female">Female</option>
    </select>
</td>
                       <td>
    <span class="data">${item.template_no}</span>
    <select name="template_no" class="edit-input" style="display:none;">
        <option value="temp1">temp1</option>
        <option value="temp2">temp2</option>
        <option value="temp3">temp3</option>
        <option value="temp4">temp4</option>
        <option value="temp5">temp5</option>
        <option value="temp6">temp6</option>
        <option value="temp7">temp7</option>
        <option value="temp8">temp8</option>
        <option value="temp9">temp9</option>
        <option value="temp10">temp10</option>
        <option value="temp11">temp11</option>
        <option value="temp12">temp12</option>
        <option value="temp13">temp13</option>
        <option value="temp14">temp14</option>
        <option value="temp15">temp15</option>
        <option value="temp16">temp16</option>
        <option value="temp17">temp17</option>
        <option value="temp18">temp18</option>
        <option value="temp19">temp19</option>
        <option value="temp20">temp20</option>
    </select>
</td>
                        <td>${item.joining_date}</td>
                        <td>
  <span class="data">${item.manager_name || "N/A"}</span>
  <select name="manager_id" class="edit-input" style="display:none;"></select>
</td>

                        <!-- Actions Column -->
                        <td>
                            <button class="editBtn" onclick="editRow(this)">Edit</button>
                            <button class="updateBtn" onclick="updateRow(this)" style="display:none;">Update</button>
                            <button class="cancelBtn" onclick="cancelRow(this)" style="display:none;">Cancel</button>
                            <button class="deleteBtn" onclick="deleteRow(this)">Delete</button>
                        </td>
                    `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
};


// Function to enable editing of the row
function editRow(button) {
  var row = button.parentNode.parentNode;
  var inputs = row.querySelectorAll(".edit-input");
  var dataSpans = row.querySelectorAll(".data");
  
  // Handle manager and project dropdowns
  const managerCell = row.querySelector("td:nth-child(18)");
  const currentManagerName = managerCell.querySelector(".data").textContent.trim();
  const managerDropdown = row.querySelector("select[name='manager_id']");
  loadManagerDropdown(managerDropdown, currentManagerName);
  
  // Fixed project cell index
  const projectCell = row.querySelector("td:nth-child(10)");
  const projectDataSpan = projectCell.querySelector(".data");
  const currentProjectName = projectDataSpan.textContent.trim();
  const currentProjectId = projectDataSpan.getAttribute("data-project-id");
  const projectDropdown = row.querySelector("select[name='project_id']");
  loadProjectDropdown(projectDropdown, currentProjectName, currentProjectId);
  
  // Set gender dropdown value
  const genderCell = row.querySelector("td:nth-child(15)"); // Adjust this index to match your gender column
  const currentGender = genderCell.querySelector(".data").textContent.trim();
  const genderDropdown = row.querySelector("select[name='gender']");
  if (genderDropdown) {
    // Find the option with matching text and select it
    Array.from(genderDropdown.options).forEach(option => {
      if (option.text === currentGender) {
        option.selected = true;
      }
    });
  }
  
  // Show all input fields
  inputs.forEach((input) => (input.style.display = "inline-block"));
  dataSpans.forEach((span) => (span.style.display = "none"));
  
  // Find template cell and set its value
  const templateCells = Array.from(row.cells);
  const templateCell = templateCells.find(cell => {
    return cell.querySelector("select[name='template_no']") !== null;
  });
  
  if (templateCell) {
    const currentTemplate = templateCell.querySelector(".data").textContent.trim();
    console.log("Found template cell with value:", currentTemplate);
    
    // Use setTimeout to ensure DOM is updated before setting selection
    setTimeout(() => {
      setTemplateDropdownValue(row, currentTemplate);
    }, 100);
  }
  
  // Toggle button visibility
  row.querySelector(".editBtn").style.display = "none";
  row.querySelector(".updateBtn").style.display = "inline-block";
  row.querySelector(".cancelBtn").style.display = "inline-block";
}
// Function to update the row and send data to Flask
function updateRow(button) {
  var row = button.parentNode.parentNode;
  var inputs = row.querySelectorAll(".edit-input");
  var dataSpans = row.querySelectorAll(".data");

  // Get UID from the name column
  var uid = dataSpans[0].getAttribute("data-uid");
  var updatedData = { uid: uid };

  // Get the project dropdown to access both ID and display text
  const projectDropdown = row.querySelector("select[name='project_id']");
  const selectedProjectId = projectDropdown.value;
  const selectedProjectText =
    projectDropdown.options[projectDropdown.selectedIndex].text;

  // Get the manager dropdown to access both ID and display text
  const managerDropdown = row.querySelector("select[name='manager_id']");
  const selectedManagerId = managerDropdown.value;
  const selectedManagerText =
    managerDropdown.options[managerDropdown.selectedIndex].text;

  // Collect the updated values using input name attributes
  inputs.forEach((input) => {
    if (input.name !== "project_id" && input.name !== "manager_id") {
      updatedData[input.name] = input.value.trim();
    }
  });

  // Add project_id separately since we need both the ID and name
  updatedData["project_id"] = selectedProjectId;

  // Add manager_id separately
  updatedData["manager_id"] = selectedManagerId;


  console.log("Updating Data:", updatedData);

  // Send data to Flask
  fetch("/update_values", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        // Find the specific cells we need to update with text from dropdowns
        const projectCell = row.querySelector("td:nth-child(10)");
        const managerCell = row.querySelector("td:nth-child(18)");

        // Update project and manager cells with the selected text
        if (projectCell) {
          projectCell.querySelector(".data").textContent = selectedProjectText;
        }

        if (managerCell) {
          managerCell.querySelector(".data").textContent = selectedManagerText;
        }

        // Update the other cells
        inputs.forEach((input) => {
          if (input.name !== "project_id" && input.name !== "manager_id") {
            // Find the corresponding data span for this input
            const parentCell = input.parentElement;
            const dataSpan = parentCell.querySelector(".data");
            if (dataSpan) {
              dataSpan.textContent = input.value.trim();
            }
          }
        });

        // Hide inputs, show updated values
        inputs.forEach((input) => (input.style.display = "none"));
        dataSpans.forEach((span) => (span.style.display = "inline-block"));

        // Show Edit button, hide Update & Cancel
        row.querySelector(".editBtn").style.display = "inline-block";
        row.querySelector(".updateBtn").style.display = "none";
        row.querySelector(".cancelBtn").style.display = "none";

        showToast("Updated successfully!");
      } else {
        alert("Failed to update data.");
      }
    })
    .catch((error) => {
      console.error("Error updating data:", error);
      alert("An error occurred while updating.");
    });
}

// Function to fetch project names and populate dropdown
// Function to fetch project names and populate dropdown
function loadProjectDropdown(selectElement, selectedProject, selectedProjectId) {
  fetch("/get_register_project_names_admin")
    .then((response) => response.json())
    .then((projects) => {
      selectElement.innerHTML = ""; // Clear previous options
      
      // First, log what we're trying to match
      console.log("Current project name to match:", selectedProject);
      
      projects.forEach((project) => {
        const option = document.createElement("option");
        option.value = project.uid;
        option.textContent = project.name;
        
        // Debug log to check values
        console.log(`Comparing: '${project.name}' with '${selectedProject}'`);
        
        // Prefer selecting by ID when available
        if (selectedProjectId && String(project.uid) === String(selectedProjectId)) {
          option.selected = true;
          console.log("Selected by project ID:", project.uid);
        } else {
          // Fallback: try matching by name (allow substring to ignore manager suffix)
          const normalizedOption = (project.name || "").toLowerCase().trim();
          const normalizedSelected = (selectedProject || "").toLowerCase().trim();
          if (normalizedOption === normalizedSelected || normalizedOption.startsWith(normalizedSelected + " ")) {
            option.selected = true;
            console.log("Selected by name fallback:", project.name);
          }
        }
        selectElement.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching projects:", error));
}

function loadManagerDropdown(selectElement, selectedManager) {
  fetch("/get_managers")
    .then((response) => response.json())
    .then((managers) => {
      selectElement.innerHTML = ""; // Clear previous options
      managers.forEach((manager) => {
        const option = document.createElement("option");
        option.value = manager.manager_id;
        option.textContent = manager.manager_name;
        if (
          manager.manager_name === selectedManager ||
          (selectedManager === "N/A" && manager.manager_name === "")
        ) {
          option.selected = true;
        }
        selectElement.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching managers:", error));
}

// Function to cancel editing
function cancelRow(button) {
  var row = button.parentNode.parentNode;
  var inputs = row.querySelectorAll(".edit-input");
  var dataSpans = row.querySelectorAll(".data");

  // Restore original values
  dataSpans.forEach((span, index) => {
    inputs[index].value = span.textContent.trim();
  });

  // Hide inputs, show spans
  inputs.forEach((input) => (input.style.display = "none"));
  dataSpans.forEach((span) => (span.style.display = "inline-block"));

  // Hide Cancel & Update, Show Edit
  row.querySelector(".editBtn").style.display = "inline-block";
  row.querySelector(".updateBtn").style.display = "none";
  row.querySelector(".cancelBtn").style.display = "none";
}

// Function to delete a row
function deleteRow(button) {
  var row = button.parentNode.parentNode;
  var uid_to_delete = row.querySelector(".data").getAttribute("data-uid");
  console.log("This is the UID to delete:", uid_to_delete);

  // Confirm deletion
  if (!confirm("Are you sure you want to delete this record?")) return;

  // Send delete request to Flask
  fetch("/delete_values", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: uid_to_delete }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Remove the row from the table without reloading the page
        row.remove();
        showToast("Deleted successfully");
      } else {
        showToast("Failed to delete.");
      }
    })
    .catch((error) => {
      console.error("Error deleting data:", error);
      showToast("An error occurred while deleting.");
    });
}

function showToast(message) {
  const toastContainer = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `
            ${message}
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;

  toastContainer.appendChild(toast);

  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.5s forwards";
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleButton");
  // Define which columns to show in the "hide" state (columns start from index 0)
  const columnsToShow = [0, 1, 2, 9, 17]; // Adjust as needed
  const table = document.getElementById("dataTable");

  // Define the isTableHidden variable in the proper scope
  let isTableHidden = true; // Starting in hidden state
// Replace the existing toggleColumns function with this improved version
window.toggleColumns = function () {
  // First, save the state of any visible edit dropdowns before changing visibility
  const visibleProjectDropdowns = Array.from(document.querySelectorAll("select[name='project_id']:not([style*='display: none'])"));
  const savedProjectSelections = visibleProjectDropdowns.map(dropdown => {
    return {
      row: dropdown.closest('tr'),
      selectedValue: dropdown.value,
      selectedIndex: dropdown.selectedIndex
    };
  });
  
  // Process header and data rows as before
  const headerRow = table.querySelector("thead tr");
  const bodyRows = table.querySelectorAll("tbody tr");

  // Process header row first
  if (headerRow) {
    const headerCells = headerRow.children;
    for (let j = 0; j < headerCells.length; j++) {
      if (columnsToShow.includes(j) || j === headerCells.length - 1) {
        headerCells[j].style.display = "table-cell"; // Always show these columns
      } else {
        headerCells[j].style.display = isTableHidden ? "none" : "table-cell";
      }
    }
  }

  // Then process all data rows
  bodyRows.forEach((row) => {
    const cells = row.children;
    for (let j = 0; j < cells.length; j++) {
      if (columnsToShow.includes(j) || j === cells.length - 1) {
        cells[j].style.display = "table-cell"; // Always show these columns
      } else {
        cells[j].style.display = isTableHidden ? "none" : "table-cell";
      }
    }
  });

  // Update button text based on state
  if (toggleButton) {
    toggleButton.textContent = isTableHidden ? " Show All" : " Hide Details";
  }
  
  // Restore dropdown selections that were visible before the toggle
  setTimeout(() => {
    savedProjectSelections.forEach(saved => {
      const dropdown = saved.row.querySelector("select[name='project_id']");
      if (dropdown) {
        dropdown.value = saved.selectedValue;
        dropdown.selectedIndex = saved.selectedIndex;
      }
    });
  }, 50);
}
  // Use window object to make the function available globally
  // window.toggleColumns = function () {
  //   // First, get all table rows including header row
  //   const headerRow = table.querySelector("thead tr");
  //   const bodyRows = table.querySelectorAll("tbody tr");

  //   // Process header row first
  //   if (headerRow) {
  //     const headerCells = headerRow.children;
  //     for (let j = 0; j < headerCells.length; j++) {
  //       if (columnsToShow.includes(j) || j === headerCells.length - 1) {
  //         headerCells[j].style.display = "table-cell"; // Always show these columns
  //       } else {
  //         headerCells[j].style.display = isTableHidden ? "none" : "table-cell";
  //       }
  //     }
  //   }

  //   // Then process all data rows
  //   bodyRows.forEach((row) => {
  //     const cells = row.children;
  //     for (let j = 0; j < cells.length; j++) {
  //       if (columnsToShow.includes(j) || j === cells.length - 1) {
  //         cells[j].style.display = "table-cell"; // Always show these columns
  //       } else {
  //         cells[j].style.display = isTableHidden ? "none" : "table-cell";
  //       }
  //     }
  //   });

  //   // Update button text based on state
  //   if (toggleButton) {
  //     toggleButton.textContent = isTableHidden ? " Show All" : " Hide Details";
  //   }
  // };

  if (toggleButton) {
    // Initialize the button text immediately with the correct state
    toggleButton.textContent = " Show All";

    toggleButton.addEventListener("click", function () {
      isTableHidden = !isTableHidden; // Toggle the state
      window.toggleColumns(); // Apply the changes
    });
  }

  // Create a CSS rule to hide the unnecessary columns immediately
  const style = document.createElement("style");
  style.textContent = `
    #dataTable th:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(10)):not(:nth-child(18)):not(:last-child),
    #dataTable td:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(10)):not(:nth-child(18)):not(:last-child) {
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Apply the toggle function after data is loaded
  // Still need this to ensure the toggleColumns function runs after data is loaded
  setTimeout(function () {
    window.toggleColumns();
  }, 1000);
});

const generateExcelBtn = document.getElementById("generateExcelBtn");
if (generateExcelBtn) {
  generateExcelBtn.addEventListener("click", generateExcel);
}

function generateExcel() {
  // Show loading indicator or message
  showToast("Generating Excel file...");

  // Call the server endpoint to generate Excel
  fetch("/generate_excel")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showToast(data.message);

        // Create a download link for the file
        const downloadPath = `/${data.file_path}`;

        // Create a temporary link and click it to download
        const link = document.createElement("a");
        link.href = downloadPath;
        link.download = data.file_path.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showToast("Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error generating Excel:", error);
      showToast("Error generating Excel file!");
    });
}

// Store all original table rows for reference
let allTableRows = [];

let isTableHidden = true; // Track the current visibility state

// Function to initialize and set up dropdown filters
function initializeDropdownFilters() {
  // Create the filter container
  const tableContainer = document.getElementById("dataTable").parentNode;
  const filterContainer = document.createElement("div");
  filterContainer.className = "filter-container";
  filterContainer.innerHTML = `
    <div class="filters">
      <div class="filter-group">
        <label for="nameFilter">Employee Name:</label>
        <select id="nameFilter">
          <option value="">-- All Employees --</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="projectFilter">Project:</label>
        <select id="projectFilter">
          <option value="">-- All Projects --</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="managerFilter">Manager:</label>
        <select id="managerFilter">
          <option value="">-- All Managers --</option>
        </select>
      </div>
      
      <button id="clearFilters" class="clear-btn">Reset Filters</button>
    </div>
  `;

  // Insert the filter container before the table
  tableContainer.insertBefore(
    filterContainer,
    document.getElementById("dataTable")
  );

  // Store all original rows for reference
  allTableRows = Array.from(document.querySelectorAll("#dataTable tbody tr"));

  // Populate the dropdowns with unique values from the table
  populateAllDropdowns();

  // Add event listeners to filter dropdowns
  document
    .getElementById("nameFilter")
    .addEventListener("change", handleNameFilterChange);
  document
    .getElementById("projectFilter")
    .addEventListener("change", handleProjectFilterChange);
  document
    .getElementById("managerFilter")
    .addEventListener("change", handleManagerFilterChange);
  document
    .getElementById("clearFilters")
    .addEventListener("click", clearAllFilters);

  // Add event listener to the toggle button to update filters when visibility changes
  const toggleButton = document.getElementById("toggleButton");
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      // Wait a short time for the toggle to complete
      setTimeout(() => {
        isTableHidden = !isTableHidden;
        // Reapply current filters with the new visibility state
        applyAllFilters();
      }, 100);
    });
  }
}

// Helper function to get cell text regardless of structure
function getCellText(cell) {
  if (!cell) return "";
  return cell.querySelector(".data")
    ? cell.querySelector(".data").textContent.trim()
    : cell.textContent.trim();
}

// Function to safely get column index based on header text
function getColumnIndexByHeader(headerText) {
  const headers = Array.from(document.querySelectorAll("#dataTable thead th"));
  const index = headers.findIndex((th) => th.textContent.trim() === headerText);
  return index !== -1 ? index : null;
}

// Function to get cell by header name regardless of visible state
function getCellByHeader(row, headerName) {
  const index = getColumnIndexByHeader(headerName);
  return index !== null ? row.cells[index] : null;
}

// Event handler for name filter changes
function handleNameFilterChange() {
  // Get the selected name
  const selectedName = document.getElementById("nameFilter").value;

  // Update other dropdowns based on this selection
  updateProjectDropdown(
    selectedName,
    document.getElementById("managerFilter").value
  );
  updateManagerDropdown(
    selectedName,
    document.getElementById("projectFilter").value
  );

  // Apply all filters to the table
  applyAllFilters();
}

// Event handler for project filter changes
function handleProjectFilterChange() {
  // Get the selected project
  const selectedProject = document.getElementById("projectFilter").value;

  // Update other dropdowns based on this selection
  updateNameDropdown(
    selectedProject,
    document.getElementById("managerFilter").value
  );
  updateManagerDropdown(
    document.getElementById("nameFilter").value,
    selectedProject
  );

  // Apply all filters to the table
  applyAllFilters();
}

// Event handler for manager filter changes
function handleManagerFilterChange() {
  // Get the selected manager
  const selectedManager = document.getElementById("managerFilter").value;

  // Update other dropdowns based on this selection
  updateNameDropdown(
    document.getElementById("projectFilter").value,
    selectedManager
  );
  updateProjectDropdown(
    document.getElementById("nameFilter").value,
    selectedManager
  );

  // Apply all filters to the table
  applyAllFilters();
}

// Function to populate all dropdowns initially
function populateAllDropdowns() {
  // Get all unique values from the table
  const namesSet = new Set();
  const projectsSet = new Set();
  const managersSet = new Set();

  // Extract unique values from all rows
  allTableRows.forEach((row) => {
    // Get cells by their respective header texts
    const nameCell = getCellByHeader(row, "Name");
    const projectCell = getCellByHeader(row, "Project Name");
    const managerCell = getCellByHeader(row, "Manager Name");

    if (nameCell) {
      const nameText = getCellText(nameCell);
      if (nameText) namesSet.add(nameText);
    }

    if (projectCell) {
      const projectText = getCellText(projectCell);
      if (projectText) projectsSet.add(projectText);
    }

    if (managerCell) {
      const managerText = getCellText(managerCell);
      if (managerText && managerText !== "N/A") managersSet.add(managerText);
    }
  });

  // Convert sets to sorted arrays
  const sortedNames = Array.from(namesSet).sort();
  const sortedProjects = Array.from(projectsSet).sort();
  const sortedManagers = Array.from(managersSet).sort();

  // Populate dropdowns
  populateDropdown("nameFilter", sortedNames);
  populateDropdown("projectFilter", sortedProjects);
  populateDropdown("managerFilter", sortedManagers);
}

// Helper function to populate a dropdown with options
function populateDropdown(dropdownId, options) {
  const dropdown = document.getElementById(dropdownId);

  // Clear existing options except the first one (All)
  while (dropdown.options.length > 1) {
    dropdown.remove(1);
  }

  // Add new options
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    dropdown.appendChild(optionElement);
  });
}

// Function to update the name dropdown based on project and manager selections
function updateNameDropdown(selectedProject, selectedManager) {
  // Get all eligible employee names based on current filters
  const eligibleNames = new Set();

  allTableRows.forEach((row) => {
    // Get cells by their respective header texts
    const nameCell = getCellByHeader(row, "Name");
    const projectCell = getCellByHeader(row, "Project Name");
    const managerCell = getCellByHeader(row, "Manager Name");

    if (!nameCell || !projectCell || !managerCell) return;

    const name = getCellText(nameCell);
    const project = getCellText(projectCell);
    const manager = getCellText(managerCell);

    // Check if this row matches the current project and manager filters
    const projectMatch = !selectedProject || project === selectedProject;
    const managerMatch = !selectedManager || manager === selectedManager;

    // If both match, add the name to eligible names
    if (projectMatch && managerMatch) {
      eligibleNames.add(name);
    }
  });

  // Convert set to sorted array
  const sortedNames = Array.from(eligibleNames).sort();

  // Update dropdown with eligible names
  populateDropdown("nameFilter", sortedNames);

  // If current selection is not in the new options, reset to "All"
  const nameDropdown = document.getElementById("nameFilter");
  if (nameDropdown.value && !eligibleNames.has(nameDropdown.value)) {
    nameDropdown.value = "";
  }
}

// Function to update the project dropdown based on name and manager selections
function updateProjectDropdown(selectedName, selectedManager) {
  // Get all eligible projects based on current filters
  const eligibleProjects = new Set();

  allTableRows.forEach((row) => {
    // Get cells by their respective header texts
    const nameCell = getCellByHeader(row, "Name");
    const projectCell = getCellByHeader(row, "Project Name");
    const managerCell = getCellByHeader(row, "Manager Name");

    if (!nameCell || !projectCell || !managerCell) return;

    const name = getCellText(nameCell);
    const project = getCellText(projectCell);
    const manager = getCellText(managerCell);

    // Check if this row matches the current name and manager filters
    const nameMatch = !selectedName || name === selectedName;
    const managerMatch = !selectedManager || manager === selectedManager;

    // If both match, add the project to eligible projects
    if (nameMatch && managerMatch) {
      eligibleProjects.add(project);
    }
  });

  // Convert set to sorted array
  const sortedProjects = Array.from(eligibleProjects).sort();

  // Update dropdown with eligible projects
  populateDropdown("projectFilter", sortedProjects);

  // If current selection is not in the new options, reset to "All"
  const projectDropdown = document.getElementById("projectFilter");
  if (projectDropdown.value && !eligibleProjects.has(projectDropdown.value)) {
    projectDropdown.value = "";
  }
}

// Function to update the manager dropdown based on name and project selections
function updateManagerDropdown(selectedName, selectedProject) {
  // Get all eligible managers based on current filters
  const eligibleManagers = new Set();

  allTableRows.forEach((row) => {
    // Get cells by their respective header texts
    const nameCell = getCellByHeader(row, "Name");
    const projectCell = getCellByHeader(row, "Project Name");
    const managerCell = getCellByHeader(row, "Manager Name");

    if (!nameCell || !projectCell || !managerCell) return;

    const name = getCellText(nameCell);
    const project = getCellText(projectCell);
    const manager = getCellText(managerCell);

    // Skip N/A managers
    if (manager === "N/A") return;

    // Check if this row matches the current name and project filters
    const nameMatch = !selectedName || name === selectedName;
    const projectMatch = !selectedProject || project === selectedProject;

    // If both match, add the manager to eligible managers
    if (nameMatch && projectMatch) {
      eligibleManagers.add(manager);
    }
  });

  // Convert set to sorted array
  const sortedManagers = Array.from(eligibleManagers).sort();

  // Update dropdown with eligible managers
  populateDropdown("managerFilter", sortedManagers);

  // If current selection is not in the new options, reset to "All"
  const managerDropdown = document.getElementById("managerFilter");
  if (managerDropdown.value && !eligibleManagers.has(managerDropdown.value)) {
    managerDropdown.value = "";
  }
}

// Function to apply all filters to the table
function applyAllFilters() {
  const nameFilter = document.getElementById("nameFilter").value;
  const projectFilter = document.getElementById("projectFilter").value;
  const managerFilter = document.getElementById("managerFilter").value;

  // Get tbody element
  const tbody = document.querySelector("#dataTable tbody");

  // Clear the table body
  tbody.innerHTML = "";

  // Filter and add rows that match criteria
  allTableRows.forEach((row) => {
    // Get cells by their respective header texts
    const nameCell = getCellByHeader(row, "Name");
    const projectCell = getCellByHeader(row, "Project Name");
    const managerCell = getCellByHeader(row, "Manager Name");

    if (!nameCell || !projectCell || !managerCell) return;

    const name = getCellText(nameCell);
    const project = getCellText(projectCell);
    const manager = getCellText(managerCell);

    // Check if all active filters match
    const nameMatch = !nameFilter || name === nameFilter;
    const projectMatch = !projectFilter || project === projectFilter;
    const managerMatch = !managerFilter || manager === managerFilter;

    // Show row only if all active filters match
    if (nameMatch && projectMatch && managerMatch) {
      // Clone the row and add it to the table
      const newRow = row.cloneNode(true);
      tbody.appendChild(newRow);
    }
  });

  // Attach event listeners to the newly added rows' buttons
  reattachRowEventHandlers();

  // Show message if no results found
  if (tbody.children.length === 0) {
    const messageRow = document.createElement("tr");
    messageRow.id = "noResultsMessage";
    messageRow.innerHTML = `<td colspan="18" class="no-results">No matching records found</td>`;
    tbody.appendChild(messageRow);
  }

  // Update row numbers for serial column
  updateRowNumbers();

  // Apply the current visibility state to the table
  const toggleColumns = window.toggleColumns;
  if (typeof toggleColumns === "function") {
    toggleColumns();
  }
}

// Function to clear all filters and reset dropdowns
function clearAllFilters() {
  // Reset all dropdowns to "All"
  document.getElementById("nameFilter").value = "";
  document.getElementById("projectFilter").value = "";
  document.getElementById("managerFilter").value = "";

  // Reset all dropdown options to include all values
  populateAllDropdowns();

  // Restore all original rows to the table
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  allTableRows.forEach((row) => {
    tbody.appendChild(row.cloneNode(true));
  });

  // Reattach event handlers to buttons
  reattachRowEventHandlers();

  // Update row numbers
  updateRowNumbers();

  // Apply the current visibility state to the table
  const toggleColumns = window.toggleColumns;
  if (typeof toggleColumns === "function") {
    toggleColumns();
  }
}

// Function to reattach event handlers to row buttons after filtering
function reattachRowEventHandlers() {
  // Get all edit buttons in the current table
  const editButtons = document.querySelectorAll("#dataTable .editBtn");
  const updateButtons = document.querySelectorAll("#dataTable .updateBtn");
  const cancelButtons = document.querySelectorAll("#dataTable .cancelBtn");
  const deleteButtons = document.querySelectorAll("#dataTable .deleteBtn");

  // Reattach event handlers
  editButtons.forEach((button) => {
    button.onclick = function () {
      editRow(this);
    };
  });

  updateButtons.forEach((button) => {
    button.onclick = function () {
      updateRow(this);
    };
  });

  cancelButtons.forEach((button) => {
    button.onclick = function () {
      cancelRow(this);
    };
  });

  deleteButtons.forEach((button) => {
    button.onclick = function () {
      deleteRow(this);
    };
  });
}

// Function to update row numbers in the serial number column
function updateRowNumbers() {
  const rows = document.querySelectorAll(
    "#dataTable tbody tr:not(#noResultsMessage)"
  );
  rows.forEach((row, index) => {
    const serialCell = row.querySelector("td:first-child");
    if (serialCell) {
      serialCell.textContent = index + 1;
    }
  });
}

// Initialize the filters after the page has loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wait for the window.onload function to complete (which loads the table data)
  setTimeout(() => {
    initializeDropdownFilters();
  }, 1000); // Slight delay to ensure table is populated
});

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

function setTemplateDropdownValue(row, currentTemplate) {
  const templateDropdown = row.querySelector("select[name='template_no']");
  if (!templateDropdown) return;
  
  // Ensure the dropdown is visible first
  templateDropdown.style.display = "inline-block";
  
  // Make sure the dropdown has options
  if (templateDropdown.options.length === 0) {
    console.error("No options in template dropdown");
    return;
  }
  
  // Log current state for debugging
  console.log("Setting template dropdown to:", currentTemplate);
  console.log("Available options:", Array.from(templateDropdown.options).map(o => o.value));
  
  // Try direct value matching first
  let foundMatch = false;
  for (let i = 0; i < templateDropdown.options.length; i++) {
    const option = templateDropdown.options[i];
    if (option.value === currentTemplate) {
      templateDropdown.selectedIndex = i;
      foundMatch = true;
      console.log("Direct match found at index", i);
      break;
    }
  }
  
  // If no direct match, try without any potential whitespace
  if (!foundMatch) {
    const cleanTemplate = currentTemplate.replace(/\s+/g, '');
    for (let i = 0; i < templateDropdown.options.length; i++) {
      const optionValue = templateDropdown.options[i].value.replace(/\s+/g, '');
      if (optionValue === cleanTemplate) {
        templateDropdown.selectedIndex = i;
        foundMatch = true;
        console.log("Whitespace-normalized match found at index", i);
        break;
      }
    }
  }
  
  // Last resort: try case-insensitive matching
  if (!foundMatch) {
    const lowerTemplate = currentTemplate.toLowerCase();
    for (let i = 0; i < templateDropdown.options.length; i++) {
      if (templateDropdown.options[i].value.toLowerCase() === lowerTemplate) {
        templateDropdown.selectedIndex = i;
        console.log("Case-insensitive match found at index", i);
        break;
      }
    }
  }
}

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


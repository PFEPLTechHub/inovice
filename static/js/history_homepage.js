// history homepage.js
let originalData = [];
let filterState = {}; // Dictionary to store filter states for each month
let allMonths = [];
let allInvoices = [];
let fullData = [];
let showDuplicates = false;
let currentMonth = "";
window.onload = function () {
  console.log("Window Loaded!");
  currentMonth = ""; // Ensure no month is preselected
  document.getElementById("monthPicker").value = ""; // Set the picker to empty
  initEmployeeDropdown();
  fetchData(); // Fetch the initial data without filtering by month
};

function fetchData() {
  console.log("Fetching initial data...");
  fetch("/history_homepage_initial_data")
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received:", data);
      originalData = data.history_list;
      allMonths = data.all_months;
      allInvoices = data.all_invoices;
      populateTable(originalData);
      populateFilters(originalData);
    })
    .catch((error) => console.error("Error fetching history:", error));
}

function initEmployeeDropdown() {
  const sel = document.getElementById('employeeFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">All Employees (FY-to-date)</option>';
  fetch('/history_employees')
    .then(r => r.json())
    .then(list => {
      list.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = emp.name;
        sel.appendChild(opt);
      });
    })
    .catch(err => console.error('Error loading employees:', err));

  sel.addEventListener('change', function() {
    const employeeId = this.value;
    if (employeeId) {
      fetchFYForEmployee(employeeId);
    } else {
      // Reset to initial listing when cleared
      fetchData();
    }
  });
}

function fetchFYForEmployee(employeeId) {
  // Request FY-to-date (April 1 current FY to today) for given employee
  fetch('/history_employee_fy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId })
  })
  .then(r => r.json())
  .then(data => {
    // Sort by month_date then by invoice_no to check sequence easier
    const sorted = data.history_list.sort((a, b) => {
      if (a.month_date !== b.month_date) return a.month_date.localeCompare(b.month_date);
      // If invoice numbers are numeric-like, compare numerically; fallback to string
      const ai = parseInt(a.invoice_no, 10);
      const bi = parseInt(b.invoice_no, 10);
      if (!isNaN(ai) && !isNaN(bi)) return ai - bi;
      return String(a.invoice_no).localeCompare(String(b.invoice_no));
    });
    originalData = sorted;
    fullData = sorted;
    populateTable(sorted);
    populateFilters(sorted);
  })
  .catch(err => console.error('Error fetching FY history for employee:', err));
}

function populateTable(data) {
  console.log("Populating table with data:", data);
  let tableBody = document.getElementById("historyTableBody");
  tableBody.innerHTML = "";
  let serialNo = 1;

  data.forEach((item) => {
    console.log("Processing item:", item);
    // Check if this entry was flagged as having an irregular location
    const rowClass = item.location_irregular ? "irregular-location" : "";
    let row = `<tr class="${rowClass}" title="${item.location_irregular ? 'Generated from unexpected location' : ''}">
  <td>${serialNo}</td>
  <td>${item.invoice_no}</td>
  <td>${item.month_date}</td>
  <td>${item.contract_employee_name}</td>
  <td>${item.manager_name}</td>
  <td>${item.date}</td>
</tr>`;
    tableBody.innerHTML += row;
    serialNo++;
  });
}

function populateFilters(data) {
  console.log("Populating filters with data:", data);
  let filtersRow = document.getElementById("filtersRow");
  let columns = [
    "invoice_no",
    "month_date",
    "contract_employee_name",
    "manager_name",
  ];

  filtersRow.innerHTML = "<td></td>"; // Empty first cell for serial number

  columns.forEach((col) => {
    let uniqueValues = [...new Set(data.map((item) => item[col]))].sort();
    let currentSelection = filterState[currentMonth]?.[col] || "";

    let filterDropdown = `<select onchange="filterTable('${col}', this.value)"> 
            <option value="">All</option>
            ${uniqueValues
              .map(
                (value) =>
                  `<option value="${value}" ${
                    value === currentSelection ? "selected" : ""
                  }>${value}</option>`
              )
              .join("")}
        </select>`;

    filtersRow.innerHTML += `<td>${filterDropdown}</td>`;
  });

  // Handle date filtering: Show only unique dates but keep full timestamp for filtering
  let dateMap = new Map();
  data.forEach((item) => {
    let dateOnly = item.date.split(" ")[0]; // Extract only the date (YYYY-MM-DD)
    if (!dateMap.has(dateOnly)) {
      dateMap.set(dateOnly, item.date); // Store the first occurrence with the full timestamp
    }
  });

  let currentDateSelection = filterState[currentMonth]?.date || "";

  let dateDropdown = `<select onchange="filterTable('date', this.value)"> 
        <option value="">All</option>
        ${[...dateMap.entries()]
          .map(
            ([dateOnly, timestamp]) =>
              `<option value="${timestamp}" ${
                timestamp === currentDateSelection ? "selected" : ""
              }>
                ${dateOnly} <!-- Show only date, hide duplicate times -->
            </option>`
          )
          .join("")}
    </select>`;

  filtersRow.innerHTML += `<td>${dateDropdown}</td>`;
}

function filterTable(column, value) {
  console.log(`Filtering by ${column}:`, value);
  if (!filterState[currentMonth]) {
    filterState[currentMonth] = {};
  }

  // Update filter state
  filterState[currentMonth][column] = value === "" ? "" : value;

  // Filter data based on current selections
  let filteredData = originalData.filter((item) => {
    return Object.keys(filterState[currentMonth]).every((key) => {
      return (
        filterState[currentMonth][key] === "" ||
        item[key] == filterState[currentMonth][key]
      );
    });
  });

  console.log("Filtered data:", filteredData);
  populateTable(filteredData);
  populateFilters(filteredData); // Update dropdowns with new available values
}

function toggleDuplicates() {
  let button = document.getElementById("toggleButton");

  // Check if any month is selected
  if (!filterState[currentMonth]) {
    filterState[currentMonth] = {};
  }

  // Global "Hide Duplicates" mode
  if (filterState[currentMonth].selected_button === "true") {
    // Hide duplicates for ALL months
    for (let month in filterState) {
      filterState[month].selected_button = "";
    }
    button.textContent = "Show Duplicates";
  } else {
    // Show duplicates for the current month
    filterState[currentMonth].selected_button = "true";
    button.textContent = "Hide Duplicates";
  }

  console.log("Updated filterState:", filterState);
  fetchFilteredData();
}

function selectMonth() {
  let monthPicker = document.getElementById("monthPicker").value;
  console.log("Selected Month:", monthPicker);

  // Save current filters before changing month
  if (currentMonth) {
    filterState[currentMonth] = { ...filterState[currentMonth] };
  }

  currentMonth = monthPicker;

  // Only fetch new data when a month is selected
  if (monthPicker === "") {
    fetchData();
  } else {
    fetchFilteredData();
  }

  // Ensure the button state is correctly updated
  updateToggleButton();
}

function updateToggleButton() {
  let button = document.getElementById("toggleButton");

  if (
    filterState[currentMonth] &&
    filterState[currentMonth].selected_button === "true"
  ) {
    button.textContent = "Hide Duplicates";
  } else {
    button.textContent = "Show Duplicates";
  }
}

function fetchFilteredData() {
  console.log("Fetching filtered data with:", filterState[currentMonth]);
  fetch("/get_history_month_filtered_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month: currentMonth, ...filterState[currentMonth] }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Filtered data received:", data);
      fullData = data;
      originalData = data;
      populateTable(data);
      populateFilters(fullData);
    })
    .catch((error) => console.error("Error fetching filtered data:", error));
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


function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("mainContent");
  sidebar.classList.toggle("open");
  content.classList.toggle("shifted");
}
window.addEventListener("DOMContentLoaded", function() {
  // Add legend for irregular location rows
  const tableContainer = document.querySelector(".table-responsive");
  if (tableContainer) {
    const legend = document.createElement("div");
    legend.className = "alert alert-info mt-3";
    legend.innerHTML = '<i class="fas fa-info-circle"></i> <strong>Note:</strong> Rows highlighted in <span class="text-danger">red</span> indicate invoices generated from unexpected locations.';
    tableContainer.parentNode.insertBefore(legend, tableContainer.nextSibling);
  }
});
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

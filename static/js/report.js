$(document).ready(function () {
  // Initialize date pickers for month and year only
  $("#start-month-picker, #end-month-picker").datepicker({
    format: "mm/yyyy",
    startView: "months",
    minViewMode: "months",
    autoclose: true,
  });

  // Set default date values (current month)
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentYear = currentDate.getFullYear();
  const defaultDate = `${currentMonth}/${currentYear}`;

  $("#start-month-picker").datepicker("setDate", defaultDate);
  $("#end-month-picker").datepicker("setDate", defaultDate);

  // Generate report on button click
  $("#generate-report").click(function () {
    fetchReportData();
  });

  // Initial data load
  fetchReportData();

  function fetchReportData() {
    const startDate = $("#start-month-picker").val();
    const endDate = $("#end-month-picker").val();

    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    // Show loading indicator
    $("#report-data").html(
      '<tr><td colspan="10" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>'
    );

    // AJAX call to get report data
    $.ajax({
      url: "/sidebar",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
      success: function (response) {
        if (response.success) {
          displayReportData(response.data);
        } else {
          $("#report-data").html(
            '<tr><td colspan="10" class="text-center text-danger">Error loading data</td></tr>'
          );
          console.error("Error:", response.message);
        }
      },
      error: function (xhr, status, error) {
        $("#report-data").html(
          '<tr><td colspan="10" class="text-center text-danger">Error loading data</td></tr>'
        );
        console.error("AJAX Error:", error);
      },
    });
  }

  function displayReportData(data) {
    if (!data || data.length === 0) {
      $("#report-data").html(
        '<tr><td colspan="10" class="text-center">No data found for the selected period</td></tr>'
      );
      return;
    }

    let tableContent = "";
    data.forEach(function (item) {
      // Format the month display
      let formattedMonth = "";
      if (item.month) {
        // Assuming month format is "YYYY-MM"
        const parts = item.month.split('-');
        if (parts.length === 2) {
          const year = parts[0];
          const monthNum = parseInt(parts[1], 10);
          
          // Convert month number to month name
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          
          // Month numbers are 1-12, but array indices are 0-11
          const monthName = monthNames[monthNum - 1] || "";
          formattedMonth = `${year}-${monthName}`;
        } else {
          formattedMonth = item.month; // Fallback to original if format is unexpected
        }
      }
      
      tableContent += `
    <tr>
        <td>${formattedMonth}</td>
        <td>${item.employee_name || ""}</td>
        <td>${item.payable_days || 0}</td>
        <td>${item.food_amount || 0}</td>
        <td>${item.project_name || ""}</td>
        <td>${item.last_invoice_number || ""}</td>
        <td>${item.total_payable || 0}</td>
        <td>${item.total_food || 0}</td>
        <td>${item.arrears_payable_days || 0}</td>
        <td>${item.total_amount || 0}</td>
        <td>${item.manager_name || ""}</td>
    </tr>
`;
    });

    $("#report-data").html(tableContent);
  }
  // Export to Excel functionality
  $("#export-excel").click(function () {
    const table = document.getElementById("report-table");

    // Convert table to worksheet
    const ws = XLSX.utils.table_to_sheet(table);

    // Loop over all rows and set month_date column (index 0-based)
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const monthDateColIndex = 0; // Change if month is not first column

    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({
        r: R,
        c: monthDateColIndex,
      });
      const cell = ws[cellAddress];
      if (cell && typeof cell.v === "string") {
        // Force format as text
        cell.t = "s";
      }
    }

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    const now = new Date();
    const filename = `Employee_Report_${now.getFullYear()}_${
      now.getMonth() + 1
    }.xlsx`;

    XLSX.writeFile(wb, filename);
  });
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
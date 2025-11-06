// static/js/reports.js
document.addEventListener("DOMContentLoaded", function () {
  // Current date for defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // JavaScript months are 0-indexed

  // Calculate default start date (3 months back)
  let startMonth = currentMonth ;
  let startYear = currentYear;
  if (startMonth < 0) {
    startMonth += 12;
    startYear -= 1;
  }

  // Month names array for display
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Initialize date displays
  updateDateDisplay("start", startMonth + 1, startYear);
  updateDateDisplay("end", currentMonth + 1, currentYear);

  // Initialize month and year pickers
  initializeMonthYearPicker(
    "#start-date-container",
    startMonth,
    startYear,
    "start"
  );
  initializeMonthYearPicker(
    "#end-date-container",
    currentMonth,
    currentYear,
    "end"
  );

  // Show/hide date pickers on click
  document
    .getElementById("start-date-display")
    .addEventListener("click", function () {
      toggleDatePicker("start-date-container");
    });

  document
    .getElementById("end-date-display")
    .addEventListener("click", function () {
      toggleDatePicker("end-date-container");
    });

  // Close date pickers when clicking outside
  document.addEventListener("click", function (event) {
    const startPicker = document.getElementById("start-date-container");
    const endPicker = document.getElementById("end-date-container");
    const startInput = document.getElementById("start-date-display");
    const endInput = document.getElementById("end-date-display");

    if (
      !startInput.contains(event.target) &&
      !startPicker.contains(event.target)
    ) {
      startPicker.style.display = "none";
    }

    if (!endInput.contains(event.target) && !endPicker.contains(event.target)) {
      endPicker.style.display = "none";
    }
  });

  // Function to toggle date picker visibility
  function toggleDatePicker(containerId) {
    const container = document.getElementById(containerId);
    const isVisible = container.style.display === "block";

    // Hide all date pickers first
    document.querySelectorAll(".month-year-picker").forEach((el) => {
      el.style.display = "none";
    });

    // Toggle this date picker
    container.style.display = isVisible ? "none" : "block";
  }

  // Function to update the display of the date input
  function updateDateDisplay(prefix, month, year) {
    document.getElementById(`${prefix}-date-display`).value = `${month
      .toString()
      .padStart(2, "0")}/${year}`;
  }

  // Function to initialize month year picker
  function initializeMonthYearPicker(
    containerId,
    defaultMonth,
    defaultYear,
    inputPrefix
  ) {
    const container = document.querySelector(containerId);
    const monthContainer = container.querySelector(".month-grid");
    const yearDisplay = container.querySelector(".year-display");
    const prevYearBtn = container.querySelector(".prev-year");
    const nextYearBtn = container.querySelector(".next-year");

    // Set hidden fields
    document.getElementById(`${inputPrefix}-month`).value = defaultMonth + 1;
    document.getElementById(`${inputPrefix}-year`).value = defaultYear;

    // Initialize display
    yearDisplay.textContent = defaultYear;

    // Function to update active month - reusable for both initialization and click events
    function updateActiveMonth(monthIndex) {
      // First clear all active classes
      const months = monthContainer.querySelectorAll(".month-btn");
      months.forEach((m) => m.classList.remove("active"));
      
      // Then set active class on the target month
      if (monthIndex >= 0 && monthIndex < months.length) {
        months[monthIndex].classList.add("active");
      }
    }

    // Set active month initially
    updateActiveMonth(defaultMonth);

    // Add click events to month buttons
    const months = monthContainer.querySelectorAll(".month-btn");
    months.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        // Update active month
        updateActiveMonth(index);
        
        // Update hidden month input
        const monthNum = index + 1;
        document.getElementById(`${inputPrefix}-month`).value = monthNum;

        // Update display and hide picker
        updateDateDisplay(inputPrefix, monthNum, yearDisplay.textContent);
        container.style.display = "none";
      });
    });

    // Year navigation buttons
    prevYearBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      const currentYear = parseInt(yearDisplay.textContent);
      const newYear = currentYear - 1;
      yearDisplay.textContent = newYear;
      document.getElementById(`${inputPrefix}-year`).value = newYear;

      // Update display
      const currentMonth = parseInt(
        document.getElementById(`${inputPrefix}-month`).value
      );
      updateDateDisplay(inputPrefix, currentMonth, newYear);
    });

    nextYearBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      const currentYear = parseInt(yearDisplay.textContent);
      const newYear = currentYear + 1;
      yearDisplay.textContent = newYear;
      document.getElementById(`${inputPrefix}-year`).value = newYear;

      // Update display
      const currentMonth = parseInt(
        document.getElementById(`${inputPrefix}-month`).value
      );
      updateDateDisplay(inputPrefix, currentMonth, newYear);
    });
  }

  // Chart instance
  let costChart = null;

  // Store the latest report data
  let currentReportData = null;

  // Event listener for generate report button
  document
    .getElementById("generate-report")
    .addEventListener("click", generateReport);

  // Event listener for export to Excel button
  document
    .getElementById("export-excel")
    .addEventListener("click", exportToExcel);

  // Generate report on page load with default values
  generateReport();

  // Function to generate the report
  function generateReport() {
    const startMonth = document.getElementById("start-month").value;
    const startYear = document.getElementById("start-year").value;
    const endMonth = document.getElementById("end-month").value;
    const endYear = document.getElementById("end-year").value;

    // Validate date range
    if (new Date(startYear, startMonth - 1) > new Date(endYear, endMonth - 1)) {
      alert("Start date cannot be after end date.");
      return;
    }

    // Show loading state
    document.getElementById("loading-indicator").style.display = "block";
    document.getElementById("export-excel").disabled = true;

    // Fetch report data
    fetch("/api/report-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_month: startMonth,
        start_year: startYear,
        end_month: endMonth,
        end_year: endYear,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Store the data for Excel export
        currentReportData = data;

        // Populate table
        populateTable(data);

        // Update chart
        updateChart(data.chart_data);

        // Enable export button if we have data
        document.getElementById("export-excel").disabled =
          data.table_data.length === 0;

        // Hide loading indicator
        document.getElementById("loading-indicator").style.display = "none";
      })
      .catch((error) => {
        console.error("Error fetching report data:", error);
        alert("Failed to fetch report data. Please try again.");
        document.getElementById("loading-indicator").style.display = "none";
      });
  }

  // Function to populate the table
  function populateTable(data) {
    const tableHead = document.getElementById("report-table-head");
    const tableBody = document.getElementById("report-table-body");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (data.table_data.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="100%" class="text-center">No data available for the selected date range.</td>`;
      tableBody.appendChild(row);
      return;
    }

    const months = data.months; // e.g. ['Jan 2024', 'Feb 2024']
    const headerRow = document.createElement("tr");

    headerRow.innerHTML = `<th>Project Name</th>`;
    months.forEach((month) => {
      headerRow.innerHTML += `<th>${month} Count</th><th>${month} Cost</th>`;
    });
    headerRow.innerHTML += `<th>Total Count</th><th>Total Cost</th>`;
    tableHead.appendChild(headerRow);

    data.table_data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.project_name}</td>`;

      months.forEach((month) => {
        const monthKey = month; // e.g. "January 2024"
        const count = item.monthly_data[monthKey]?.count || 0;
        const cost = item.monthly_data[monthKey]?.cost || 0;
        row.innerHTML += `<td>${count}</td><td>₹${cost.toFixed(2)}</td>`;
      });

      row.innerHTML += `<td>${
        item.total_count
      }</td><td>₹${item.total_cost.toFixed(2)}</td>`;
      tableBody.appendChild(row);
    });

    // Add totals row if there's data
    if (data.table_data.length > 0) {
      const totalsRow = document.createElement("tr");
      totalsRow.className = "table-dark";
      totalsRow.innerHTML = `<td><strong>TOTALS</strong></td>`;

      // Calculate column totals for each month
      months.forEach((month) => {
        let monthCount = 0;
        let monthCost = 0;

        data.table_data.forEach((item) => {
          if (item.monthly_data[month]) {
            monthCount += item.monthly_data[month].count || 0;
            monthCost += item.monthly_data[month].cost || 0;
          }
        });

        totalsRow.innerHTML += `<td><strong>${monthCount}</strong></td><td><strong>₹${monthCost.toFixed(
          2
        )}</strong></td>`;
      });

      // Add overall totals
      totalsRow.innerHTML += `<td><strong>${data.total_count}</strong></td>
                             <td><strong>₹${data.total_cost.toFixed(
                               2
                             )}</strong></td>`;
      tableBody.appendChild(totalsRow);
    }
  }

  // Function to update the chart
  function updateChart(chartData) {
    const ctx = document.getElementById("costChart").getContext("2d");

    // Destroy previous chart if it exists
    if (costChart) {
      costChart.destroy();
    }

    // Extract months and costs for chart
    const months = chartData.map((item) => item.month);
    const costs = chartData.map((item) => item.total_cost);

    // Create new chart
    costChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Total Cost by Month (₹)",
            data: costs,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Cost (₹)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      },
    });
  }

// Function to export table data to Excel with embedded chart
async function exportToExcel() {
  if (!currentReportData || currentReportData.table_data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Format dates for filename
  const startMonthIdx = parseInt(document.getElementById("start-month").value) - 1;
  const endMonthIdx = parseInt(document.getElementById("end-month").value) - 1;
  const startYear = document.getElementById("start-year").value;
  const endYear = document.getElementById("end-year").value;
  
  const fileName = `Site_Report_${monthNames[startMonthIdx]}_${startYear}_to_${monthNames[endMonthIdx]}_${endYear}.xlsx`;

  // Create a new workbook using ExcelJS
  const workbook = new ExcelJS.Workbook();
  
  // Add a worksheet for the data
  const worksheet = workbook.addWorksheet('Site Report Chart');
  
  // Create header row
  const headers = ["Project Name"];
  currentReportData.months.forEach((month) => {
    headers.push(`${month} Count`);
    headers.push(`${month} Cost`);
  });
  headers.push("Total Count", "Total Cost");
  
  // Add header row
  worksheet.addRow(headers);
  
  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F81BD' }
  };
  headerRow.font = { color: { argb: 'FFFFFF' }, bold: true };
  
  // Add data rows
  currentReportData.table_data.forEach((item) => {
    const row = [item.project_name];

    currentReportData.months.forEach((month) => {
      const monthData = item.monthly_data[month] || { count: 0, cost: 0 };
      row.push(monthData.count || 0);
      row.push(monthData.cost || 0);
    });

    row.push(item.total_count);
    row.push(item.total_cost);

    worksheet.addRow(row);
  });
  
  // Add totals row
  const totalsRowData = ["TOTALS"];
  currentReportData.months.forEach((month) => {
    let monthCount = 0;
    let monthCost = 0;

    currentReportData.table_data.forEach((item) => {
      if (item.monthly_data[month]) {
        monthCount += item.monthly_data[month].count || 0;
        monthCost += item.monthly_data[month].cost || 0;
      }
    });

    totalsRowData.push(monthCount);
    totalsRowData.push(monthCost);
  });

  totalsRowData.push(currentReportData.total_count);
  totalsRowData.push(currentReportData.total_cost);
  
  const totalsRow = worksheet.addRow(totalsRowData);
  totalsRow.font = { bold: true };
  totalsRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4F81BD' }
  };
  totalsRow.font = { color: { argb: 'FFFFFF' }, bold: true };
  
  // Format currency cells
  for (let i = 1; i <= worksheet.rowCount; i++) {
    for (let j = 1; j <= worksheet.columnCount; j++) {
      const cell = worksheet.getCell(i, j);
      
      // First column is employee name (no formatting)
      if (j === 1) continue;
      
      // Adjusted logic: columns 2, 4, 6... (even if you count from 0)
      if ((j - 1) % 2 === 1) {
        // This is a count column (no currency symbol)
        cell.numFmt = '#,##0';
      } else {
        // This is a payment column (with ₹ symbol)
        cell.numFmt = '₹#,##0.00';
      }
    }
  }
  
  
  // Auto-size columns
  worksheet.columns.forEach(column => {
    column.width = Math.max(12, headers[column.number - 1]?.length || 12);
  });
  
  // Add a chart worksheet
  const chartSheet = workbook.addWorksheet('Chart');
  
  // Get the chart as an image
  if (costChart) {
    // Convert chart to image data URL
    const chartCanvas = document.getElementById("costChart");
    const chartImage = chartCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    
    // Add the image to the worksheet
    const imageId = workbook.addImage({
      base64: chartImage,
      extension: 'png',
    });
    
    // Add the image to the worksheet
    chartSheet.addImage(imageId, {
      tl: { col: 0.5, row: 0.5 },
      ext: { width: 800, height: 400 }
    });
    
    // Add a title to the chart sheet
    chartSheet.addRow(['Site Report Chart']);
    const titleRow = chartSheet.getRow(1);
    titleRow.font = { bold: true, size: 16 };
    titleRow.height = 30;
  }
  
  // Write the workbook to a buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create a Blob from the buffer
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
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
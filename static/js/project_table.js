let managers = [];

async function fetchManagers() {
  try {
    const response = await fetch("/get_managers");
    managers = await response.json();
  } catch (error) {
    console.error("Error fetching managers:", error);
  }
}

async function fetchProjects() {
  try {
    await fetchManagers();
    const response = await fetch("/get_projects");
    const projects = await response.json();

    const tableBody = document.querySelector("#projectsTable tbody");
    tableBody.innerHTML = "";

    projects.forEach((project) => {
      const managerOptions = managers
        .map(
          (manager) =>
            `<option value="${manager.manager_id}" ${
              parseInt(manager.manager_id) === parseInt(project.manager_id)
                ? "selected"
                : ""
            }>
                            ${manager.manager_name}
                        </option>`
        )
        .join("");

      const row = document.createElement("tr");
      row.innerHTML = `
                        <td>${project.project_name}</td>
                        <td>${project.project_address}</td>
                        <td>
                            <span id="manager-text-${project.project_id}">${
        managers.find((m) => m.manager_id == project.manager_id)
          ?.manager_name || "Unknown"
      }</span>
                            <select id="manager-select-${
                              project.project_id
                            }" style="display: none;">
                                ${managerOptions}
                            </select>
                        </td>
                        <td>
                            <button onclick="enableEdit(${
                              project.project_id
                            })" id="edit-btn-${
        project.project_id
      }" class="edit-button">Edit</button>
                            <button onclick="updateManager(${
                              project.project_id
                            })" id="update-btn-${
        project.project_id
      }" class="update-button" style="display: none;">Update</button>
                            <button onclick="cancelEdit(${
                              project.project_id
                            })" id="cancel-btn-${
        project.project_id
      }" class="cancel-button" style="display: none;">Cancel</button>
                        </td>
                    `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

function enableEdit(projectId) {
  document.getElementById(`manager-text-${projectId}`).style.display = "none";
  document.getElementById(`manager-select-${projectId}`).style.display =
    "inline";
  document.getElementById(`edit-btn-${projectId}`).style.display = "none";
  document.getElementById(`update-btn-${projectId}`).style.display = "inline";
  document.getElementById(`cancel-btn-${projectId}`).style.display = "inline";
}

function cancelEdit(projectId) {
  document.getElementById(`manager-text-${projectId}`).style.display = "inline";
  document.getElementById(`manager-select-${projectId}`).style.display = "none";
  document.getElementById(`edit-btn-${projectId}`).style.display = "inline";
  document.getElementById(`update-btn-${projectId}`).style.display = "none";
  document.getElementById(`cancel-btn-${projectId}`).style.display = "none";
}

async function updateManager(projectId) {
  const selectElement = document.getElementById(`manager-select-${projectId}`);
  const newManagerId = selectElement.value;

  try {
    const response = await fetch("/update_project_manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, manager_id: newManagerId }),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message);
      fetchProjects();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error updating manager:", error);
  }
}

window.onload = fetchProjects;

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

// Add this function to generate Excel
function generateExcel() {
  try {
    // Get the projects table data
    const table = document.getElementById("projectsTable");
    const rows = table.querySelectorAll("tbody tr");
    
    // Create data array for Excel
    const data = [];
    
    // Add header row
    data.push(["Project Name", "Project Address", "Manager Name"]);
    
    // Add data rows
    rows.forEach(row => {
      const projectName = row.cells[0].textContent;
      const projectAddress = row.cells[1].textContent;
      const managerName = row.cells[2].querySelector("span").textContent;
      
      data.push([projectName, projectAddress, managerName]);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projects");
    
    // Generate Excel file and trigger download
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const fileName = `Projects_${dateStr}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
    
    alert("Excel file generated successfully!");
  } catch (error) {
    console.error("Error generating Excel file:", error);
    alert("Error generating Excel file. Please try again.");
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for the generate Excel button
  const generateExcelBtn = document.getElementById("generateExcelBtn");
  if (generateExcelBtn) {
    generateExcelBtn.addEventListener("click", generateExcel);
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

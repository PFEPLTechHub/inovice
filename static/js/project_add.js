// Load managers when page loads
document.addEventListener("DOMContentLoaded", loadManagers);

async function loadManagers() {
  try {
    const response = await fetch("get_managers1");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const managers = await response.json();

    const managerSelect = document.getElementById("manager_select");

    // Clear any existing options except the first one
    while (managerSelect.options.length > 1) {
      managerSelect.remove(1);
    }

    if (managers.length === 0) {
      document.getElementById("responseMessage").textContent =
        "No eligible managers found. Please add managers first.";
      document.getElementById("responseMessage").className = "error";
      return;
    }

    // Add managers to dropdown
    managers.forEach((manager) => {
      const option = document.createElement("option");
      option.value = manager.id; // This will be the managerinfo_uid
      option.textContent = manager.name;
      managerSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading managers:", error);
    document.getElementById("responseMessage").textContent =
      "Error loading managers. Please refresh the page.";
    document.getElementById("responseMessage").className = "error";
  }
}

document
  .getElementById("projectForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const project_name = document.getElementById("project_name").value.trim();
    const project_address = document
      .getElementById("project_address")
      .value.trim();
    const manager_select = document.getElementById("manager_select");
    const manager_id = manager_select.value;
    const responseMessage = document.getElementById("responseMessage");

    if (!project_name) {
      responseMessage.textContent = "Please enter a project name.";
      responseMessage.className = "error";
      return;
    }

    if (!project_address) {
      responseMessage.textContent = "Please enter a project address.";
      responseMessage.className = "error";
      return;
    }

    if (!manager_id) {
      responseMessage.textContent = "Please select a manager.";
      responseMessage.className = "error";
      return;
    }

    const projectData = {
      project_name,
      project_address,
      manager_id: parseInt(manager_id),
    };

    try {
      const response = await fetch("/add_project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (response.ok) {
        responseMessage.textContent = result.message;
        responseMessage.className = "success";
        // Reset form on success
        document.getElementById("projectForm").reset();
      } else {
        responseMessage.textContent = result.error;
        responseMessage.className = "error";
      }
    } catch (error) {
      responseMessage.textContent =
        "Error submitting the form. Please try again.";
      responseMessage.className = "error";
    }
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

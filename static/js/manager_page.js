// manager_page.js
document.addEventListener("DOMContentLoaded", function () {
  const managerContainer = document.getElementById("manager-container");
  const loader = document.getElementById("loader");
  const errorMessage = document.getElementById("error-message");
  
  // All available cities and managers data
  let allCities = [];
  let managersData = [];

  // Load data in parallel instead of sequentially
  Promise.all([
    fetchAllCities(),
    fetchManagersWithEmployees()
  ])
  .then(([cities, managers]) => {
    // Both data sets are now available
    allCities = cities;
    managersData = managers;
    
    // Create a lookup map for faster city access
    const cityLookupMap = createCityLookupMap(allCities);
    
    // Display managers with the city data already available
    displayManagersWithEmployees(managersData, cityLookupMap);
    
    // Hide loader when everything is ready
    loader.classList.add("d-none");
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    errorMessage.classList.remove("d-none");
    loader.classList.add("d-none");
  });

  // Create a map of coordinates to city objects for fast lookup
  function createCityLookupMap(cities) {
    const map = {};
    cities.forEach(city => {
      const normalizedCoords = normalizeCoords(city.coordinates);
      map[normalizedCoords] = city;
    });
    return map;
  }

  async function fetchManagersWithEmployees() {
    try {
      const response = await fetch("/get_managers_with_employees");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching managers:", error);
      throw error;
    }
  }
  
  async function fetchAllCities() {
    try {
      const response = await fetch("/get_all_cities");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  }

  function normalizeCoords(coords) {
    return coords?.trim().replace(/"/g, '').replace(/'/g, '') || '';
  }

  function displayManagersWithEmployees(managers, cityLookupMap) {
    if (managers.length === 0) {
      managerContainer.innerHTML = '<div class="alert alert-info">No managers found.</div>';
      return;
    }

    let html = "";

    managers.forEach((manager) => {
      // Extract city coordinates and clean the string
      const cityCoords = normalizeCoords(manager.city);
      
      html += `
        <div class="card manager-card mb-4" data-manager-id="${manager.manager_id}">
          <div class="card-header bg-light">
            <div class="manager-header">
              <div class="d-flex align-items-center flex-wrap">
                <h5 class="mb-0 me-2">Manager: ${manager.manager_name} [${manager.manager_id}]</h5>
                <div class="city-dropdown-container">
                  <select class="form-select form-select-sm city-dropdown" 
                        data-manager-id="${manager.manager_id}" 
                        aria-label="City selection">
                    ${generateCityOptions(cityLookupMap, cityCoords)}
                  </select>
                </div>
                <span class="employee-count ms-auto">${manager.employee_count}</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h6>Employees</h6>
            ${renderEmployeeTable(manager.employees)}
          </div>
        </div>
      `;
    });

    managerContainer.innerHTML = html;
    
    // Add event listeners to dropdowns after DOM is updated
    document.querySelectorAll('.city-dropdown').forEach(dropdown => {
      dropdown.addEventListener('change', handleCityChange);
    });
  }
  
  // Generate city options HTML directly without async operations 
  function generateCityOptions(cityLookupMap, currentCityCoords) {
    let options 
    
    // If no cities available yet, return just the placeholder
    if (Object.keys(cityLookupMap).length === 0) {
      return options;
    }
    
    // Add all cities to dropdown with the current one selected
    allCities.forEach(city => {
      const cityCoords = normalizeCoords(city.coordinates);
      const isSelected = cityCoords === currentCityCoords ? 'selected' : '';
      options += `<option value="${cityCoords}" ${isSelected}>${city.name}</option>`;
    });
    
    return options;
  }
  
  function handleCityChange(event) {
    const dropdown = event.target;
    const managerId = dropdown.getAttribute('data-manager-id');
    const newCityCoords = dropdown.value;
    
    // Send update to server
    updateManagerCity(managerId, newCityCoords);
  }
  
  function updateManagerCity(managerId, cityCoords) {
    // Show loading indicator
    const dropdown = document.querySelector(`.city-dropdown[data-manager-id="${managerId}"]`);
    dropdown.disabled = true;
    
    fetch('/update_manager_city', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        manager_id: managerId,
        city: cityCoords
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update city');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showToast('City updated successfully', 'success');
        // Update the local data to reflect the change
        const managerIndex = managersData.findIndex(m => m.manager_id === managerId);
        if (managerIndex >= 0) {
          managersData[managerIndex].city = cityCoords;
        }
      } else {
        showToast('Failed to update city', 'danger');
        // Reset the dropdown to match the current data
        resetDropdownToCurrentValue(dropdown, managerId);
      }
    })
    .catch(error => {
      console.error('Error updating city:', error);
      showToast('Error updating city. Please try again.', 'danger');
      // Reset the dropdown to match the current data
      resetDropdownToCurrentValue(dropdown, managerId);
    })
    .finally(() => {
      dropdown.disabled = false;
    });
  }
  
  function resetDropdownToCurrentValue(dropdown, managerId) {
    const manager = managersData.find(m => m.manager_id === managerId);
    if (manager) {
      const cityCoords = normalizeCoords(manager.city);
      dropdown.value = cityCoords;
    }
  }

  function renderEmployeeTable(employees) {
    if (!employees || employees.length === 0) {
      return '<p class="empty-message">No employees assigned to this manager.</p>';
    }

    let tableHtml = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Joining Date</th>
            </tr>
          </thead>
          <tbody>
    `;

    employees.forEach((employee, index) => {
      tableHtml += `
        <tr class="employee-row">
          <td>${index + 1}</td>
          <td>${employee.employee_name}</td>
          <td>${formatDate(employee.joining_date)}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;

    return tableHtml;
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    try {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-IN", options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return the original string if formatting fails
    }
  }
  
  // Toast notification function
  function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create unique ID for this toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML
    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    
    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
      toastElement.remove();
    });
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
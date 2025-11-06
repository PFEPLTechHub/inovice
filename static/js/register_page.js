function populateDropdown(url, selectName, idKey = "id", nameKey = "name") {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const select = document.querySelector(`select[name="${selectName}"]`);
        if (!select) {
          console.warn(`No <select> found with name="${selectName}"`);
          return;
        }

        // Reset and add default option
        select.innerHTML = '<option value="">Select</option>';

        if (Array.isArray(data)) {
          for (const item of data) {
            const option = document.createElement("option");
            option.value = item[idKey];
            option.textContent = item[nameKey];
            select.appendChild(option);
          }
        } else {
          for (const [id, name] of Object.entries(data)) {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            select.appendChild(option);
          }
        }
      })
      .catch((error) => {
        console.error(`Error loading dropdown "${selectName}" from ${url}:`, error);
      });
  }

  window.addEventListener("load", () => {
    // Use display endpoint to show project_name (manager_name)
    populateDropdown("/get_register_project_names_display", "project_name"); 
    populateDropdown("/get_managers1", "manager_name"); 
  });

document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form refresh

    let formData = new FormData(this);
    let jsonData = {};

    formData.forEach((value, key) => (jsonData[key] = value));

    try {
      let response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      let result = await response.json();

      // Show success toast if employee registered successfully
      if (response.ok) {
        Toastify({
          text: "✅ Employee registered successfully!",
          duration: 5000, // Show for 5 seconds
          close: true, // Add close (X) button
          gravity: "top", // Position at the top
          position: "center",
          backgroundColor: "linear-gradient(to right, #28a745, #218838)", // Green success color
        }).showToast();

        // Optionally, reset the form after successful submission
        this.reset();
      } else {
        // Show error toast if something went wrong
        Toastify({
          text: `❌ ${result.message}`,
          duration: 5000,
          close: true,
          gravity: "top",
          position: "center",
          backgroundColor: "linear-gradient(to right, #dc3545, #c82333)", // Red error color
        }).showToast();
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Show error toast for unexpected issues
      Toastify({
        text: "❌ An error occurred. Please try again.",
        duration: 5000,
        close: true,
        gravity: "top",
        position: "center",
        backgroundColor: "linear-gradient(to right, #dc3545, #c82333)",
      }).showToast();
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

$(document).ready(function () {
  // Global variables
  let currentlyVisibleInfoId = null;
  let otpTimer = null;
  let otpTimeLeft = 300; // 5 minutes in seconds

  // Load employee data
  loadEmployeeData();
  fetchAndStoreManagerEmail();

  // Add event listener for view sensitive info buttons
  function addViewButtonListeners() {
    $(".view-info").on("click", function () {
      const employeeId = $(this).data("id");

      // If we're clicking on the same row that's already visible, hide it
      if (currentlyVisibleInfoId === employeeId) {
        resetButtonState();
        showAlert("info", "Sensitive information hidden");
        return;
      }

      // If there's already a row with sensitive info visible, hide it first
      if (currentlyVisibleInfoId !== null) {
        resetButtonState();
      }

      // Set the employee ID in the modal
      $("#employeeId").val(employeeId);

      // Display manager email (masked with asterisks)
      const managerEmail = getMaskedEmail();
      $("#managerEmail").val(managerEmail);

      // Reset OTP input and disable resend button
      $("#otpInput").val("");
      $("#resendOtpBtn").prop("disabled", true);

      // Make sure to enable the verify button
      $("#verifyOtpBtn").prop("disabled", false);

      // Update status message
      $("#otpStatusMessage")
        .html('Click "Send OTP" to receive a verification code on your email.')
        .show();

      // Hide timer initially
      $("#otpTimerAlert").hide();

      // Show OTP validation modal
      $("#otpValidationModal").modal("show");
      showAlert(
        "info",
        "To view sensitive information, an OTP verification is required"
      );
    });
  }

  // Function to fetch manager email from backend and store in session
  function fetchAndStoreManagerEmail() {
    fetch("/api/manager-email", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies with the request
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch manager email");
        }
        return response.json();
      })
      .then((data) => {
        // Store in session storage for client-side use
        sessionStorage.setItem("manager_email", data.email);
      })
      .catch((error) => {
        console.error("Error fetching manager email:", error);
        showAlert(
          "error",
          "Could not load manager contact information. Please refresh the page."
        );
      });
  }

  // Function to get masked email (e.g., j***@example.com)
  function getMaskedEmail() {
    // Get email from session/context dynamically
    const email = getUserEmailFromSession();

    if (!email) return "m*****@example.com"; // Fallback when no email is available

    const parts = email.split("@");
    if (parts.length !== 2) return email; // Return as is if not a valid email format

    const name = parts[0];
    const domain = parts[1];

    if (name.length <= 4) {
      // For short names (<=4), show only the first character and mask the rest
      return name.charAt(0) + "*".repeat(name.length - 1) + "@" + domain;
    } else {
      // For longer names, show first and last two characters, mask the middle
      return (
        name.charAt(0) +
        "*".repeat(name.length - 3) +
        name.slice(-2) +
        "@" +
        domain
      );
    }
  }

  // Function to get email from session - implement according to your environment
  function getUserEmailFromSession() {
    // Get email from browser session storage
    const sessionEmail = sessionStorage.getItem("manager_email");
    // Return the email if it exists, otherwise return null
    return sessionEmail || null;
  }

  // Send OTP button click handler
  $("#sendOtpBtn").on("click", function () {
    const employeeId = $("#employeeId").val();

    // Update status message
    $("#otpStatusMessage").html("Sending OTP to your email address...").show();

    // Disable send button temporarily
    $(this).prop("disabled", true);

    // Send AJAX request to generate and send OTP
    $.ajax({
      url: "/generate_otp",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ employee_id: employeeId }),
      success: function (response) {
        if (response.status === "success") {
          showAlert("success", "OTP sent successfully to your email");
          $("#otpStatusMessage")
            .html(
              "OTP sent to your email. Please check and enter the 6-digit code."
            )
            .show();

          // Make sure verify button is enabled
          $("#verifyOtpBtn").prop("disabled", false);

          // Start the OTP timer
          startOtpTimer();

          // Enable resend button after 30 seconds
          setTimeout(function () {
            $("#resendOtpBtn").prop("disabled", false);
          }, 30000);
        } else {
          showAlert("error", response.message || "Failed to send OTP");
          $("#otpStatusMessage")
            .html("Failed to send OTP. Please try again.")
            .show();
          $("#sendOtpBtn").prop("disabled", false);
        }
      },
      error: function () {
        showAlert("error", "An error occurred while sending OTP");
        $("#otpStatusMessage")
          .html("Error sending OTP. Please try again later.")
          .show();
        $("#sendOtpBtn").prop("disabled", false);
      },
    });
  });

  // Resend OTP button click handler
  $("#resendOtpBtn").on("click", function () {
    // Disable resend button temporarily
    $(this).prop("disabled", true);

    const employeeId = $("#employeeId").val();

    // Update status message
    $("#otpStatusMessage").html("Sending new OTP to your email...").show();

    // Send AJAX request to regenerate and send OTP
    $.ajax({
      url: "/generate_otp",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ employee_id: employeeId }),
      success: function (response) {
        if (response.status === "success") {
          showAlert("success", "New OTP sent successfully to your email");
          $("#otpStatusMessage")
            .html(
              "New OTP sent to your email. Please check and enter the 6-digit code."
            )
            .show();

          // Make sure verify button is enabled again (this was missing in original code)
          $("#verifyOtpBtn").prop("disabled", false);

          // Reset and restart the timer
          clearInterval(otpTimer);
          otpTimeLeft = 300;
          startOtpTimer();

          // Enable resend button after 30 seconds
          setTimeout(function () {
            $("#resendOtpBtn").prop("disabled", false);
          }, 30000);
        } else {
          showAlert("error", response.message || "Failed to resend OTP");
          $("#otpStatusMessage")
            .html("Failed to send new OTP. Please try again.")
            .show();
          $("#resendOtpBtn").prop("disabled", false);
        }
      },
      error: function () {
        showAlert("error", "An error occurred while resending OTP");
        $("#otpStatusMessage")
          .html("Error sending new OTP. Please try again later.")
          .show();
        $("#resendOtpBtn").prop("disabled", false);
      },
    });
  });

  // Verify OTP button click handler
  $("#verifyOtpBtn").on("click", function () {
    const otp = $("#otpInput").val();
    const employeeId = $("#employeeId").val();

    if (!otp) {
      showAlert("error", "Please enter the OTP");
      $("#otpStatusMessage")
        .html("OTP field cannot be empty. Please enter the 6-digit code.")
        .show();
      return;
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      showAlert("error", "OTP must be 6 digits");
      $("#otpStatusMessage")
        .html("OTP must be exactly 6 digits. Please check and try again.")
        .show();
      return;
    }

    // Update status message
    $("#otpStatusMessage").html("Verifying OTP...").show();

    // Disable verify button during verification
    $(this).prop("disabled", true);

    // Send AJAX request to verify OTP
    $.ajax({
      url: "/verify_otp",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        employee_id: employeeId,
        otp: otp,
      }),
      success: function (response) {
        if (response.status === "success") {
          showAlert("success", "OTP verification successful");

          // Close OTP modal
          $("#otpValidationModal").modal("hide");

          // Stop OTP timer
          clearInterval(otpTimer);

          // Set the current visible info ID
          currentlyVisibleInfoId = employeeId;

          // Update button text
          $(`button.view-info[data-id="${employeeId}"]`).html(
            '<i class="fas fa-eye-slash"></i> Hide Sensitive Info'
          );

          // Display the sensitive information
          $("#panNo").text(response.data.pan_no || "Not available");
          $("#accountNo").text(response.data.account_number || "Not available");
          $("#bankName").text(response.data.bank_name || "Not available");
          $("#ifscCode").text(response.data.ifsc_code || "Not available");
          $("#monthlySalary").text(
            formatCurrency(response.data.monthly_salary) || "Not available"
          );
          $("#foodAllowance").text(
            formatCurrency(response.data.food_allowance_per_day_amount) ||
              "Not available"
          );

          // Show employee details modal
          $("#employeeDetailsModal").modal("show");
          showAlert("info", "Displaying sensitive employee information");
        } else {
          showAlert("error", response.message || "Invalid OTP");
          $("#otpStatusMessage")
            .html(
              "OTP verification failed. Please check the code and try again."
            )
            .show();
          // Re-enable the verify button so user can try again
          $("#verifyOtpBtn").prop("disabled", false);
        }
      },
      error: function () {
        showAlert("error", "An error occurred while verifying OTP");
        $("#otpStatusMessage")
          .html("Error during OTP verification. Please try again.")
          .show();
        // Re-enable the verify button so user can try again
        $("#verifyOtpBtn").prop("disabled", false);
      },
    });
  });

  // Function to start OTP timer
  function startOtpTimer() {
    // Show timer alert
    $("#otpTimerAlert").show();

    // Clear any existing timer
    if (otpTimer) {
      clearInterval(otpTimer);
    }

    // Reset time left
    otpTimeLeft = 300; // 5 minutes

    // Update timer display
    updateTimerDisplay();

    // Start interval
    otpTimer = setInterval(function () {
      otpTimeLeft--;

      if (otpTimeLeft <= 0) {
        clearInterval(otpTimer);
        $("#otpTimerAlert")
          .removeClass("alert-warning")
          .addClass("alert-danger");
        $("#otpTimerAlert").html("OTP has expired. Please request a new OTP.");
        $("#verifyOtpBtn").prop("disabled", true);
        $("#otpStatusMessage")
          .html(
            'Your OTP has expired. Please click "Resend OTP" to get a new code.'
          )
          .show();
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  // Function to update timer display
  function updateTimerDisplay() {
    const minutes = Math.floor(otpTimeLeft / 60);
    const seconds = otpTimeLeft % 60;

    const displayMinutes = String(minutes).padStart(2, "0");
    const displaySeconds = String(seconds).padStart(2, "0");

    $("#otpTimer").text(`${displayMinutes}:${displaySeconds}`);
  }

  // Function to reset button state and currentlyVisibleInfoId
  function resetButtonState() {
    if (currentlyVisibleInfoId !== null) {
      $(`button.view-info[data-id="${currentlyVisibleInfoId}"]`).html(
        '<i class="fas fa-eye"></i> View Sensitive Info'
      );
      currentlyVisibleInfoId = null;
    }
  }

  // Function to load employee data
  function loadEmployeeData() {
    showAlert("info", "Loading employee data...");

    $.ajax({
      url: "/get_user_information",
      type: "GET",
      success: function (response) {
        if (response.status === "success") {
          const tableBody = $("#employeeTable tbody");
          tableBody.empty();

          if (response.data.length === 0) {
            tableBody.append(
              '<tr><td colspan="9" class="text-center">No employee data available</td></tr>'
            );
            showAlert("info", "No employee data found");
          } else {
            $.each(response.data, function (index, employee) {
              const row = `
                                <tr id="employee-row-${employee.id}">
                                    <td>${employee.employee_name || "N/A"}</td>
                                    <td>${
                                      employee.employee_address || "N/A"
                                    }</td>
                                    <td>${employee.phone_no || "N/A"}</td>
                                    <td>${employee.mailid || "N/A"}</td>
                                    <td>${employee.gender || "N/A"}</td>
                                    <td>${
                                      formatDate(employee.joining_date) || "N/A"
                                    }</td>
                                    <td>
                                        <button class="btn btn-info btn-sm view-info" data-id="${
                                          employee.id
                                        }">
                                            <i class="fas fa-eye"></i> View Sensitive Info
                                        </button>
                                    </td>
                                </tr>
                            `;
              tableBody.append(row);
            });

            // Add event listener for view buttons
            addViewButtonListeners();
          }
        } else {
          showAlert(
            "error",
            response.message || "Failed to load employee data"
          );
        }
      },
      error: function () {
        showAlert("error", "An error occurred while loading employee data");
        const tableBody = $("#employeeTable tbody");
        tableBody.empty();
        tableBody.append(
          '<tr><td colspan="9" class="text-center">Failed to load data. Please refresh the page.</td></tr>'
        );
      },
    });
  }

  // Helper function to show alerts
  function showAlert(type, message) {
    // Remove any existing alert classes
    const alertBox = $("#alertBox");
    alertBox.removeClass("alert-success alert-danger alert-warning alert-info");

    // Add appropriate class based on alert type
    if (type === "success") {
      alertBox.addClass("alert-success");
    } else if (type === "error") {
      alertBox.addClass("alert-danger");
    } else if (type === "warning") {
      alertBox.addClass("alert-warning");
    } else if (type === "info") {
      alertBox.addClass("alert-info");
    }

    // Set message and show alert
    alertBox.text(message).fadeIn();

    // Auto-hide after 5 seconds
    setTimeout(function () {
      alertBox.fadeOut();
    }, 5000);
  }

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  }

  // Helper function to format currency
  function formatCurrency(amount) {
    if (!amount || isNaN(parseFloat(amount))) return "N/A";
    return "₹ " + parseFloat(amount).toFixed(2);
  }

  // Reset button state when the employee details modal is closed
  $("#employeeDetailsModal").on("hidden.bs.modal", function () {
    resetButtonState();
    showAlert("info", "Sensitive information access ended");
  });

  // Clean up timer when OTP modal is closed
  $("#otpValidationModal").on("hidden.bs.modal", function () {
    if (otpTimer) {
      clearInterval(otpTimer);
      otpTimer = null;
    }
    $("#sendOtpBtn").prop("disabled", false);
  });

  // Add input handler for OTP to provide immediate feedback
  $("#otpInput").on("input", function () {
    const otp = $(this).val();

    if (otp.length === 6 && /^\d+$/.test(otp)) {
      $("#otpStatusMessage")
        .html('OTP format is valid. Click "Verify OTP" to continue.')
        .show();
    } else if (otp.length > 0) {
      $("#otpStatusMessage").html("OTP must be exactly 6 digits.").show();
    }
  });

  // Ensure we have a centralized alert box in the UI
  if ($("#alertBox").length === 0) {
    $("body").prepend(
      '<div id="alertBox" class="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; display: none;"></div>'
    );
  }

  // Ensure we have a status message area in the OTP modal
  if ($("#otpStatusMessage").length === 0) {
    $("#otpValidationModal .modal-body").prepend(
      '<div id="otpStatusMessage" class="alert alert-info" style="display: none;"></div>'
    );
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
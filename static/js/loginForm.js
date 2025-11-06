function login() {
  // Get the value of the phone number input field
  const user_id = document.getElementById("user_id").value;
  console.log("User ID entered:", user_id);

  const password = document.getElementById("password").value;
  console.log("Password entered:", password);

  // Create a payload with the ID and password
  const payload = { id: user_id, password: password };

  console.log("Payload being sent to backend:", payload);

  // Send the credentials to the Flask backend via a POST request
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      console.log("Received response:", response);
      // Store status for error handling
      const status = response.status;
      return response.json().then((data) => ({ status, data }));
    })
    .then(({ status, data }) => {
      console.log("Response data from server:", data);

      // Check if the backend returned an error (401 status)
      if (status === 401) {
        console.error("Authentication failed:", data.message);
        alert(data.message); // Display the backend error message
        return;
      }

      // If validation succeeds, redirect based on role
      if (data.success === 0) {
        console.log("Redirecting to invoice_main_page");
        window.location.href = "/invoice_main_page";
      } else if (data.success === 1) {
        console.log("Redirecting to admin_homepage");
        window.location.href = "/admin_homepage";
      } else {
        console.error("Invalid response format:", data);
        alert("An unexpected error occurred. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error occurred during fetch:", error);
      alert("An error occurred. Please try again later.");
    });
}

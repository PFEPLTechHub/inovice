// Function to validate email
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function validateName(name) {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/; // Allows only letters and spaces, length 2-50
  return nameRegex.test(name);
}

function validatePhone(phone) {
  const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6-9, followed by 9 digits (Indian format)
  return phoneRegex.test(phone);
}

function validatePAN(pan) {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // Format: ABCDE1234F
  return panRegex.test(pan);
}

function validateIFSC(ifsc) {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Format: XXXX0YYYYYY
  return ifscRegex.test(ifsc);
}

// Empty Field Validation
function validateNotEmpty(value) {
  return value.trim() !== ""; // Returns true if the field is NOT empty
}

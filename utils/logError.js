const logError = (memberCIN, header, message, errorRecords) => {
  // Assuming memberCIN should always be valid, handle potential undefined cases
  if (!memberCIN) {
    console.warn("Attempted to log error without valid memberCIN");
    return;
  }

  // Use an object for quicker access if errorRecords is changed to an object
  if (!errorRecords[memberCIN]) {
    errorRecords[memberCIN] = { memberCIN, errors: [] };
  }
  errorRecords[memberCIN].errors.push({ header, error: message });
};

export default logError;

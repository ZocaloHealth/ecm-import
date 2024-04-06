const logError = (memberCin, header, message, errorRecords) => {
  // If errorRecords contains object with memberCin, then add an error properties header and message to errors array of that object
  if (errorRecords.some((record) => record.memberCin === memberCin)) {
    errorRecords
      .find((record) => record.memberCin === memberCin)
      .errors.push({ header, message });
  } else {
    errorRecords.push({ memberCin, errors: [{ header, message }] });
  }
};

export default logError;

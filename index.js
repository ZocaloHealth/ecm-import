import xlsx from "xlsx";
import fs from "fs";
import {
  camelCase,
  normalizeDate,
  logError,
  removeTrailingSpaces,
} from "./utils/index.js";

// This function will be your AWS Lambda handler
export async function handler(event, context) {
  // Assuming the Excel file is uploaded to an S3 bucket and event contains the necessary details
  // to retrieve the file, like bucket name and file key.
  // For local testing, replace this with the local path to the file.

  // Replace with your bucket and object key
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;

  // Code to retrieve the file from S3 would go here
  // For now, let's assume we have the file locally
  const workbook = xlsx.readFile("test/NO_ERRORS_TEST_ECM_FILE.xlsx");
  const sheetName = workbook.SheetNames[1]; // Get the second sheet
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  // Check for the presence of the second row (headers)
  if (rawRows.length < 2) {
    // Error handling if headers are not present
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Headers not found in the second row" }),
    };
  }

  const headers = rawRows[1].map((header) => camelCase(header)); // Normalize headers
  const records = rawRows.slice(2); // Skip the first two rows (titles and headers)

  // Array to store formatted records
  const formattedRecords = [];
  // Array to store records that have errors
  const errorRecords = [];

  for (const row of records) {
    const record = {};
    let memberCin = "";
    let hasError = false;

    const isRowEmpty = row.every((cell) => cell === "");
    if (isRowEmpty) continue; // Skip the rest of the loop and move to the next record

    for (const header of headers) {
      let cellValue = row[headers.indexOf(header)];
      record["memberCin"] = memberCin;

      if (header === "memberCin") {
        // If the header is "memberCin", store the value in a variable
        memberCin = cellValue;
      }

      // Apply specific rules based on header
      switch (header) {
        case "promotora":
        case "memberFirstName":
        case "memberLastName":
        case "residentialCity":
        case "residentialZip":
          // If any of these fields are empty, log an error
          if (!cellValue) {
            logError(memberCin, header, "Missing value", errorRecords); // Assuming memberCin has the Member CIN
            hasError = true;
          } else {
            record[header] = cellValue;
          }
          break;
        case "residentialAddress":
          if (!cellValue) {
            logError(memberCin, header, "Missing value", errorRecords); // Assuming memberCin has the Member CIN
            hasError = true;
          } else {
            record[header] = removeTrailingSpaces(cellValue);
          }
        case "phoneNumber":
          record[header] = cellValue || "9999999998";
          break;
        case "dateOfBirth":
          if (!cellValue) {
            logError(memberCin, header, "Missing value", errorRecords); // Assuming memberCin has the Member CIN
            hasError = true;
          } else {
            record[header] = normalizeDate(cellValue);
          }
          break;
        case "email":
          record[header] = cellValue;
          break;
        case "gender":
          if (!cellValue || !["M", "F"].includes(cellValue)) {
            logError(memberCin, header, "Missing value", errorRecords); // Assuming memberCin has the Member CIN
            hasError = true;
          } else {
            record[header] = cellValue;
          }
          break;
        default:
          // Skip any header not listed
          continue;
      }
    }

    // After processing all fields for the current row
    if (!hasError) {
      // If there are no errors, add the record to the formatted records
      record["foldLocation"] = "California Zócalo Health";
      formattedRecords.push(record);
    }
  }

  // Write formatted records to JSON
  fs.writeFileSync(
    "test/ecm-import.json",
    JSON.stringify(formattedRecords, null, 2)
  );
  // Write error records to a separate JSON file
  if (errorRecords.length > 0) {
    fs.writeFileSync(
      "test/errorRecords.json",
      JSON.stringify(errorRecords, null, 2)
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Records processed successfully${
        errorRecords.length > 0 ? " with errors." : "."
      }`,
      errorRecords,
    }),
  };
}

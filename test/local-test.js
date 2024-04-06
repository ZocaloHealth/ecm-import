import fs from "fs/promises";

async function loadJSON(filePath) {
  try {
    const jsonData = await fs.readFile(filePath, { encoding: "utf8" });
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading JSON:", error);
    throw error; // Rethrow or handle as needed
  }
}

// Assuming your Lambda handler is in 'index.js'
import { handler } from "../index.js";

(async () => {
  try {
    const mockEvent = await loadJSON("./test/mock-s3-event.json");
    const result = await handler(mockEvent);
    console.log("Lambda function output:", result);
  } catch (error) {
    console.error("Error executing Lambda function:", error);
  }
})();

import fs from "fs";
import papaparse from "papaparse";

const fileContent = fs.readFileSync(".test/TEST_FILE.csv", "utf8");

export async function handler(event, context) {
  papaparse.parse(fileContent, {
    complete: (results) => {
      console.log("Headers from second row:", results.data[1]);
    },
    skipEmptyLines: true,
    preview: 2, // Only parse the first 2 rows for efficiency
  });

  console.log("context:", context);
  console.log("event:", event);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda!" }),
  };
}

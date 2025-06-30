import * as XLSX from "xlsx";
import { DataRow } from "./store";

export const parseFile = (file: File): Promise<DataRow[]> => {
  // We return a Promise because reading a file is an asynchronous operation.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        // Use the XLSX library to read the file data
        const workbook = XLSX.read(data, { type: "binary" });
        // Get the first sheet's name
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Convert the sheet to a JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as DataRow[]);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    // This starts the file reading process
    reader.readAsBinaryString(file);
  });
};

// In parser.ts, below the existing parseFile function

// This function takes an array of objects and converts it to a CSV string.
export const jsonToCsv = (data: DataRow[]): string => {
  if (data.length === 0) {
    return "";
  }
  // Create a new 'worksheet' from our JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);
  // Convert that worksheet into a CSV-formatted string
  const csvString = XLSX.utils.sheet_to_csv(worksheet);
  return csvString;
};

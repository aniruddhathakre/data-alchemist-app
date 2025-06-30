import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the connection to the Google AI service using our secret key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * This is our API endpoint for converting a natural language query into a filter object.
 * It's designed to understand the user's intent based on their query and the structure
 * of the data they've uploaded.
 */
export async function POST(request: Request) {
  try {
    // Get the user's query and the data schemas from the request sent by the frontend.
    // We get schemas from the frontend because this server code has no direct access
    // to the user's uploaded data.
    const body = await request.json();
    const { query, schemas } = body;

    // Basic check to ensure we have a query to work with.
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // This is our "instruction manual" for the AI. We give it context (the schemas)
    // and a strict output format to ensure we get a reliable response.
    const prompt = `
      You are an expert at converting natural language search queries into a structured JSON filter object.
      Given a user's search query and the available data schemas, create a JSON object that can be used to filter the data.

      The user's query is: "${query}"

      The available data schemas are:
      - clients: ${schemas.clients.join(", ")}
      - workers: ${schemas.workers.join(", ")}
      - tasks: ${schemas.tasks.join(", ")}

      The JSON object must have the following structure:
      {
        "target": "clients" | "workers" | "tasks",
        "filters": [
          {
            "field": "the_field_to_filter_on",
            "operator": "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains",
            "value": "the_value_to_compare_against"
          }
        ]
      }

      - The 'target' must be the most likely data entity the user is asking about ('clients', 'workers', or 'tasks').
      - The 'operator' 'contains' should be used for searching within comma-separated lists like 'RequestedTaskIDs' or 'Skills'.
      - For numeric comparisons, use 'gt', 'lt', 'gte', 'lte', or 'eq'. For string comparisons, use 'eq'.
      - Your response must be ONLY the raw JSON object and nothing else. Do not wrap it in markdown or add any explanations.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("AI Raw Response:", responseText);

    // This is a defensive step. Sometimes the AI will wrap its response in markdown backticks.
    // This logic cleans up the string before we try to parse it as JSON.
    // FIX: Changed 'let' to 'const' as this variable is not reassigned.
    const cleanedJsonString = responseText
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    const filterObject = JSON.parse(cleanedJsonString);

    return NextResponse.json(filterObject);
  } catch (error) {
    // If anything fails in the process, we log the specific error on the server for debugging
    // and send a generic 'Internal Server Error' back to the frontend.
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

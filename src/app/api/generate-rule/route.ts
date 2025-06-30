import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Set up the connection to the Google AI service using our secret API key.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * This is our API endpoint for generating a rule from natural language.
 * It handles POST requests coming from our frontend.
 */
export async function POST(request: Request) {
  try {
    // Get the user's sentence from the request body.
    const body = await request.json();
    const { ruleText } = body;

    // Basic validation to make sure we received the text.
    if (!ruleText) {
      return NextResponse.json(
        { error: "Rule text is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Here, we build the detailed "instruction manual" (the prompt) for the AI.
    // By giving it clear instructions and examples ("Few-Shot Prompting"),
    // we guide it to return the exact JSON format we need.
    const prompt = `
      You are an expert at converting natural language sentences into structured JSON rule objects.
      Given a user's sentence, create a single JSON object that represents the rule.

      Here are the possible rule structures and examples:

      1.  **Co-run Rule:**
          -   Structure: { "type": "coRun", "tasks": ["TaskID1", "TaskID2", ...] }
          -   Example Sentence: "Tasks T01 and T05 must always run together."
          -   Example JSON: { "type": "coRun", "tasks": ["T01", "T05"] }

      2.  **Slot Restriction Rule:**
          -   Structure: { "type": "slot-restriction", "groupType": "client" | "worker", "group": "GroupName", "minCommonSlots": number }
          -   Example Sentence: "Client group Tier1 needs at least 3 common slots."
          -   Example JSON: { "type": "slot-restriction", "groupType": "client", "group": "Tier1", "minCommonSlots": 3 }

      3.  **Load Limit Rule:**
          -   Structure: { "type": "load-limit", "group": "WorkerGroupName", "maxSlotsPerPhase": number }
          -   Example Sentence: "Workers in DevTeamA can only work on 2 tasks per phase."
          -   Example JSON: { "type": "load-limit", "group": "DevTeamA", "maxSlotsPerPhase": 2 }

      Now, analyze the following user sentence and generate the corresponding JSON object.
      User Sentence: "${ruleText}"

      Your response must be ONLY the raw JSON object and nothing else. Do not wrap it in markdown or add any explanations.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Sometimes the AI, trying to be helpful, wraps its JSON response in markdown backticks (```json ... ```).
    // This cleaning step removes that formatting to prevent our JSON parser from crashing.
    // FIX: Changed 'let' to 'const' as this variable is not reassigned.
    const cleanedJsonString = responseText
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    // Convert the cleaned text string into a real JavaScript object.
    const ruleObject = JSON.parse(cleanedJsonString);

    return NextResponse.json(ruleObject);
  } catch (error) {
    // If anything goes wrong, log the detailed error on the server for debugging...
    console.error("Generate Rule API Error:", error);
    // ...and send back a generic error message to the client.
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

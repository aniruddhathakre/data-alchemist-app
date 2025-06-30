# Data Alchemist 🚀

_A smart tool to turn messy spreadsheet data into a clean, validated, and rule-based configuration._

---

This project is a Next.js web application built for the Digitalyz Software Engineering Intern assignment. It's designed to help non-technical users take raw data from multiple sources, clean it up, and configure it for downstream use, all with the help of AI.

**[➡️ Live Demo Link]**

## Key Features

This application is packed with features to make data handling simple and intuitive:

- **📄 Full Data Ingestion:** Upload `CSV` or `XLSX` files for clients, workers, and tasks.
- **✍️ Interactive Grid:** View all your data in a high-performance grid. You can edit any cell directly, just like in a spreadsheet.
- **✅ Real-time Validation:** The app automatically runs 8+ validation rules (like checking for duplicate IDs, out-of-range values, and broken references) the moment you upload or edit data. Errors are highlighted right in the grid and listed in a summary panel.
- **🤖 AI-Powered Search:** No need for complex filters. Just type what you're looking for in plain English (e.g., _"clients with priority greater than 3"_) to instantly filter the data.
- **🛠️ Flexible Rule Engine:**
  - **Manual Builder:** A step-by-step UI to create custom business rules (like co-run, slot-restriction, and load-limit rules).
  - **AI Converter:** Describe a rule in a simple sentence (e.g., _"workers in DevTeamA can only work on 2 tasks per phase"_) and let the AI instantly generate the correct JSON rule.
- **⚖️ Prioritization & Weights:** Use simple sliders to set the priority for different business criteria, like maximizing fulfillment or ensuring fairness.
- **📤 Full Export:** Download your cleaned-up data as separate `.csv` files and a complete `rules.json` file containing all your created rules and weights with a single click.
- **🎨 Modern UI:** A clean, responsive interface built with shadcn/ui and Tailwind CSS, complete with a dark/light mode toggle.

## Tech Stack

- **Framework:** Next.js (with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Data Grid:** AG-Grid
- **AI / NLP:** Google Gemini AI API
- **State Management:** Zustand
- **File Parsing:** `xlsx` library

## Running the Project Locally

To get this project running on your own machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/aniruddhathakre/data-alchemist-app](https://github.com/aniruddhathakre/data-alchemist-app)
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd data-alchemist-app
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Set up your environment variables:**

    - Create a file named `.env.local` in the root of the project.
    - Add your Google Gemini API key to this file:
      ```
      GOOGLE_API_KEY=YOUR_API_KEY_HERE
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.

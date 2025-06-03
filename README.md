
# Math Games Arcade - Firebase Studio Project

This is a Next.js application built with Firebase Studio, featuring a collection of fun and educational math-based games.

## Features

The application currently includes the following games:

*   **Pi Finder**: Search for number sequences within the first 2000 decimal places of Pi.
*   **Dice Roller**: Simulate dice rolls, customize probabilities for specific numbers, and view frequency distributions in a bar chart.
*   **Number Guesser**: Try to guess a secret number between 1 and 100, with "hot or cold" feedback and an optional even/odd hint.
*   **Prime Factorizer**: Challenge yourself to find the prime factors of a given composite number, with AI-generated tips to help you along the way.

## Tech Stack

*   **Next.js (App Router)**
*   **React**
*   **TypeScript**
*   **ShadCN UI Components**
*   **Tailwind CSS**
*   **Genkit (for AI-powered tips)**
*   **Recharts (for charts in Dice Roller)**

## Getting Started

This project was bootstrapped in Firebase Studio.

1.  Ensure you have Node.js and npm/yarn installed.
2.  Clone the repository (if applicable).
3.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will typically start the application on `http://localhost:9002`.

5.  To run the Genkit flows for AI features (like the tips in Prime Factorizer), you'll need to start the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```

The application will automatically redirect to the "Pi Finder" game as the default page. You can navigate between games using the tabs at the top.

## Project Structure

*   `src/app/(games)/`: Contains the pages and layout for the different games.
*   `src/components/`: Reusable React components, including specific game components (e.g., `DiceRoller.tsx`, `NumberGuesser.tsx`).
*   `src/components/ui/`: ShadCN UI components.
*   `src/ai/`: Genkit related files.
    *   `src/ai/flows/`: Genkit flows, such as `prime-factorization-tip-flow.ts`.
*   `src/lib/`: Utility functions and data (e.g., Pi decimals).
*   `public/`: Static assets.

Enjoy playing the math games!

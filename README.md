# VC Sourcing Application

An intelligent, AI-powered Venture Capital CRM designed to track, evaluate, and manage your startup pipeline seamlessly.

## Features

- **Pipeline Management**: Manage tracked companies in an intuitive data table.
- **AI Data Extraction**: Automatically extract robust startup details from URLs and text using the Gemini API.
- **Company Enrichment**: Contextually enrich company profiles with real-time knowledge via Gemini AI.
- **Thesis Matching & Scoring**: Assign custom, dynamically calculated scores (`Thesis Score Badge`) to evaluate candidates strictly against your specialized VC investment thesis.
- **Saved Searches & Custom Lists**: Efficiently filter prospects and assemble highly-targeted lists of investments.
- **Dynamic Command Palette**: Effortlessly navigate around the system, execute actions, and find specific data through a global `Cmd + K` interface.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **AI Intelligence**: [Google Gemini API](https://aistudio.google.com/) (`@google/genai`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Form Handling & Validation**: React Hook Form + Zod
- **UI Architecture**: Headless UI + Custom Radix Primitives + Lucide Icons

## Getting Started

### Prerequisites

- Node.js (v18+)
- Local MongoDB running on default port `27017` or access to a MongoDB Atlas Cluster URI
- A valid Google Gemini API Key

### Setup Instructions

1. Install project dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Configure environment variables by creating a `.env.local` file at the root:

```env
# Database configuration; defaults to "mongodb://localhost:27017/vc" if omitted
MONGODB_URI=your_mongodb_cluster_uri

# Required AI provider API key
# Get your key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the development server locally:

```bash
npm run dev
# or
yarn dev
# or 
pnpm dev
```

4. Go to [http://localhost:3000](http://localhost:3000) in your browser to start tracking your next investments.

## Project Structure

- `/src/app` - Next.js App Router endpoints, including the overarching UI layouts and backend `/api/*` logic for Data Enrichment & Listing.
- `/src/components` - Isolated, reusable visual components (such as `CompanyTable`, `FilterBar`, and `CommandPalette`).
- `/src/lib` - Core database configuration (`db.ts`), standardized forms/validation configurations.
- `/src/models` - Mongoose documents/schemas specifying the database models (`Company`, `CompanyEnrichment`, `SavedList`, `User`).

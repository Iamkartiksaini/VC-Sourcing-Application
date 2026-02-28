const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Ensure ts-node registration so we can require TS files
require("ts-node").register({
  compilerOptions: { module: "CommonJS", moduleResolution: "node" }
});

const { COMPANIES } = require("../lib/data.ts");
// Using the raw model compilation to avoid Next.js specific imports if possible, or just require it.
// Actually, our model imports types which might be tricky in a simple node script.
// Let's redefine the schema quickly here for seeding to avoid Next.js alias issues (@/) in simple node script.

const CompanySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        domain: { type: String, required: true },
        industry: { type: String, required: true },
        stage: { type: String, required: true },
        location: { type: String, required: true },
        foundedYear: { type: Number, required: true },
        employeeCount: { type: Number, required: true },
        description: { type: String, required: true },
        founders: { type: [String], required: true },
        aiSummary: { type: String },
        aiKeywords: { type: [String] },
        signalTags: { type: [String] },
        thesisScore: { type: Number },
        thesisJustification: { type: String },
        analystNotes: { type: String },
        lastEnrichedAt: { type: String },
        lastFundingAmount: { type: String },
        traction: { type: String },
    },
    { timestamps: true }
);

const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vc";
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing companies...");
    await Company.deleteMany({});
    
    console.log(`Inserting ${COMPANIES.length} companies...`);
    // We can just pass the COMPANIES array. The 'id' field will be ignored by Mongoose schema unless defined, 
    // or it'll just be saved. Mongoose will generate '_id' automatically.
    await Company.insertMany(COMPANIES);

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();

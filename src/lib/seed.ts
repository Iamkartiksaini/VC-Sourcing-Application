import dbConnect from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import { COMPANIES } from "@/lib/data";

export async function seedDatabase() {
  await dbConnect();

  let user = await User.findOne({ email: "dummy@vcscout.local" });
  if (!user) {
    user = await User.create({
      name: "Demo User",
      email: "dummy@vcscout.local",
    });
    console.log("Created dummy user");
  }

  const companyCount = await Company.countDocuments();
  if (companyCount === 0) {
    console.log("No companies found. Seeding initial data...");
    
    // Convert lib/data format to mongoose format (remove id)
    const seedData = COMPANIES.map((c: any) => {
      const { id, ...rest } = c;
      return rest;
    });

    await Company.insertMany(seedData);
    console.log(`Seeded ${seedData.length} companies.`);
  }

  return { success: true };
}

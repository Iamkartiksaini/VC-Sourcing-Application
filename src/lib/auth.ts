import dbConnect from "./db";
import User from "@/models/User";

export async function getDummyUser() {
  await dbConnect();
  
  let user = await User.findOne({ email: "dummy@vcscout.local" });
  if (!user) {
    user = await User.create({
      name: "Demo User",
      email: "dummy@vcscout.local",
    });
  }
  
  return user;
}

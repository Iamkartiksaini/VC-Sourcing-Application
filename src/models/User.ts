import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

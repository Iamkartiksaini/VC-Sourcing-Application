import mongoose from "mongoose";

export interface ISavedList extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  color: string;
  companyIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedListSchema = new mongoose.Schema<ISavedList>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    color: { type: String, required: true },
    companyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
  },
  { timestamps: true }
);

export default mongoose.models.SavedList || mongoose.model<ISavedList>("SavedList", SavedListSchema);

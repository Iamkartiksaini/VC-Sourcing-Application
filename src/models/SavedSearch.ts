import mongoose from "mongoose";
import { FilterState as IFilterState } from "@/lib/types";

export interface ISavedSearch extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  filters: IFilterState;
  createdAt: Date;
  updatedAt: Date;
}

const FilterStateSchema = new mongoose.Schema({
  search: { type: String, default: "" },
  industries: [{ type: String }],
  stages: [{ type: String }],
  minEmployees: { type: Number, default: 0 },
  maxEmployees: { type: Number, default: 100000 },
  minThesisScore: { type: Number, default: 0 },
});

const SavedSearchSchema = new mongoose.Schema<ISavedSearch>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    filters: { type: FilterStateSchema, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SavedSearch || mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);

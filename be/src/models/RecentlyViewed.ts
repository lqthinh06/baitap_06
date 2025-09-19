import { Schema, model, Document } from "mongoose";

export interface IRecentlyViewed extends Document {
  user: Schema.Types.ObjectId;
  items: { product: Schema.Types.ObjectId; viewedAt: Date }[];
}

const RecentlyViewedSchema = new Schema<IRecentlyViewed>({
  user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    viewedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default model<IRecentlyViewed>("RecentlyViewed", RecentlyViewedSchema);

import { Schema, model, Document } from "mongoose";

export interface IReview extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  rating: number;
  comment?: string;
}

const ReviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

ReviewSchema.index({ user: 1, product: 1 }, { unique: true }); // 1 user 1 review/product

export default model<IReview>("Review", ReviewSchema);

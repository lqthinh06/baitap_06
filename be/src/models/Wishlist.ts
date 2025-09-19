import { Schema, model, Document } from "mongoose";

export interface IWishlist extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// 1 user chỉ có 1 bản ghi/1 product
WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export default model<IWishlist>("Wishlist", WishlistSchema);

// be/src/models/Product.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  discount?: number;
  category?: string;     // 👈 new
  views?: number;        // 👈 new
  wishlistedCount?: number; 
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    rating: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    category: { type: String, default: "other", index: true },
    views: { type: Number, default: 0 },
    wishlistedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);

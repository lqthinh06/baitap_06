import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  items: { product: Schema.Types.ObjectId; qty: number; price: number }[];
  status: "created" | "paid" | "shipped" | "completed" | "canceled";
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    qty: { type: Number, default: 1 },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ["created","paid","shipped","completed","canceled"], default: "created" }
}, { timestamps: true });

export default model<IOrder>("Order", OrderSchema);

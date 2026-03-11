import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: String,
    phone: String,
    address: String,
  },
  items: Array,
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: { type: String, default: "pending" }, // pending, paid, failed
  orderStatus: { type: String, default: "processing" }, // processing, shipped, delivered
  trxID: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
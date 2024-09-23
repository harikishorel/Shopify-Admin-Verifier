// // models/Seller.js
import mongoose, { Schema, models } from "mongoose";

const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true, // Initial status is true (active)
    },
    role: {
      type: String,
      required: true,
      default: "seller",
    },
    proofimg: {
      type: String,
      required: true,
      default: "https://vasthra.s3.amazonaws.com/admin/",
    },
  },
  { timestamps: true }
);

const Seller = models.Seller || mongoose.model("Seller", sellerSchema);
export default Seller;

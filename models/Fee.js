// // models/Seller.js
import mongoose, { Schema, models } from "mongoose";

const feeSchema = new Schema(
  {
    Identity_Fee: {
      type: Number,
    },
    Property_Fee: {
      type: Number,
    },
    Document_Fee: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Fee = models.Fee || mongoose.model("Fee", feeSchema);
export default Fee;

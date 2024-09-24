import mongoose, { Schema } from "mongoose";
import Verifier from "./Verifier";
const ProductSchema = new mongoose.Schema({
  productId: { type: String }, // Shopify product ID
  productUrl: { type: String },
  title: { type: String },
  handle: { type: String },
  status: { type: String },
  verificationStatus: { type: String, default: "pending" },
  verifier: {
    type: Schema.Types.ObjectId,
    ref: Verifier,
  },
  verifiedOn: {
    type: Date,
  },
  rejectReason: {
    type: String,
  },
  variants: [
    {
      variantId: { type: String },
      price: { type: String },
      barcode: { type: String, default: null },
      createdAt: { type: Date },
    },
  ],
});

const ShopifyProducts =
  mongoose.models.ShopifyProducts ||
  mongoose.model("ShopifyProducts", ProductSchema);
export default ShopifyProducts;

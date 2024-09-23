import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  handle: { type: String, required: true },
  status: { type: String, required: true },
  images: [
    {
      src: { type: String, required: true },
    },
  ],
  variants: [
    {
      variantId: { type: String, required: true },
      price: { type: String, required: true },
      barcode: { type: String, default: null },
      createdAt: { type: Date, required: true },
    },
  ],
});

const ShopifyProducts =
  mongoose.models.ShopifyProducts ||
  mongoose.model("ShopifyProducts", ProductSchema);
export default ShopifyProducts;

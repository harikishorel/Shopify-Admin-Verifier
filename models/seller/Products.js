import mongoose, { Schema, models } from "mongoose";
import Seller from "../Seller";
import Verifier from "../Verifier";

const productsSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      required: true,
    },

    sareeColour: {
      type: String,
      required: true,
    },

    borderColour: {
      type: String,
      required: true,
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: Seller,
      required: true,
    },

    imageUrls: {
      mainImage: {
        type: String,
        default: "https://vasthra.s3.amazonaws.com/Products/",
      },

      sideImage1: {
        type: String,
        default: "https://vasthra.s3.amazonaws.com/Products/",
      },

      sideImage2: {
        type: String,
        default: "https://vasthra.s3.amazonaws.com/Products/",
      },
    },

    verificationStatus: {
      type: String,
      // enum: [pending, approved, rejected]
    },

    verifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    verifiedOn: {
      type: Date,
    },

    rejectReason: {
      type: String,
    },
    description: {
      type: String,
    },

    soldStatus: {
      type: Boolean,
      default: false,
    },

    soldDate: {
      type: Date,
      default: null,
    },

    // New Fields for Inventory and Tracking

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    Collection: {
      type: String,
      required: true,
    },

    returnPolicy: {
      type: String,
      required: true,
    },

    // Additional Fields

    zari: {
      type: String,
      required: true,
    },

    sareeLength: {
      type: String,
      required: true,
    },

    sareeWeight: {
      type: String,
      required: true,
    },

    packLength: {
      type: String,
      required: true,
    },

    packBreadth: {
      type: String,
      required: true,
    },

    fabric: {
      type: String,
    },

    packHeight: {
      type: String,
      required: true,
    },

    packWeight: {
      type: String,
      required: true,
    },

    ProdStatus: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);
const Products = models.Products || mongoose.model("Products", productsSchema);
export default Products;

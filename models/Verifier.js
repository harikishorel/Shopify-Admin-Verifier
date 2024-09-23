// // models/Seller.js
import mongoose, { Schema, models } from "mongoose";

const verifierSchema = new Schema(
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
    idProof: {
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
      default: "verifier",
    },
    upi: {
      type: String,
      required: false,
    },
    accountNumber: {
      type: String,
      required: false,
    },
    ifscCode: {
      type: String,
      required: false,
    },
    accountHolderName: {
      type: String,
      required: false,
    },
    proofimg: {
      type: String,
      required: true,
      default: "https://vasthra.s3.amazonaws.com/realEstate/",
    },
    verifiertype: {
      type: [String],
      required: true,
      enum: ["Identity Verifier", "Property Verifier", "Document Verifier"],
    }
  },
  { timestamps: true }
);

const Verifier = models.Verifier || mongoose.model("Verifier", verifierSchema);
export default Verifier;

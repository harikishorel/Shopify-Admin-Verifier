import mongoose, { Schema, models } from "mongoose";
import Verifier from "./Verifier";

const propertySchema = new Schema(
  {
    propertyName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },

    // Identity Verification Fields
    identityStatus: {
      type: String,
      default: "pending",
    },
    identityVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    identityVerifiedOn: {
      type: Date,
    },
    identityRejectReason: {
      type: String,
    },
    identityRejectVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    identityRejectedOn: {
      type: Date,
    },
    identityHash: {
      type: String,
    },

    // Property Verification Fields
    propertyStatus: {
      type: String,
      default: "pending",
    },
    propertyVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    propertyVerifiedOn: {
      type: Date,
    },
    propertyRejectReason: {
      type: String,
    },
    propertyRejectVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    propertyRejectedOn: {
      type: Date,
    },
    propertyHash: {
      type: String,
    },
    // Document Verification Fields
    documentStatus: {
      type: String,
      default: "pending",
    },
    documentVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    documentVerifiedOn: {
      type: Date,
    },
    documentRejectReason: {
      type: String,
    },
    documentRejectVerifier: {
      type: Schema.Types.ObjectId,
      ref: Verifier,
      required: true,
    },
    documentRejectedOn: {
      type: Date,
    },
    documentHash: {
      type: String,
    },
  },

  { timestamps: true }
);
const Property = models.Property || mongoose.model("Property", propertySchema);
export default Property;

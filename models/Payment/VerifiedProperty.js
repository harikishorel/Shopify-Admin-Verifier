import mongoose, { Schema, models } from "mongoose";
import Verifier from "../Verifier";
import Property from "../Property";

const verifyProperty = {
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: Property,
    required: true,
  },

  verifierId: {
    type: Schema.Types.ObjectId,
    ref: Verifier,
    required: true,
  },

  verificationStatus: {
    type: String,
    default: "pending",
  },

  verifiedOn: {
    type: Date,
  },

  verificationType: {
    type: String,
  },

  amountAllocated: {
    type: Number,
    default: 0,
  },

  paymentStatus: {
    type: String,
    default: "pending",
  },

  paymentMethod: {
    type: String,
  },

  paymentDate: {
    type: Date,
  },

  rzpaymentId: {
    type: String,
  },
};

const VerifyProperty =
  models.VerifyProperty || mongoose.model("VerifyProperty", verifyProperty);
export default VerifyProperty;

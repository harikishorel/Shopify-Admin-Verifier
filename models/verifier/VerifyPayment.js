// import mongoose, { Schema, models } from "mongoose";
// import Verifier from "../Verifier";
// import Property from "../Property";

// const verifierStatus = {
//   verifierId: {
//     type: Schema.Types.ObjectId,
//     ref: Verifier,
//     required: true,
//   },
//   amountAllocated: {
//     type: Number,
//     default: 0,
//   },
//   paymentStatus: {
//     type: String,
//     default: "pending",
//   },
//   paymentMethod: {
//     type: String,
//   },
//   paymentDate: {
//     type: Date,
//   },

//   rzpaymentId: {
//     type: String,
//   },
// };

// const verifiedProperty = {
//   propertyId: {
//     type: Schema.Types.ObjectId,
//     ref: Property,
//     required: true,
//   },

//   // Identity Verification Fields
//   identityStatus: {
//     type: String,
//     default: "pending",
//   },
//   identityVerifiers: [verifierStatus],
//   identityVerifiedOn: {
//     type: Date,
//   },

//   // Property Verification Fields
//   propertyStatus: {
//     type: String,
//     default: "pending",
//   },
//   propertyVerifiers: [verifierStatus],
//   propertyVerifiedOn: {
//     type: Date,
//   },

//   // Document Verification Fields
//   documentStatus: {
//     type: String,
//     default: "pending",
//   },
//   documentVerifiers: [verifierStatus],
//   documentVerifiedOn: {
//     type: Date,
//   },
// };

// const VerifiedProperty =
//   models.VerifiedProperty ||
//   mongoose.model("VerifiedProperty", verifiedProperty);
// export default VerifiedProperty;

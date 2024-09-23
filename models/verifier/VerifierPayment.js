// import mongoose, { Schema, models } from "mongoose";
// import Products from "../seller/Products";
// import Verifier from "../Verifier";

// const verifiedProduct = {
//   productId: {
//     type: Schema.Types.ObjectId,
//     ref: Products,
//     required: true,
//   },
//   verifierId: {
//     type: Schema.Types.ObjectId,
//     ref: Verifier,
//     required: true,
//   },
//   verifiedDate: {
//     type: Date,
//     default: new Date(),
//   },
//   rzpaymentId: {
//     type: String,
//   },
//   paymentMethod: {
//     type: String,
//   },
//   paymentStatus: {
//     type: String,
//     default: "pending",
//   },
//   amountPaid: {
//     type: Number,
//   },
//   paymentDate: {
//     type: Date,
//   },
//   verificationStatus: {
//     type: String,
//   },
//   totalAmount: {
//     type: Number,
//   },
//   rejectReason: {
//     type: String,
//   },
// };

// const VerifiedProduct =
//   models.VerifiedProduct || mongoose.model("VerifiedProduct", verifiedProduct);
// export default VerifiedProduct;

import mongoose, { Schema, models } from "mongoose";
import Order from "./prodorders";
import Seller from "./Seller";
import Customer from "./Customer"
import Products from "./Products";

const paymentSchema = {

  orderId: {
    type: Schema.Types.ObjectId,
    ref: Order,
    required: true,
  },

  sellerId: {
    type: Schema.Types.ObjectId,
    ref: Seller,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: Products,
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: Customer,
    required: true,
  },
  rzpaymentId: {
    type: String,
  },
  paymentMethod: {
    type: String
  },
  paymentStatus: {
    type: String
  },
  amountPaid: {
    type: Number
  },
  paymentDate: {
    type: Date,
    default: new Date()
  },
  refundAmount: {
    type: Number
  },
  refundStatus: {
    type: String,
    default: null
  },
  refundTransactionId: {
    type: String,
    default: null
  },
  returnReason: {
    type: String,
    default: null
  },
  returnStatus: {
    type: String,
    default: null
  },
  returnRequestDate: {
    type: Date,
    default: null
  },
  returnAuthorizationDate: {
    type: Date,
    default: null
  },
  returnReceivedDate: {
    type: Date,
    default: null
  },
  sellerPaymentReceivedStatus: {
    type: String,
    default: 'Initiated'
  },
  sellerPaymentReceivedDate: {
    type: Date,
    default: null
  },
  returnRejectedReason: {
    type: String,
    default: null
  }
}



const Payment = models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;

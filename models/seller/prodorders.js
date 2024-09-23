import mongoose, { Schema, models } from "mongoose";
import Products from './Products'
import Seller from './Seller'
const OrderSchema = new Schema(
    {
        orderId: {
            type: String,
        },
        productID: {
            type: Schema.Types.ObjectId,
    ref: Products 
        },
        orderDateTime: {
            type: Date,
            default: new Date()
          },
        totalAmount: {
            type: Number
          },
        status: {
            type: String,
            enum: ['delivered','cancelled','pending'],
            default: 'pending',
            required: true,
        },
        sellerID:{
            type:Schema.Types.ObjectId,
            ref: Seller
        },
        customerID: {
            type:Schema.Types.ObjectId,
            ref: "customers"
          },
    },
);

// Adding a compound unique index on ProductName and Date

OrderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const maxOrder = await this.constructor.findOne().sort({ orderId: -1 }).exec();
        this.orderId = maxOrder ? `#${parseInt(maxOrder.orderId.slice(1)) + 1}` : "#1";
    }
    next();
});

const Order = models.productOrders || mongoose.model("productOrders", OrderSchema);
export default Order;

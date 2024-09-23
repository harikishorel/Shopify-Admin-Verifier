import connectDb from "@/utils/connectDB";
import Payment from "@/models/seller/payment";
import Products from "@/models/seller/Products";

export default async function getAllProducts(req, res) {
    let mongoose;

    try {
        mongoose = await connectDb();

        const sellerId = req.query.sellerId;

        // Fetch payments with the specified sellerId and payment status "Closed"
        const payments = await Payment.find({
            sellerId,
            returnStatus: "Closed",
        });

        // Use populate to fetch products with the associated data
        const products = await Payment.find({
            sellerId,
            returnStatus: "Closed",
        }).populate('product', 'sellerPaymentReceivedStatus'); // Assuming 'product' is the field in Payment schema

        // Respond with the retrieved products
        return res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

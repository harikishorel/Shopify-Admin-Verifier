import connectDb from "@/utils/connectDB";
import Payment from "@/models/seller/payment";
import Products from "@/models/seller/Products";

export default async function getAllProducts(req, res) {
    let mongoose;

    try {
        mongoose = await connectDb();

        // Assuming you want to filter by sellerId "655c5d043b1b5d7bd1341ed5"
        const sellerId = req.query.sellerId;

        // Fetch payments with the specified sellerId and payment status "Closed"
        const payments = await Payment.find({
            sellerId,
            returnStatus: "Closed",
        });

        // Extract productIds from the payments
        const productIds = payments.map(payment => payment.productId);

        // Fetch products based on the extracted productIds
        const products = await Products.find({ _id: { $in: productIds } });

        // Create a new array with the required information
        const responseProducts = products.map(product => {
            // Find the corresponding payment
            const correspondingPayment = payments.find(payment => payment.productId.equals(product._id));

            // Include the sellerPaymentReceivedStatus in the product response
            return {
                ...product.toJSON(),
                sellerPaymentReceivedStatus: correspondingPayment ? correspondingPayment.sellerPaymentReceivedStatus : null,
                sellerPaymentReceivedDate: correspondingPayment ? correspondingPayment.sellerPaymentReceivedDate : null,
            };
        });

        // Respond with the modified product response
        return res.status(200).json(responseProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

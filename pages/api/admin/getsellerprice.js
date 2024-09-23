// pages/api/admin/getSellers.js
import connectDB from "@/utils/connectDB"; // Adjust the path based on your project structure
import Seller from "@/models/Seller"; // Adjust the path based on your project structure
import Payment from "@/models/seller/payment"; // Adjust the path based on your project structure
import Product from "@/models/seller/Products"; // Adjust the path based on your project structure

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            // Connect to the database
            await connectDB();

            // Retrieve all sellers from the database
            const sellers = await Seller.find();

            // Fetch payments with sellerPaymentReceivedStatus as 'Initiated' for each seller
            const sellersWithPayments = await Promise.all(
                sellers.map(async (seller) => {
                    const payments = await Payment.find({ sellerId: seller._id, sellerPaymentReceivedStatus: 'Initiated' });

                    // Fetch product details for each payment, including discount price
                    const productsWithDiscounts = await Promise.all(
                        payments.map(async (payment) => {
                            const product = await Product.findById(payment.productId);
                            return { ...payment.toObject(), productDiscountPrice: product.discountPrice };
                        })
                    );

                    // Calculate total discount price for the seller
                    const totalDiscountPrice = productsWithDiscounts.reduce((total, product) => total + product.productDiscountPrice, 0);

                    return { ...seller.toObject(), totalDiscountPrice };
                })
            );

            // Respond with the list of sellers and their payments
            res.status(200).json(sellersWithPayments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

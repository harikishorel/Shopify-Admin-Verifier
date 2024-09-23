// Import necessary modules and models
import connectDb from "@/utils/connectDB";
import Payment from "@/models/seller/payment";

export default async function updateSellerPaymentStatus(req, res) {
    try {
        // Get the sellerId from the request body
        const { sellerId } = req.body;
        console.log("sellerid", sellerId);

        // Capture the current date
        const currentDate = new Date();

        // Update the sellerPaymentReceivedStatus and sellerPaymentReceivedDate for products of the specified seller
        const updateResult = await Payment.updateMany(
            { sellerId, sellerPaymentReceivedStatus: 'Initiated' },
            { $set: { sellerPaymentReceivedStatus: 'Paid', sellerPaymentReceivedDate: currentDate } }
        );
        console.log("updated results", updateResult);

        // Check the update result
        if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ message: "Seller payment status updated for the specified products" });
        } else {
            return res.status(200).json({ message: "No products found or no updates needed" });
        }
    } catch (error) {
        console.error("Error updating seller payment status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

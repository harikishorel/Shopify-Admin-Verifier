import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";
import Payment from "@/models/seller/payment";

export default async (req, res) => {
    try {
        const db = await connectDB();
        const ProductsModel = Products;

        // Search the Payment model for entries with returnStatus: "Closed"
        const closedPayments = await Payment.find({ returnStatus: "Closed" });

        // Extract product IDs from closed payments
        const productIdsFromClosedPayments = closedPayments.map((payment) => payment.productId);

        // Modify the query to filter products where soldStatus is true and the product ID is in the list from closed payments
        const soldProducts = await ProductsModel.find({ soldStatus: true, _id: { $in: productIdsFromClosedPayments } });

        // Get the unique names from the sold products
        const uniqueNames = await ProductsModel.distinct("Collection", { _id: { $in: soldProducts.map((product) => product._id) } });

        // Get count for all unique collections where soldStatus is true
        const collectionCounts = await ProductsModel.aggregate([
            {
                $match: { soldStatus: true, _id: { $in: soldProducts.map((product) => product._id) } }
            },
            {
                $group: {
                    _id: "$Collection",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({ uniqueNames, collectionCounts });
    } catch (error) {
        console.error("Get total price and count of sold products error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

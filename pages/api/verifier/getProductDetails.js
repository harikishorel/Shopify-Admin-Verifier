import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract product ID from the request params
      const { id } = req.query;

      // Retrieve product details by ID from the database and populate the seller details
      const productDetails = await Products.findById(id)
        .populate("sellerId")
        .exec();

      // Check if the product exists
      if (!productDetails) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Respond with the product details
      res.status(200).json(productDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

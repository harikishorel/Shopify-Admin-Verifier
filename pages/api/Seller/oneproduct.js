import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";

export default async function getProductById(req, res) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const productId = req.query.id; // Assuming the ID is provided as a query parameter

      if (!productId) {
        return res.status(400).json({ error: "Product ID is missing" });
      }

      // Find the product by ID in the database
      const product = await Products.findById(productId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

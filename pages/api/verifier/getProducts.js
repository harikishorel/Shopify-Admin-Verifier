import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";
import ShopifyProducts from "@/models/ShopifyProducts";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Retrieve all products from the database and populate the seller details
      const filteredProducts = await ShopifyProducts.find()
      
      // Respond with the list of filtered products with seller details
      res.status(200).json(filteredProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

// Import necessary modules
import connectDb from "@/utils/connectDB";
import Products from "@/models/seller/Products";

// Function to get all products for a specific seller
export default async function getAllProducts(req, res) {
  let mongoose;

  try {
    // Connect to the MongoDB database
    mongoose = await connectDb();

    // Assuming you want to filter by sellerId "655c5d043b1b5d7bd1341ed5"
    const sellerId = req.query.sellerId;
    console.log("selleridapi",sellerId)

    // Fetch products that have the specified sellerId
    const products = await Products.find({ sellerId });
    // Respond with the retrieved products
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

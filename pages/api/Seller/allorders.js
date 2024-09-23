// Import necessary modules
import connecttodb from "@/utils/connectDB"
import Order from "@/models/seller/prodorders";

// Function to get all orders
export default async function getAllOrders(req, res) {
  let mongoose;

  try {
    // Connect to the MongoDB database
    mongoose = await connecttodb();

    // Fetch all orders from the database
    const orders = await Order.find({});

    // Respond with the retrieved orders
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } 
}

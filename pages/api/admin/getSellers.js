// pages/api/admin/getSellers.js
import connectDB from "@/utils/connectDB"; // Adjust the path based on your project structure
import Seller from "@/models/Seller"; // Adjust the path based on your project structure

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Retrieve all sellers from the database
      const sellers = await Seller.find();

      // Respond with the list of sellers
      res.status(200).json(sellers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

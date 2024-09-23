// pages/api/admin/getSellerProfile.js
import connectDB from "@/utils/connectDB";
import Seller from "@/models/Seller";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract seller ID from the request query
      const { id } = req.query;

      // Find the seller with the given ID
      const seller = await Seller.findById(id);

      // Check if the seller exists
      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }

      // Send the response with the fetched seller data
      res.status(200).json(seller);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

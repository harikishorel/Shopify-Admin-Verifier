// // pages/api/admin/updateSellerStatus.js
import connectDB from "@/utils/connectDB";
import Seller from "@/models/Seller";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      await connectDB();

      const { sellerId, newStatus } = req.body;

      // Find the seller by ID
      const seller = await Seller.findById(sellerId);

      if (!seller) {
        return res.status(404).json({ error: "Seller not found" });
      }

      // Update the status
      seller.status = newStatus;
      const updatedSeller = await seller.save();

      res.status(200).json(updatedSeller);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

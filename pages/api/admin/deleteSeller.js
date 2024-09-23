// pages/api/admin/deleteSeller.js
import Seller from "@/models/Seller";
import connectDB from "@/utils/connectDB";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      await connectDB();

      const { sellerId } = req.body;

      // Use findOneAndDelete instead of findByIdAndRemove
      const deletedSeller = await Seller.findOneAndDelete({ _id: sellerId });

      if (!deletedSeller) {
        return res.status(404).json({ error: "Seller not found" });
      }

      res
        .status(200)
        .json({ message: "Seller deleted successfully", data: deletedSeller });
    } catch (error) {
      console.error("Error deleting seller:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

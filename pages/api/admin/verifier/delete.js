import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      await connectDB();

      const { verifierId } = req.body;

      // Use findOneAndDelete instead of findByIdAndRemove
      const deletedVerifier = await Verifier.findOneAndDelete({
        _id: verifierId,
      });

      if (!deletedVerifier) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      res.status(200).json({
        message: "Verifier deleted successfully",
        data: deletedVerifier,
      });
    } catch (error) {
      console.error("Error deleting Verifier:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

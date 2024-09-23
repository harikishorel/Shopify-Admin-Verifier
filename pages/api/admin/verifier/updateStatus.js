import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      await connectDB();

      const { verifierId, newStatus } = req.body;

      // Find the Verifier by ID
      const verifier = await Verifier.findById(verifierId);

      if (!verifier) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      // Update the status
      verifier.status = newStatus;
      const updatedVerifier = await verifier.save();

      res.status(200).json(updatedVerifier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

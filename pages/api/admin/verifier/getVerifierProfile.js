// pages/api/admin/verifier/getVerifierProfile.js
import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract Verifier ID from the request query
      const { id } = req.query;

      // Find the Verifier with the given ID
      const verifier = await Verifier.findById(id);

      // Check if the Verifier exists
      if (!verifier) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      // Send the response with the fetched Verifier data
      res.status(200).json(verifier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

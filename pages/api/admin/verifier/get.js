import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Retrieve all verifier from the database
      const verifier = await Verifier.find();

      // Respond with the list of verifier
      res.status(200).json(verifier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

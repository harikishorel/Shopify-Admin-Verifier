import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    await connectDB();

    const { _id, ...formData } = req.body;
    console.log("ID:", _id);
    console.log("Details:", formData);
    try {
      // Find the Verifier using the provided _id
      const verifier = await Verifier.findById(_id);
console.log("verifer",verifier)
      if (!verifier) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      // Update the Verifier details
      verifier.set(formData);
      const updatedVerifier = await verifier.save();

      // Return the updated Verifier details
      res.status(200).json(updatedVerifier);
    } catch (error) {
      console.error("Error updating Verifier:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

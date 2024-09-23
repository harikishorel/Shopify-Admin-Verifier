import connectDB from "@/utils/connectDB";
import VerifyProperty from "@/models/Payment/VerifiedProperty";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract product ID from the request params
      const { id } = req.query;

      // Find properties with the given verifierId in any of the verifierStatus arrays
      const verifiedProperty = await VerifyProperty.find({
        verifierId: id,
      }).populate("propertyId");

      // Check if properties exist
      if (!verifiedProperty || verifiedProperty.length === 0) {
        return res.status(200).json([]);
      }

      // Extract and send only the populated data
      // const populatedData = verifiedProperty.map((item) => item.propertyId);

      // Send the response with the fetched data
      res.status(200).json(verifiedProperty);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

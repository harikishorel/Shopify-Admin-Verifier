import connectDB from "@/utils/connectDB";
import VerifyProperty from "@/models/Payment/VerifiedProperty";
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract verifierId from the request body
      const { verifierId } = req.query;
      // if (!verifierId) {
      //   return res
      //     .status(400)
      //     .json({ error: "Missing verifierId in the request body" });
      // }
      console.log("Verifier", verifierId);
      // Retrieve products that match the verifierId from the database and populate the verifier details
      const filteredProducts = await VerifyProperty.find({ verifierId })
        .populate("propertyId") // Assuming 'verifierId' is the field linking to the verifier collection
        .exec();

      // Respond with the list of filtered products with verifier details
      res.status(200).json(filteredProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

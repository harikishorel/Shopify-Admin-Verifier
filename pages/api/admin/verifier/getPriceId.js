import connectDB from "@/utils/connectDB";
import VerifyProperty from "@/models/Payment/VerifiedProperty";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await connectDB();

      const { verifierId } = req.query;

      // Fetch verifiedProperties with the given verifierId and paymentStatus="pending"
      const verifiedProperties = await VerifyProperty.find({
        verifierId,
        paymentStatus: "pending",
      }).populate("propertyId");

      // Calculate total amountAllocated for the properties
      const totalAmount = verifiedProperties.reduce(
        (total, property) => total + property.amountAllocated,
        0
      );

      // Send the retrieved data in the response
      res.status(200).json({
        verifiedProperties,
        totalAmount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

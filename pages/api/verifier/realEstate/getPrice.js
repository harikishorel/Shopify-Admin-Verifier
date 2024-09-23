import VerifyProperty from "@/models/Payment/VerifiedProperty";
import connectDB from "@/utils/connectDB";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract verifierId from the request params
      const { id } = req.query;

      // Find total properties based on verifierId, verificationType, and verificationStatus
      const totalVerifiedIdentity = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "identity",
        verificationStatus: "verified",
      });

      const totalRejectedIdentity = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "identity",
        verificationStatus: "rejected",
      });

      const totalVerifiedProperty = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "property",
        verificationStatus: "verified",
      });

      const totalRejectedProperty = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "property",
        verificationStatus: "rejected",
      });

      const totalVerifiedDocument = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "document",
        verificationStatus: "verified",
      });

      const totalRejectedDocument = await VerifyProperty.countDocuments({
        verifierId: id,
        verificationType: "document",
        verificationStatus: "rejected",
      });

      // Send the response with the calculated values
      res.status(200).json({
        totalVerifiedIdentity,
        totalRejectedIdentity,
        totalVerifiedProperty,
        totalRejectedProperty,
        totalVerifiedDocument,
        totalRejectedDocument,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

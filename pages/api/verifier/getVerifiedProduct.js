import connectDB from "@/utils/connectDB";
import VerifiedProduct from "@/models/verifier/VerifierPayment";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract product ID from the request params
      const { id } = req.query;

      // Find all VerifiedProducts with the given verifierId, populate productId and then sellerId
      const verifiedProducts = await VerifiedProduct.find({
        verifierId: id,
      }).populate({
        path: "productId",
        populate: {
          path: "sellerId",
        },
      });

      // Check if the product exists
      if (!verifiedProducts) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      // Extract and send only the populated data
      const populatedData = verifiedProducts.map((item) => item.productId);

      // Send the response with the fetched data
      res.status(200).json(populatedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

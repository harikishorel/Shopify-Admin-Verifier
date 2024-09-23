import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Extract product ID from the request params
      const { id } = req.query;

      // Find all VerifiedProducts with the given verifierId
      const rejectedProducts = await Products.find({
        verifier: id,
        verificationStatus: "rejected",
      }).populate("sellerId");

      // Check if the product exists
      if (!rejectedProducts) {
        return res.status(404).json({ error: "Verifier not found" });
      }

      // Send the response with the fetched data
      res.status(200).json(rejectedProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

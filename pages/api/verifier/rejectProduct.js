import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await connectDB();

      const reason = req.body.reason;
      const prodId = req.body.ProductId;
      const verifierId = req.body.verifierId;

      // Find the specific product by ID
      const existingProduct = await Products.findById(prodId);

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if the "rejectReason" field exists in the product schema
      if (!existingProduct.rejectReason) {
        // If it doesn't exist, add the "rejectReason" field dynamically
        await Products.updateOne(
          { _id: prodId },
          {
            $set: {
              rejectReason: reason,
              verificationStatus: "rejected", // Update verificationStatus
              verifier: verifierId, // Set verifier field
            },
          }
        );
      } else {
        // If it exists, update the "rejectReason" field
        await Products.updateOne(
          { _id: prodId },
          {
            $set: {
              rejectReason: reason,
              verificationStatus: "rejected", // Update verificationStatus
              verifier: verifierId, // Set verifier field
            },
          }
        );
      }

      // Retrieve the updated product
      const updatedProduct = await Products.findById(prodId);

      res.status(200).json({ data: updatedProduct });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

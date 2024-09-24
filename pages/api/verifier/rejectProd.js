import connectDB from "@/utils/connectDB";
import VerifiedProduct from "@/models/verifier/VerifierPayment";
import Products from "@/models/seller/Products";
import ShopifyProducts from "@/models/ShopifyProducts";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await connectDB();

      const reason = req.body.reason;
      const prodId = req.body.ProductId;
      const verifierId = req.body.verifierId;
      // Find the product by prodId
      const product = await ShopifyProducts.findById(prodId);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!product.rejectReason) {
        // If it doesn't exist, add the "rejectReason" field dynamically
        await ShopifyProducts.updateOne(
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
        await ShopifyProducts.updateOne(
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

      // Create a new VerifiedProduct entry with the desired values
      // const newVerification = new VerifiedProduct({
      //   productId: prodId,
      //   verifierId: verifierId,
      //   rejectReason: reason,
      //   totalAmount: 200,
      //   verificationStatus: "rejected",
      //   // Set other fields based on your requirements
      // });

      // // Save the new entry to the database
      // const savedVerification = await newVerification.save();

      // Respond with a success message or any other relevant data
      res.status(200).json({
        message: "Product verification rejected successfully",
        // data: savedVerification,
      });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

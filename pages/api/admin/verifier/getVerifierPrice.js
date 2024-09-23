import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";
import VerifyProperty from "@/models/Payment/VerifiedProperty";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await connectDB();

      // Fetch all verifiers
      const verifiers = await Verifier.find();

      // Initialize an array to store the results for each verifier
      const results = [];

      // Iterate over each verifier
      for (const verifier of verifiers) {
        // Fetch properties for the current verifier with paymentStatus="pending"
        const properties = await VerifyProperty.find({
          verifierId: verifier._id,
          paymentStatus: "pending",
        });

        // Calculate total amountAllocated for properties with paymentStatus="pending"
        const totalPending = properties.reduce(
          (total, property) => total + property.amountAllocated,
          0
        );

        // Create an object with verifier details and totalAmountAllocated
        const result = {
          ...verifier.toObject(),
          totalPending,
        };

        // Push the result to the array
        results.push(result);
      }

      // Send the response with the array of results
      res.status(200).json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

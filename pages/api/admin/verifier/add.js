import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await connectDB();

      // Destructure seller details from the request body
      const { name, email, password, phone, idProof, address } = req.body;

      // Check if a seller with the same email and phone already exists
      const existingVerifier = await Verifier.findOne({ email, phone });

      if (existingVerifier) {
        // If a matching Verifier is found, respond with an error
        return res.status(400).json({
          error: "Verifier already exists",
        });
      }

      // Create a new instance of the Seller model
      const newVerifier = new Verifier({
        name,
        email,
        password,
        phone,
        idProof,
        address,
        status: true, // Set status to true for an active seller
      });

      // Save the new Verifier to the database
      const savedVerifier = await newVerifier.save();

      // Respond with the saved Verifier details
      res.status(201).json(savedVerifier);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, newPassword } = req.body;

  // Validate input
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and newPassword are required" });
  }

  // Connect to the database
  await connectDB();

  try {
    // Check if the Verifier with the given email exists
    const existingVerifier = await Verifier.findOne({ email });

    if (!existingVerifier) {
      return res.status(404).json({ message: "Verifier not found" });
    }

    // Update the Verifier's password in the database using the Verifier schema
    existingVerifier.password = newPassword;
    await existingVerifier.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

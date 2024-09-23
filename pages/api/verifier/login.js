import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";

connectDB();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await Verifier.findOne({ email });

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // TODO: Set up your session logic here
      // For example, you can use a library like `next-auth` for session management

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

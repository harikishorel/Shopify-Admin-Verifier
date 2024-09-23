import connectDB from "@/utils/connectDB";
import Admin from "@/models/Admin";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await connectDB();

      const { email, password } = req.body;

      const user = await Admin.findOne({ email });
      console.log(user);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

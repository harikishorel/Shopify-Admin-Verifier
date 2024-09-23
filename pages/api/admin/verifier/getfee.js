// api/fee.js

import connectDB from "@/utils/connectDB";
import Fee from "@/models/Fee";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Retrieve all fee details from the database
      const fees = await Fee.find();

      res.status(200).json({ success: true, data: fees });
    } catch (error) {
      console.error("Error retrieving fee details:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

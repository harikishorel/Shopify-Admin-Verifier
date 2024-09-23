import connectDB from "@/utils/connectDB";
import Products from "@/models/seller/Products";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      // Retrieve the total count of products from the database
      const totalCount = await Products.countDocuments();

      // Respond with the total count
      res.status(200).json({ totalCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

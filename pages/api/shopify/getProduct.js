// /api/shopify/getProduct
import connectDB from "@/utils/connectDB";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await connectDB();
    console.log("Request received:", req.body);
    return res.status(200).json({ message: "Product received" });
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

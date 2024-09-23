// api/fee.js

import connectDB from "@/utils/connectDB";
import Fee from "@/models/Fee";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const feeRecord = await Fee.findOne();
      if (!feeRecord) {
        res.status(404).json({ error: "No fee record found" });
      } else {
        const { Identity_Fee, Property_Fee, Document_Fee } = feeRecord;
        res.status(200).json({ Identity_Fee, Property_Fee, Document_Fee });
      }
    } catch (error) {
      console.error("Error fetching fees:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    const { Identity_Fee, Property_Fee, Document_Fee } = req.body;

    try {
      let feeRecord = await Fee.findOne();

      if (!feeRecord) {
        feeRecord = new Fee({
          Identity_Fee,
          Property_Fee,
          Document_Fee,
        });
      } else {
        if (typeof Identity_Fee !== "undefined") {
          feeRecord.Identity_Fee = Identity_Fee;
        }
        if (typeof Property_Fee !== "undefined") {
          feeRecord.Property_Fee = Property_Fee;
        }
        if (typeof Document_Fee !== "undefined") {
          feeRecord.Document_Fee = Document_Fee;
        }
      }

      await feeRecord.save();

      res
        .status(200)
        .json({ success: true, message: "Fees updated successfully" });
    } catch (error) {
      console.error("Error storing/updating fees:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

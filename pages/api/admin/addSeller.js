import connectDB from "@/utils/connectDB";
import Seller from "@/models/Seller";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser to handle file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await connectDB();

      // Destructure seller details from the request body
      const { name, email, password, phone, shopName, address } = req.body;

      const existingSeller = await Seller.findOne({ email, phone });

      if (existingSeller) {
        return res.status(400).json({
          error: "Seller already exists",
        });
      }

      const newSeller = new Seller({
        name,
        email,
        password,
        phone,
        shopName,
        address,
        status: true,
      });

      const savedSeller = await newSeller.save();

      // Use multer to handle file upload
      upload.single("file")(req, res, async (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return res.status(500).json({ error: "Server error" });
        }

        const file = req.file;
        console.log("apifile", file);
        // Upload the file to S3
        const s3Client = new S3Client({
          region: process.env.REGION,
          credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          },
        });

        const fileName = `${savedSeller._id.toString()}-${name.replace(
          /\s+/g,
          "-"
        )}.jpg`;

        const uploadUrl = await getSignedUrl(
          s3Client,
          new PutObjectCommand({
            Bucket: "admin",
            Key: fileName,
            ContentType: file.mimetype,
          })
        );

        await fetch(uploadUrl, {
          method: "PUT",
          body: file.buffer,
          headers: {
            "Content-Type": file.mimetype,
          },
        });

        res.status(201).json(savedSeller);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await connectDB();

      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form data:", err.message);
          return res.status(500).json({ error: "Error parsing form data" });
        }

        const uploadedFile = files.file[0];

        if (!uploadedFile) {
          console.error("No file found");
          return res.status(400).json({ error: "No file found" });
        }

        const filePath =
          uploadedFile.path ||
          (uploadedFile._writeStream && uploadedFile._writeStream.path);

        if (!filePath) {
          console.error("No file path found");
          return res.status(400).json({ error: "No file path found" });
        }

        try {
          const {
            name,
            email,
            password,
            phone,
            idProof,
            address,
          } = fields;
         
          // Step 1: Save the Verifier into the database and retrieve the _id
          const newVerifier = new Verifier({
            name: name[0],
            email: email[0],
            password: password[0],
            phone: phone[0],
            idProof: idProof[0],
            address: address[0],
          });

          const savedVerifier = await newVerifier.save();
          const verifierId = savedVerifier._id.toString();

          // Step 2: Create a folder inside the "admin" folder in the S3 bucket
          const s3Client = new S3Client({
            region: process.env.REGION, // Replace with your actual region
            credentials: {
              accessKeyId: process.env.ACCESS_KEY, // Replace with your actual access key
              secretAccessKey: process.env.SECRET_ACCESS_KEY, // Replace with your actual secret access key
            },
          });

          const adminFolderKey = `shopify/${verifierId}/`;
          const createFolderParams = {
            Bucket: process.env.BUCKET_NAME, // Replace with your actual bucket name
            Key: adminFolderKey,
            Body: "",
          };
          await s3Client.send(new PutObjectCommand(createFolderParams));

          // Step 3: Upload the image to the folder created in Step 2
          const buffer = fs.readFileSync(filePath);

          const fileName = `${adminFolderKey}${uploadedFile.originalFilename.replace(
            /\s/g,
            "_"
          )}`;
          const uploadParams = {
            Bucket: process.env.BUCKET_NAME, // Replace with your actual bucket name
            Key: fileName,
            Body: buffer,
          };
          const upload = new Upload({
            client: s3Client,
            params: uploadParams,
          });

          await upload.done();

          // Step 4: Get the signed URL of the uploaded image
          const signedUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${fileName}`;

          // Step 5: Update Verifier with the image URL
          const existingVerifier = await Verifier.findById(verifierId);

          if (!existingVerifier) {
            return res.status(404).json({ error: "Verifier not found" });
          }

          // Update Seller with the image URL
          existingVerifier.proofimg = signedUrl;
          await existingVerifier.save();

          res.status(201).json({
            success: true,
            message: "Verifier added successfully",
            data: savedVerifier,
          });
        } catch (error) {
          console.error("Error adding Verifier:", error.message);
          res.status(500).json({ error: "Internal Server Error" });
        }
      });
    } catch (error) {
      console.error("Error connecting to database:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

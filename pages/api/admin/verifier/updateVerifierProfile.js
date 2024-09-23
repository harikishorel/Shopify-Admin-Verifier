import connectDB from "@/utils/connectDB";
import Verifier from "@/models/Verifier";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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
  if (req.method === "PUT") {
    try {
      await connectDB();

      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form data:", err.message);
          return res.status(500).json({ error: "Error parsing form data" });
        }

        const {
          id,
          name,
          email,
          password,
          phone,
          idProof,
          address,
          verifiertype,
          proofimg,
        } = fields;

        // Step 1: Find the Verifier by _id
        const existingVerifier = await Verifier.findById(id);

        if (!existingVerifier) {
          return res.status(404).json({ error: "Verifier not found" });
        }

        // Step 2: Update Verifier fields with the fields object
        const verifierTypesArray = verifiertype[0].split(",");

        existingVerifier.name = name[0];
        existingVerifier.email = email[0];
        existingVerifier.password = password[0];
        existingVerifier.phone = phone[0];
        existingVerifier.idProof = idProof[0];
        existingVerifier.address = address[0];
        existingVerifier.verifiertype = verifierTypesArray;
        await existingVerifier.save();
        console.log("URLof proof", existingVerifier.proofimg);

        // Step 3: Check if there is a new image to upload
        const uploadedFile = files.file && files.file[0];

        if (uploadedFile) {
          const filePath =
            uploadedFile.path ||
            (uploadedFile._writeStream && uploadedFile._writeStream.path);

          if (!filePath) {
            console.error("No file path found");
            return res.status(400).json({ error: "No file path found" });
          }
          // Step 4: Upload the new image to S3
          const s3Client = new S3Client({
            region: process.env.REGION, // Replace with your actual region
            credentials: {
              accessKeyId: process.env.ACCESS_KEY, // Replace with your actual access key
              secretAccessKey: process.env.SECRET_ACCESS_KEY, // Replace with your actual secret access key
            },
          });

          const adminFolderKey = `realEstate/${id}/`;

          // Parse the URL to extract Bucket and Key
          const urlParts = new URL(existingVerifier.proofimg);
          const bucket = urlParts.hostname.split(".")[0];
          const key = urlParts.pathname.substring(1); // Remove leading slash

          // Delete the previous file
          const deleteCommand = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          });

          await s3Client.send(deleteCommand);

          console.log("Verifier Proof image Deletion is successful");

          const createFolderParams = {
            Bucket: process.env.BUCKET_NAME, // Replace with your actual bucket name
            Key: adminFolderKey,
            Body: "",
          };
          await s3Client.send(new PutObjectCommand(createFolderParams));

          // Upload the image to the folder created in Step 2
          const buffer = fs.readFileSync(filePath);

          const fileName = `${adminFolderKey}${uploadedFile.originalFilename.replace(
            /\s/g,
            "_"
          )}`;
          console.log("FileName", fileName);
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

          // Step 5: Get the signed URL of the uploaded image
          const signedUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${fileName}`;

          // Step 6: Update Verifier with the new image URL
          existingVerifier.proofimg = signedUrl;
          await existingVerifier.save();
        }

        // Step 7: Save the updated Verifier
        await existingVerifier.save();

        res.status(201).json({
          success: true,
          message: "Verifier updated successfully",
          data: existingVerifier,
        });
      });
    } catch (error) {
      console.error("Error connecting to database:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

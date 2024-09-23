import { writeBlockData } from "web2toweb3";
import { IncomingForm } from "formidable";
import fs from "fs";
import Property from "@/models/Property";
import Verifier from "@/models/Verifier";
import VerifyProperty from "@/models/Payment/VerifiedProperty";
import Fee from "@/models/Fee";

export const config = {
  api: {
    bodyParser: false, // Disable the built-in body parsing
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const ClientID = process.env.WEB3CLIENTID;
    const SigningPrivateKey = process.env.SIGN_PRIVATEKEY;

    try {
      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: "Error parsing form data" });
        }

        // Fetch the Property_Fee value from the Fee model
        const feeDetails = await Fee.findOne();
        const propertyFee = feeDetails?.Property_Fee || 0;

        const PostID = fields.postId[0];
        const verifier = fields.verifier[0];
        const verifierDetails = await Verifier.findById(verifier);

        const propertyVerifierName = verifierDetails.name;
        const propertyVerifierAdd = verifierDetails.address;

        const blockJSON = JSON.stringify({
          propertyType: fields.propertyType[0],
          propertyAddress: fields.address[0],
          description: fields.description[0],
          propertyVerifierName: propertyVerifierName,
          propertyVerifierAdd: propertyVerifierAdd,
          propertyVerifiedOn: new Date(),
        });
        // console.log("PostId", PostID, "Verifier", verifier);

        const fileFront = files.fileFront[0];
        const fileBack = files.fileBack[0];
        const fileLocality = files.fileLocality[0];
        const fileSide = files.fileSide[0];

        // console.log("fileFront", fileFront.filepath);

        // Check if any file is missing
        if (!fileFront || !fileBack || !fileLocality || !fileSide) {
          console.error("One or more files are missing");
          return res
            .status(400)
            .json({ error: "One or more files are missing" });
        }

        // Function to get file buffer based on filepath or _writeStream.path
        const getFileBuffer = (file) => {
          const filePath =
            file.filepath || (file._writeStream && file._writeStream.path);

          if (!filePath) {
            console.error("No file path found");
            return null;
          }

          return fs.readFileSync(filePath);
        };

        // Prepare blockFiles for writeBlockData
        const blockFiles = [
          {
            originalname: fileFront.originalFilename,
            buffer: getFileBuffer(fileFront),
          },
          {
            originalname: fileBack.originalFilename,
            buffer: getFileBuffer(fileBack),
          },
          {
            originalname: fileLocality.originalFilename,
            buffer: getFileBuffer(fileLocality),
          },
          {
            originalname: fileSide.originalFilename,
            buffer: getFileBuffer(fileSide),
          },
        ];

        // console.log("Files", blockFiles);

        // console.log("Blockdata:", blockJSON);

        const UniqueTxID = PostID + "_property";
        const WriteStatus = await writeBlockData(
          ClientID,
          SigningPrivateKey,
          UniqueTxID,
          blockJSON,
          blockFiles
        );
        console.log("WriteStatus:", WriteStatus);

        if (WriteStatus.txstatus) {
          const updatedProperty = await Property.updateOne(
            { _id: PostID },
            {
              $set: {
                propertyStatus: "verified", // Update verificationStatus
                propertyVerifier: verifier,
                propertyVerifiedOn: new Date(),
                propertyHash: WriteStatus.txhash,
              },
            }
          );

          // // Check if a VerifiedProperty entry with the given propertyId exists
          // const existingVerification = await VerifiedProperty.findOne({
          //   propertyId: PostID,
          // });

          // if (existingVerification) {
          //   // Update identity status and verifier
          //   existingVerification.propertyStatus = "verified";
          //   const propertyVerifierIndex =
          //     existingVerification.propertyVerifiers.findIndex(
          //       (v) => v.verifierId.toString() === verifier.toString()
          //     );

          //   if (propertyVerifierIndex !== -1) {
          //     // If verifier already exists, check and update the amount allocated
          //     if (
          //       existingVerification.propertyVerifiers[propertyVerifierIndex]
          //         .amountAllocated < 200
          //     ) {
          //       existingVerification.propertyVerifiers[
          //         propertyVerifierIndex
          //       ].amountAllocated += 200;
          //     }
          //   } else {
          //     // If verifier doesn't exist, add a new verifier
          //     existingVerification.propertyVerifiers.push({
          //       verifierId: verifier,
          //       amountAllocated: 200,
          //     });
          //     // Capture the current date for identityVerifiedOn
          //     existingVerification.propertyVerifiedOn = new Date();
          //   }

          //   // Save the updated entry to the database
          //   const updatedVerification = await existingVerification.save();
          //   console.log("Entry updated:", updatedVerification);
          // } else {
          //   // Create a new entry since it doesn't exist
          //   const newVerification = new VerifiedProperty({
          //     propertyId: PostID,
          //     // Identity Verification Fields
          //     propertyStatus: "verified",
          //     propertyVerifiers: [
          //       {
          //         verifierId: verifier,
          //         amountAllocated: 200,
          //       },
          //     ],
          //     // Capture the current date for identityVerifiedOn
          //     propertyVerifiedOn: new Date(),
          //   });

          //   // Save the new entry to the database
          //   const savedVerification = await newVerification.save();
          //   console.log("New entry created:", savedVerification);
          // }

          // Create a new VerifiedProperty entry
          const newVerifiedProperty = new VerifyProperty({
            propertyId: PostID,
            verifierId: verifier,
            verificationStatus: "verified",
            verifiedOn: new Date(),
            amountAllocated: propertyFee, // Set amountAllocated
            verificationType: "property",
          });

          // Save the new entry in the VerifiedProperty model
          await newVerifiedProperty.save();

          const data = {
            updatedProduct: PostID,
            MessageType: "UpdateVerification",
            UniqueTxID: UniqueTxID,
            WriteStatus: WriteStatus,
          };

          console.log("Response Data", data, updatedProperty);
          res.status(200).json({ data: data });
        } else {
          res.status(500).json({ error: "Failed to write block data" });
        }
      });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

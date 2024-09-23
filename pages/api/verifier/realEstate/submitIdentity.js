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

        // Fetch the Identity_Fee value from the Fee model
        const feeDetails = await Fee.findOne();
        const identityFee = feeDetails?.Identity_Fee || 0;

        const PostID = fields.postId[0];
        const verifier = fields.verifier[0];
        const verifierDetails = await Verifier.findById(verifier);

        const identityVerifierName = verifierDetails.name;
        const identityVerifierAdd = verifierDetails.address;

        const blockJSON = JSON.stringify({
          propertyName: fields.propertyName[0],
          Aadhar: fields.Aadhar[0],
          DOB: fields.DOB[0],
          PAN: fields.PAN[0],
          address: fields.address[0],
          fullName: fields.fullName[0],
          price: fields.price[0],
          identityVerifierName: identityVerifierName,
          identityVerifierAdd: identityVerifierAdd,
          identityVerifiedOn: new Date(),
        });
        console.log("PostId", PostID, "Verifier", verifier);
        console.log("Blockdata:", blockJSON);
        const UniqueTxID = PostID + "_identity";
        const WriteStatus = await writeBlockData(
          ClientID,
          SigningPrivateKey,
          UniqueTxID,
          blockJSON
        );
        console.log("WriteStatus:", WriteStatus);
        if (WriteStatus.txstatus) {
          const updatedProperty = await Property.updateOne(
            { _id: PostID },
            {
              $set: {
                identityStatus: "verified", // Update verificationStatus
                identityVerifier: verifier,
                identityVerifiedOn: new Date(),
                identityHash: WriteStatus.txhash,
              },
            }
          );

          // // Check if a VerifiedProperty entry with the given propertyId exists
          // const existingVerification = await VerifiedProperty.findOne({
          //   propertyId: PostID,
          // });

          // if (existingVerification) {
          //   // Update identity status and verifier
          //   existingVerification.identityStatus = "verified";
          //   const identityVerifierIndex =
          //     existingVerification.identityVerifiers.findIndex(
          //       (v) => v.verifierId.toString() === verifier.toString()
          //     );

          //   if (identityVerifierIndex !== -1) {
          //     // If verifier already exists, check and update the amount allocated
          //     if (
          //       existingVerification.identityVerifiers[identityVerifierIndex]
          //         .amountAllocated < 200
          //     ) {
          //       existingVerification.identityVerifiers[
          //         identityVerifierIndex
          //       ].amountAllocated += 200;
          //     }
          //   } else {
          //     // If verifier doesn't exist, add a new verifier
          //     existingVerification.identityVerifiers.push({
          //       verifierId: verifier,
          //       amountAllocated: 200,
          //     });
          //     // Capture the current date for identityVerifiedOn
          //     existingVerification.identityVerifiedOn = new Date();
          //   }

          //   // Save the updated entry to the database
          //   const updatedVerification = await existingVerification.save();
          //   console.log("Entry updated:", updatedVerification);
          // } else {
          //   // Create a new entry since it doesn't exist
          //   const newVerification = new VerifiedProperty({
          //     propertyId: PostID,
          //     // Identity Verification Fields
          //     identityStatus: "verified",
          //     identityVerifiers: [
          //       {
          //         verifierId: verifier,
          //         amountAllocated: 200,
          //       },
          //     ],
          //     // Capture the current date for identityVerifiedOn
          //     identityVerifiedOn: new Date(),
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
            amountAllocated: identityFee, // Set amountAllocated
            verificationType: "identity",
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

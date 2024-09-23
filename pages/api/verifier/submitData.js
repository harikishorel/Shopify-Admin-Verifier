// import { writeBlockData } from "web2toweb3";
import { writeBlockData } from "web2toweb3";
import Products from "@/models/seller/Products";
import { IncomingForm } from "formidable";
import VerifiedProduct from "@/models/verifier/VerifierPayment";
import fs from "fs";

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
      // Create a dynamic blockJSON using data from the form

      const form = new IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ error: "Error parsing form data" });
        }

        const uploadedFile = files.file[0];
        console.log("File upload", uploadedFile);

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

        const buffer = fs.readFileSync(filePath);
        console.log("Buffer", buffer);
        // Prepare blockFiles for writeBlockData (adjust based on its requirements)
        // const blockFiles = uploadedFile;
        let blockFiles = [
          { originalname: files.file[0].originalFilename, buffer: buffer },
        ];
        console.log("Files", blockFiles);

        const blockJSON = JSON.stringify({
          Saree: fields.productName[0],
          SareeColour: fields.sareeColour[0],
          BorderColour: fields.borderColour[0],
          Fabric: fields.fabric[0],
          Zari: fields.zari[0],
          Length: fields.length[0],
          Weight: fields.weight[0],
          ZariTest: fields.zariTest[0],
        });
        const PostID = fields.postId[0];
        const verifier = fields.verifier[0];
        // const PostID = "dwh98rhf9w";

        console.log("PostId", PostID, "Verifier", verifier);

        console.log("Blockdata:", blockJSON);
        const UniqueTxID = PostID + "_info";
        const WriteStatus = await writeBlockData(
          ClientID,
          SigningPrivateKey,
          UniqueTxID,
          blockJSON,
          blockFiles
        );
        console.log("WriteStatus:", WriteStatus);

        if (WriteStatus.txstatus) {
          const updatedProduct = await Products.updateOne(
            { _id: PostID },
            {
              $set: {
                verificationStatus: "verified",
                verifier: verifier,
                verifiedOn: new Date(),
              },
            }
          );

          // Create an object in the VerifiedProduct collection
          const verifiedProductData = new VerifiedProduct({
            productId: PostID,
            verifierId: verifier,
            verifiedDate: new Date(),
            verificationStatus: "verified",
            totalAmount: 200,
            paymentStatus: "pending",
          });

          const createdVerifiedProduct = await verifiedProductData.save();

          const data = {
            updatedProduct: PostID,
            MessageType: "UpdateVerification",
            UniqueTxID: UniqueTxID,
            WriteStatus: WriteStatus,
          };
          console.log(
            "Response Data",
            data,
            updatedProduct,
            createdVerifiedProduct
          );
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

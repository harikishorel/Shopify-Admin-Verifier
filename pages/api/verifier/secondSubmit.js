// import { writeBlockData } from "web2toweb3";
import { writeBlockData } from "web2toweb3";
import { IncomingForm } from "formidable";

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

        const blockJSON = JSON.stringify({
          SareeNew: fields.productName[0],
          SareeColourNew: fields.sareeColour[0],
          BorderColourNew: fields.borderColour[0],
          FabricNew: fields.fabric[0],
          ZariNew: fields.zari[0],
          LengthNew: fields.length[0],
          WeightNew: fields.weight[0],
          ZariTestNew: fields.zariTest[0],
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
          blockJSON
        );
        console.log("WriteStatus:", WriteStatus);

        if (WriteStatus.txstatus) {
          const data = {
            updatedProduct: PostID,
            MessageType: "UpdateVerification",
            UniqueTxID: UniqueTxID,
            WriteStatus: WriteStatus,
          };
          console.log("Response Data", data);
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

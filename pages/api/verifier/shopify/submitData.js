import { writeBlockData } from "web2toweb3";
import ShopifyProducts from "@/models/ShopifyProducts";
import { IncomingForm } from "formidable";
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

                const blockJSON = JSON.stringify({
                    ProductName: fields.productName[0],
                    ProductId: fields.productId[0],
                    Price: fields.price[0],
                    ProductUrl: fields.productUrl[0],
                });
                const PostID = fields.postId[0];
                const verifier = fields.verifier[0];

                console.log("Blockdata:", blockJSON);
                const UniqueTxID = PostID + "_info";
                const WriteStatus = await writeBlockData(
                    ClientID,
                    SigningPrivateKey,
                    UniqueTxID,
                    blockJSON);
                console.log("WriteStatus:", WriteStatus);

                if (WriteStatus.txstatus) {
                    const updatedProduct = await ShopifyProducts.updateOne(
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
                    // const verifiedProductData = new VerifiedProduct({
                    //     productId: PostID,
                    //     verifierId: verifier,
                    //     verifiedDate: new Date(),
                    //     verificationStatus: "verified",
                    //     totalAmount: 200,
                    //     paymentStatus: "pending",
                    // });

                    // const createdVerifiedProduct = await verifiedProductData.save();

                    const data = {
                        updatedProduct: PostID,
                        MessageType: "UpdateVerification",
                        UniqueTxID: UniqueTxID,
                        WriteStatus: WriteStatus,
                    };
                    console.log(
                        "Response Data",
                        data,
                        updatedProduct
                    );
                    res.status(200).json({ data: data });
                } else {
                    res.status(500).json({ error: "Failed to write block data" });
                }
            })
        } catch (error) {
            console.error("Error processing data:", error);
            res.status(500).json({ error: "Server error" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

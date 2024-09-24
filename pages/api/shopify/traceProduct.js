import { readBlockData } from "web2toweb3";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const ClientID = process.env.WEB3CLIENTID;
        const SigningPrivateKey = process.env.SIGN_PRIVATEKEY;
        const PostID = req.query.propertyId;

        try {
            const verifiedData = await readBlockData(
                ClientID,
                SigningPrivateKey,
                PostID + "_info"
            );
            console.log("VErified DAta", verifiedData)
            const BlockchainData_info = verifiedData.blockJSON && verifiedData.blockJSON.length > 0
                ? verifiedData.blockJSON[0]
                : null

            const data = {
                PostID,
                BlockchainData_info,
            };
            res.status(200).json({ data: data });
        } catch (error) {
            console.error("Error processing data:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
}

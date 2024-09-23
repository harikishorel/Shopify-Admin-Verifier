import { readBlockData } from "web2toweb3";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const ClientID = process.env.WEB3CLIENTID;
    const SigningPrivateKey = process.env.SIGN_PRIVATEKEY;
    const PostID = req.query.propertyId;
    try {
      const IdentityStatus = await readBlockData(
        ClientID,
        SigningPrivateKey,
        PostID + "_identity"
      );

      const PropertyStatus = await readBlockData(
        ClientID,
        SigningPrivateKey,
        PostID + "_property"
      );

      console.log("Identity response", IdentityStatus);
      console.log("Property response", PropertyStatus);

      // Check if blockJSON is defined and not empty
      const BlockchainData_identity =
        IdentityStatus.blockJSON && IdentityStatus.blockJSON.length > 0
          ? IdentityStatus.blockJSON[0]
          : null;

      const BlockchainData_property =
        PropertyStatus.blockJSON && PropertyStatus.blockJSON.length > 0
          ? PropertyStatus.blockJSON[0]
          : null;

      const BlockchainData_info_identity =
        JSON.parse(BlockchainData_identity) || "NA";

      const BlockchainData_info_property =
        JSON.parse(BlockchainData_property) || "NA";

      const data = {
        PostID,
        BlockchainData_info_identity,
        BlockchainData_info_property,
      };
      res.status(200).json({ data: data });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

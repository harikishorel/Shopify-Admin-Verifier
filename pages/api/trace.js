import { readBlockData } from "web2toweb3";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const ClientID = process.env.WEB3CLIENTID;
    const SigningPrivateKey = process.env.SIGN_PRIVATEKEY;
    const PostID = req.query.propertyId;

    try {
      const ReadStatus = await readBlockData(
        ClientID,
        SigningPrivateKey,
        PostID + "_info"
      );

      if (!ReadStatus.txstatus) {
        res.status(500).json({ error: "Failed to read block data" });
      }

      console.log("Response Data", ReadStatus);

      // // Find the object with the "propertyName" field
      // const blockchainDataArray_identity = ReadStatus.blockJSON.find(
      //   (blockData) => JSON.parse(blockData[0]).propertyName !== undefined
      // );

      // if (!blockchainDataArray_identity) {
      //   res.status(404).json({ error: "propertyName not found in blockJSON" });
      //   return;
      // }

      // const BlockchainData_info_identity = JSON.parse(
      //   blockchainDataArray_identity[0]
      // );

      // // Find the object with the "propertyType" field
      // const blockchainDataArray_property = ReadStatus.blockJSON.find(
      //   (blockData) => JSON.parse(blockData[0]).propertyType !== undefined
      // );

      // if (!blockchainDataArray_property) {
      //   res.status(404).json({ error: "propertyType not found in blockJSON" });
      //   return;
      // }

      // const BlockchainData_info_property = JSON.parse(
      //   blockchainDataArray_property[0]
      // );

      // Find the object with the "propertyName" field
      const blockchainDataArray_identity = ReadStatus.blockJSON.find(
        (blockData) => JSON.parse(blockData[0]).propertyName !== undefined
      );

      // Return an empty array if "propertyName" field is not found
      const BlockchainData_info_identity = blockchainDataArray_identity
        ? JSON.parse(blockchainDataArray_identity[0])
        : [];

      // Find the object with the "propertyType" field
      const blockchainDataArray_property = ReadStatus.blockJSON.find(
        (blockData) => JSON.parse(blockData[0]).propertyType !== undefined
      );

      // Return an empty array if "propertyType" field is not found
      const BlockchainData_info_property = blockchainDataArray_property
        ? JSON.parse(blockchainDataArray_property[0])
        : [];

      const data = {
        PostID: PostID,
        BlockchainData_info_identity: BlockchainData_info_identity,
        BlockchainData_info_property: BlockchainData_info_property,
      };

      console.log("Data", data);
      res.status(200).json({ data: data });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

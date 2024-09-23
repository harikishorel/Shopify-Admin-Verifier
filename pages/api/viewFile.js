import { viewFile } from "web2toweb3";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const ClientID = process.env.WEB3CLIENTID;
      const { FileName, FileHash } = req.query;

      const FileBuffer = await viewFile(ClientID, FileName, FileHash);

      // Set Content-Type to "application/octet-stream"
      //   res.setHeader("Content-Type", "image/png");
      //   res.send(FileBuffer);

      // Determine the content type based on the file extension
      const fileType = FileName.split(".").pop(); // Get the file extension

      let contentType = "application/octet-stream";

      if (fileType === "jpg" || fileType === "jpeg") {
        contentType = "image/jpeg";
      } else if (fileType === "png") {
        contentType = "image/png";
      }

      // Set Content-Type to the determined type
      res.setHeader("Content-Type", contentType);
      res.send(FileBuffer);
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

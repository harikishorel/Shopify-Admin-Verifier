import connectDB from "@/utils/connectDB";
import Property from "@/models/Property";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Connect to the database
      await connectDB();

      const verifiedProperties = await Property.find({
        $and: [
          { identityStatus: "verified" },
          { propertyStatus: "verified" },
          { documentStatus: "verified" },
        ],
      });

      // Check if properties exist
      if (!verifiedProperties || verifiedProperties.length === 0) {
        return res.status(200).json([]);
      }

      // Calculate the latest verification date for each property
      const propertiesWithVerificationDate = verifiedProperties.map(
        (property) => {
          const verificationDates = [
            property.documentVerifiedOn,
            property.propertyVerifiedOn,
            property.identityVerifiedOn,
          ];
          // Filter out undefined dates
          const validDates = verificationDates.filter((date) => !!date);
          // Find the latest date among valid dates
          const latestDate = new Date(Math.max(...validDates));
          // Return the property with the verificationDate field
          return {
            ...property.toObject(),
            verificationDate: latestDate,
          };
        }
      );

      // Send the response with the fetched data
      res.status(200).json(propertiesWithVerificationDate);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

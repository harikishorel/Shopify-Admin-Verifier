import connectDB from "@/utils/connectDB";
import Property from "@/models/Property";
import VerifyProperty from "@/models/Payment/VerifiedProperty";
import Fee from "@/models/Fee";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to the database
      await connectDB();

      // Fetch the Property_Fee value from the Fee model
      const feeDetails = await Fee.findOne();
      const propertyFee = feeDetails?.Property_Fee || 0;

      const reason = req.body.reason;
      const prodId = req.body.PropertyId;
      const verifierId = req.body.verifierId;
      // // Find the product by prodId
      const property = await Property.findById(prodId);

      if (!property) {
        return res.status(404).json({ error: "property not found" });
      }

      if (!property.propertyRejectReason) {
        // If it doesn't exist, add the "rejectReason" field dynamically
        await Property.updateOne(
          { _id: prodId },
          {
            $set: {
              propertyRejectReason: reason,
              propertyStatus: "rejected", // Update verificationStatus
              propertyRejectVerifier: verifierId, // Set verifier field
            },
          }
        );
      } else {
        // If it exists, update the "rejectReason" field
        await Property.updateOne(
          { _id: prodId },
          {
            $set: {
              propertyRejectReason: reason,
              propertyStatus: "rejected", // Update verificationStatus
              propertyRejectVerifier: verifierId, // Set verifier field
            },
          }
        );
      }

      // // Check if a VerifiedProperty entry with the given propertyId exists
      // const existingVerification = await VerifiedProperty.findOne({
      //   propertyId: prodId,
      // });

      // if (existingVerification) {
      //   // Update identity status and verifier
      //   existingVerification.propertyStatus = "rejected";
      //   const propertyVerifierIndex =
      //     existingVerification.propertyVerifiers.findIndex(
      //       (v) => v.verifierId.toString() === verifierId.toString()
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
      //       verifierId: verifierId,
      //       amountAllocated: 200,
      //     });
      //     // Capture the current date for propertyVerifiedOn
      //     existingVerification.propertyVerifiedOn = new Date();
      //   }

      //   // Save the updated entry to the database
      //   const updatedVerification = await existingVerification.save();
      //   console.log("Entry updated:", updatedVerification);
      //   // Respond with a success message or any other relevant data
      //   res.status(200).json({
      //     message: "Property verification rejected successfully. Updated Entry",
      //     data: updatedVerification,
      //   });
      // } else {
      //   // Create a new entry since it doesn't exist
      //   const newVerification = new VerifiedProperty({
      //     propertyId: prodId,
      //     // Property Verification Fields
      //     propertyStatus: "rejected",
      //     propertyVerifiers: [
      //       {
      //         verifierId: verifierId,
      //         amountAllocated: 200,
      //       },
      //     ],
      //     // Capture the current date for propertyVerifiedOn
      //     propertyVerifiedOn: new Date(),
      //   });

      //   // Save the new entry to the database
      //   const savedVerification = await newVerification.save();
      //   console.log("New entry created:", savedVerification);
      //   // Respond with a success message or any other relevant data
      //   res.status(200).json({
      //     message: "Property verification rejected successfully. New Entry",
      //     data: savedVerification,
      //   });
      // }

      const newVerifiedProperty = new VerifyProperty({
        propertyId: prodId,
        verifierId: verifierId,
        verificationStatus: "rejected",
        verifiedOn: new Date(),
        amountAllocated: propertyFee, // Set amountAllocated
        verificationType: "property",
      });
      // Save the new entry in the VerifiedProperty model
      const savedVerification = await newVerifiedProperty.save();
      res.status(200).json({
        message: "Property verification rejected successfully. New Entry",
        data: savedVerification,
      });
    } catch (error) {
      console.error("Error processing data:", error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

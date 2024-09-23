// import connectDB from "@/utils/connectDB";
// import Verifier from "@/models/Verifier";
// import VerifiedProperty from "@/models/verifier/VerifyPayment";

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     try {
//       await connectDB();

//       const { verifierId, paymentId } = req.body;
//       console.log("verifierId", verifierId, paymentId);

//       // Capture the current date
//       const currentDate = new Date();

//       await VerifiedProperty.updateMany(
//         { "identityVerifiers.verifierId": verifierId, "identityVerifiers.paymentStatus": "pending" },
//         {
//           $set: {
//             "identityVerifiers.$.paymentStatus": "paid",
//             "identityVerifiers.$.paymentDate": currentDate,
//             "identityVerifiers.$.rzpaymentId": paymentId,
//           },
//         }
//       );

//       // Update propertyVerifiers
//       await VerifiedProperty.updateMany(
//         { "propertyVerifiers.verifierId": verifierId, "propertyVerifiers.paymentStatus": "pending" },
//         {
//           $set: {
//             "propertyVerifiers.$.paymentStatus": "paid",
//             "propertyVerifiers.$.paymentDate": currentDate,
//             "propertyVerifiers.$.rzpaymentId": paymentId,
//           }
//         }
//       );

//       // Update documentVerifiers
//       await VerifiedProperty.updateMany(
//         { "documentVerifiers.verifierId": verifierId, "documentVerifiers.paymentStatus": "pending" },
//         {
//           $set: {
//             "documentVerifiers.$.paymentStatus": "paid",
//             "documentVerifiers.$.paymentDate": currentDate,
//             "documentVerifiers.$.rzpaymentId": paymentId,
//           }
//         }
//       );

//       // Assuming `verifier` is supposed to be fetched from somewhere, as it's not defined in the provided code snippet

//       res.status(200).json();
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Server error" });
//     }
//   } else {
//     res.status(405).json({ error: "Method not allowed" });
//   }
// }

import connectDB from "@/utils/connectDB";
import VerifyProperty from "@/models/Payment/VerifiedProperty";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await connectDB();

      // Get the verifierId from the request body
      const { verifierId, paymentId } = req.body;
      console.log("verifierId", verifierId, paymentId);

      // Capture the current date
      const currentDate = new Date();

      // Update the paymentStatus for the specified VerifyProperty
      const updateResult = await VerifyProperty.updateMany(
        {
          verifierId,
          paymentStatus: "pending",
        },
        {
          $set: {
            paymentStatus: "paid",
            paymentDate: currentDate, // Set to the same value as the filter criteria or a new value
            rzpaymentId: paymentId, // Set to the same value as the filter criteria or a new value
          },
        }
      );
      console.log("updated results", updateResult);

      // Check the update result
      if (updateResult.modifiedCount > 0) {
        return res
          .status(200)
          .json({ message: "VerifiedProduct status updated to 'sold'" });
      } else {
        return res.status(200).json({
          message: "No matching VerifiedProduct found or no updates needed",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

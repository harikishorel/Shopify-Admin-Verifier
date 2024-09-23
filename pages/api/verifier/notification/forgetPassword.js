import OtpEmailTemplate from "@/components/EmailTemplate/OtpEmailTemplate";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { connectSES } from "@/utils/connectAWS";
import { renderToString } from "react-dom/server";
import Verifier from "@/models/Verifier";
import connectDB from "@/utils/connectDB";

export default async (req, res) => {
  const { toAddress } = req.body;
  const fromAddress = "vasthrasilks12@gmail.com";

  await connectDB();

  if (!toAddress || !fromAddress) {
    return res
      .status(400)
      .json({ error: "Missing required parameters in the request body" });
  }

  const verifier = await Verifier.findOne({ email: toAddress });

  if (!verifier) {
    return res.status(404).json({ error: "Email is not registered" });
  }

  // Generate OTP
  const otp = generateOTP();

  const emailTemplateComponent = <OtpEmailTemplate otp={otp} />;

  const emailBodyHTML = renderToString(emailTemplateComponent);

  const params = {
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Data: emailBodyHTML,
        },
      },
      Subject: {
        Data: `One-Time-Password `,
      },
    },
    Source: fromAddress,
  };

  try {
    // Send the email
    await connectSES.send(new SendEmailCommand(params));
    // Send the OTP as part of the response
    res.status(200).json({ message: "Email sent successfully", otp });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

function generateOTP() {
  const otp = Math.floor(10000 + Math.random() * 90000);
  return otp.toString();
}

import { SendEmailCommand } from "@aws-sdk/client-ses";
import { connectSES } from "@/utils/connectAWS";
import { renderToString } from "react-dom/server";
import VerifierCreate from "@/components/EmailTemplate/VerifierCreate";
import VerifierStatusUpdate from "@/components/EmailTemplate/VerifierStatusUpdate";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Extract destination and source addresses from the req.body
    const { email, status } = req.body;

    const fromAddress = "vasthrasilks12@gmail.com";
    // Check if required parameters are present in the request body
    if (!email) {
      return res
        .status(400)
        .json({ error: "Missing required parameters in the request body" });
    }

    // Determine the message based on the status
    const message = status
      ? "Your account has been made active. You can login to your dashboard"
      : "Your account has been made inactive. Please contact admin for further details";

    const emailBodyHTML = renderToString(
      <VerifierStatusUpdate message={message} />
    );
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Data: emailBodyHTML,
          },
        },
        Subject: {
          Data: "Verifier Status Changed",
        },
      },
      Source: fromAddress,
    };

    try {
      const data = await connectSES.send(new SendEmailCommand(params));
      console.log("Email sent:", data);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

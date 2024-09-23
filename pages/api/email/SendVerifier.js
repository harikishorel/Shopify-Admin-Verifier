import { SendEmailCommand } from "@aws-sdk/client-ses";
import { connectSES } from "@/utils/connectAWS";
import { renderToString } from "react-dom/server";
import VerifierCreate from "@/components/EmailTemplate/VerifierCreate";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Extract destination and source addresses from the req.body
    const { email, password } = req.body;

    const fromAddress = "vasthrasilks12@gmail.com";
    // Check if required parameters are present in the request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required parameters in the request body" });
    }

    const emailBodyHTML = renderToString(
      <VerifierCreate email={email} password={password} />
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
          Data: "Verifier Credentials",
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

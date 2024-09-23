import React from "react";
import { Tailwind } from "@react-email/components";

const OtpEmailTemplate = ({ otp }) => {
  return (
    <Tailwind>
      <head>{/* Add any necessary head elements here */}</head>
      <body>
        <section className="bg-white dark:bg-gray-900">
          <div className="font-sans max-w-xl mx-auto p-4 border border-gray-300 rounded-lg shadow-lg">
            <div className="px-4 mx-auto max-w-screen-xl text-center">
              <img
                src="https://vasthra.s3.ap-south-1.amazonaws.com/Vasthra-logo-light-removebg.png"
                alt="Logo"
                className="px-4 mx-auto max-w-screen-xl"
              />
            </div>
            <h1 className="text-lg font-bold mb-2">Dear User,</h1>
            <p className="text-base mb-4">Your One-Time Password (OTP) is:</p>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">{otp}</h2>
            <p className="text-base mb-4">
              This OTP is valid for a short period. Do not share it with anyone.
            </p>
            <p className="text-lg font-bold mb-2">
              Thank you for using our services!
            </p>
            <p className="text-base mt-4">
              Best regards,
              <br />
              Vasthraa
            </p>
          </div>
        </section>
      </body>
    </Tailwind>
  );
};

export default OtpEmailTemplate;

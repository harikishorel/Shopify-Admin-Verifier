import React, { Fragment } from "react";
import { Tailwind } from "@react-email/tailwind";

const SellerStatusUpdate = ({ message }) => {
  return (
    <Fragment>
      <Tailwind>
        <head>{/* Add any necessary head elements here */}</head>
        <body>
          <section className="bg-white">
            <div className=" px-4 mx-auto max-w-screen-xl text-center">
              <img
                src="https://vasthra.s3.ap-south-1.amazonaws.com/Vasthra-logo-light-removebg.png"
                alt="Logo"
                className=" px-4 mx-auto max-w-screen-xl"
              />
            </div>
            <div className="py-1 px-4 mx-auto max-w-screen-xl text-center">
              {/* <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl ">
                Welcome to Vasthra
              </h1> */}
              <p className="mb-4 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48">
                {message}
              </p>
            </div>

            <div className="py-1 px-4 mx-auto max-w-screen-xl text-center ">
              <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48">
                Thank You
              </p>
            </div>
          </section>
        </body>
      </Tailwind>
    </Fragment>
  );
};

export default SellerStatusUpdate;

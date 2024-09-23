import React from "react";
import { Tailwind } from "@react-email/components";
const EmailTemp = ({ message }) => {
  return (
    // <section style={{ backgroundColor: "#fff" }} className="dark:bg-gray-900">
    //   <div
    //     style={{
    //       paddingTop: "8rem",
    //       paddingRight: "4rem",
    //       paddingLeft: "4rem",
    //       margin: "auto",
    //       maxWidth: "80rem",
    //       textAlign: "center",
    //     }}
    //     className="lg:py-16">
    //     <h1
    //       style={{
    //         marginBottom: "4rem",
    //         fontSize: "2.5rem",
    //         fontWeight: "800",
    //         letterSpacing: "-0.02em",
    //         lineHeight: "1",
    //         color: "#333",
    //       }}
    //       className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
    //       We invest in the world’s potential
    //     </h1>
    //     <p
    //       style={{
    //         marginBottom: "8rem",
    //         fontSize: "1.25rem",
    //         fontWeight: "400",
    //         letterSpacing: "-0.01em",
    //         lineHeight: "1.6",
    //         color: "#6b7280",
    //       }}
    //       className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
    //       Here at Flowbite we focus on markets where technology, innovation, and
    //       capital can unlock long-term value and drive economic growth.
    //     </p>
    //     <div
    //       style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    //       className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
    //       <button
    //         style={{
    //           justifyContent: "center",
    //           alignItems: "center",
    //           padding: "0.75rem 1.25rem",
    //           fontSize: "1rem",
    //           fontWeight: "500",
    //           textAlign: "center",
    //           color: "#fff",
    //           borderRadius: "0.375rem",
    //           backgroundColor: "#1e40af",
    //         }}
    //         className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
    //         Get started
    //       </button>
    //       <h1>{message}</h1>
    //       <button
    //         style={{
    //           justifyContent: "center",
    //           alignItems: "center",
    //           padding: "0.75rem 1.25rem",
    //           fontSize: "1rem",
    //           fontWeight: "500",
    //           textAlign: "center",
    //           color: "#333",
    //           borderRadius: "0.375rem",
    //           borderWidth: "1px",
    //           borderStyle: "solid",
    //           backgroundColor: "#f3f4f6",
    //         }}
    //         className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
    //         Learn more
    //       </button>
    //     </div>
    //   </div>
    // </section>
    <Tailwind>
      <head>{/* Add any necessary head elements here */}</head>
      <body>
        <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
              We invest in the world’s potential
            </h1>
            <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-400">
              Here at Flowbite we focus on markets where technology, innovation,
              and capital can unlock long-term value and drive economic growth.
            </p>
            <h1>{message}</h1>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              <button className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                Get started
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </button>
              <button className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                Learn more
              </button>
            </div>
          </div>
        </section>
      </body>
    </Tailwind>
  );
};

export default EmailTemp;

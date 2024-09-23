import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function getServerSideProps(context) {
  const { propertyId } = context.query;
  const URL = process.env.URL;

  try {
    const response = await axios.get(
      `${URL}/api/propertyTrace?propertyId=${propertyId}`
    );
    return {
      props: {
        // product: Response.data,
        product: response.data,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        product: null,
      },
    };
  }
}

const Product = ({ product: initialProduct }) => {
  const [product, setProduct] = useState(initialProduct);
  console.log("Property", product);
  // Front Image
  const fileFrontHash =
    product?.data?.BlockchainData_info_property?.Files?.[0]?.FileHash || "";
  const fileFrontName =
    product?.data?.BlockchainData_info_property?.Files?.[0]?.FileName || "";

  // Back Image
  const fileBackHash =
    product?.data?.BlockchainData_info_property?.Files?.[1]?.FileHash || "";
  const fileBackName =
    product?.data?.BlockchainData_info_property?.Files?.[1]?.FileName || "";

  //  Lacality Image
  const fileLocalHash =
    product?.data?.BlockchainData_info_property?.Files?.[2]?.FileHash || "";
  const fileLocalName =
    product?.data?.BlockchainData_info_property?.Files?.[2]?.FileName || "";

  // Side Image
  const fileSideHash =
    product?.data?.BlockchainData_info_property?.Files?.[3]?.FileHash || "";
  const fileSideName =
    product?.data?.BlockchainData_info_property?.Files?.[3]?.FileName || "";

  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const toggleAccordion1 = () => {
    setIsOpen1(!isOpen1);
  };

  const toggleAccordion2 = () => {
    setIsOpen2(!isOpen2);
  };

  const openAllAccordions = () => {
    setIsOpen(true);
    setIsOpen1(true);
    setIsOpen2(true);
  };

  const pdfRef = useRef();

  const downloadPdf = () => {
    openAllAccordions();

    const input = pdfRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4", true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save("invoice.pdf");
    });
  };

  // const downloadPdf = () => {
  //   openAllAccordions();

  //   const input = pdfRef.current;
  //   const pdf = new jsPDF("p", "mm", "a4", true);
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = pdf.internal.pageSize.getHeight() * 2; // Double the height or adjust as needed

  //   const contentHeight = input.clientHeight;
  //   const totalContentHeight = contentHeight;
  //   const pages = Math.ceil(totalContentHeight / pdfHeight);

  //   for (let i = 0; i < pages; i++) {
  //     const startY = i * pdfHeight;
  //     const endY = (i + 1) * pdfHeight;

  //     // Create a canvas for each portion of content
  //     const canvas = document.createElement("canvas");
  //     const context = canvas.getContext("2d");
  //     canvas.width = input.clientWidth;
  //     canvas.height = pdfHeight;

  //     // Draw the portion of content onto the canvas
  //     context.drawImage(
  //       input,
  //       0,
  //       startY,
  //       input.clientWidth,
  //       pdfHeight,
  //       0,
  //       0,
  //       input.clientWidth,
  //       pdfHeight
  //     );

  //     // Convert the canvas to an image data URL
  //     const imgData = canvas.toDataURL("image/png");

  //     // Add the image data to the PDF
  //     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  //     // Add a new page if there are more pages to follow
  //     if (i < pages - 1) {
  //       pdf.addPage();
  //     }
  //   }

  //   // Save the PDF with a unique name
  //   pdf.save("multi-page-invoice.pdf");
  // };

  return (
    // <div className="bg-gray-200 h-full flex flex-col justify-center">
    <div id="pdfContent" className="h-full" ref={pdfRef}>
      <header className="flex justify-start bg13 p-4">
        <h1 className="text-xl font-bold text-white">TRACE</h1>
      </header>
      <div className="bg-blue-800 text-white font-bold uppercase mb-2">
        <Marquee className="gap-3">
          The information given below are coming from blockchain.
        </Marquee>
      </div>
      <section>
        <div className="flex justify-around flex-wrap gap-5">
          <div className="max-w-full md:max-w-3xl p-6 bg-white border border-gray-200 rounded-lg shadow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div id="Seller Details">
                <h1 className="bg-gray-400 text-white p-1 font-bold rounded-sm">
                  Seller Details
                </h1>
                <div className="flex">
                  <img
                    src="/agent.png"
                    alt="Seller"
                    className="w-16 h-16 p-1"
                  />
                  <div className="flex mt-1">
                    <div className="flex flex-col w-1/4">
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Name:
                      </h5>
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Address:
                      </h5>
                    </div>
                    <div className="flex flex-col mx-5 w-3/4">
                      <h5 className="text-l font-normal tracking-tight text-gray-900">
                        {product?.data?.BlockchainData_info_identity?.fullName}
                      </h5>
                      <p className="text-l font-normal tracking-tight text-gray-900 whitespace-normal overflow-hidden overflow-ellipsis">
                        {product?.data?.BlockchainData_info_identity?.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div id="Identity Verifier Details">
                <h1 className="bg-green-400 text-white p-1 font-bold rounded-sm">
                  Identity Verifier
                </h1>
                <div className="flex">
                  <img
                    src="/group.png"
                    alt="Verifier"
                    className="w-16 h-16 p-1"
                  />
                  <div className="flex mt-2">
                    <div className="flex flex-col w-1/4">
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Name:
                      </h5>
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Address:
                      </h5>
                    </div>
                    <div className="flex flex-col mx-5 w-3/4">
                      <h5 className="text-l font-normal tracking-tight text-gray-900">
                        {product?.data?.BlockchainData_info_identity
                          ?.identityVerifierName || "NA"}
                      </h5>
                      <p className="text-l font-normal tracking-tight text-gray-900 whitespace-normal overflow-hidden overflow-ellipsis">
                        {product?.data?.BlockchainData_info_identity
                          ?.identityVerifierAdd || "NA"}{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div id="Property Verifier Details">
                <h1 className="bg-green-400 text-white p-1 font-bold rounded-sm">
                  Property Verifier
                </h1>
                <div className="flex">
                  <img
                    src="/group.png"
                    alt="Verifier"
                    className="w-16 h-16 p-1"
                  />

                  <div className="flex mt-2">
                    <div className="flex flex-col w-1/4">
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Name:
                      </h5>
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Address:
                      </h5>
                    </div>
                    <div className="flex flex-col mx-5 w-3/4">
                      <h5 className="text-l font-normal tracking-tight text-gray-900">
                        {product?.data?.BlockchainData_info_property
                          ?.propertyVerifierName || "NA"}
                      </h5>
                      <p className="text-l font-normal tracking-tight text-gray-900 whitespace-normal overflow-hidden overflow-ellipsis">
                        {product?.data?.BlockchainData_info_property
                          ?.propertyVerifierAdd || "NA"}{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div id="Document Verifier Details">
                <h1 className="bg-green-400 text-white p-1 font-bold rounded-sm">
                  Document Verifier
                </h1>
                <div className="flex">
                  <img
                    src="/group.png"
                    alt="Verifier"
                    className="w-16 h-16 p-1"
                  />

                  <div className="flex flex-row gap-5 mt-2">
                    <div className="flex flex-col w-1/4">
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Name:
                      </h5>
                      <h5 className="text-l font-semibold tracking-tight text-gray-900">
                        Address:
                      </h5>
                    </div>
                    <div className="flex flex-col mx-5 w-3/4">
                      <h5 className="text-l font-normal tracking-tight text-gray-900">
                        {product?.data?.BlockchainData_info_property
                          ?.DocumentVerifierName || "NA"}
                      </h5>
                      <p className="text-l font-normal tracking-tight text-gray-900 whitespace-normal overflow-hidden overflow-ellipsis">
                        {product?.data?.BlockchainData_info_property
                          ?.DocumentVerifierAdd || "NA"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-full lg:max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow flex flex-col justify-around">
            <div className="flex gap-2 items-center">
              <img
                src="/block.png"
                alt="Block"
                className="w-10 h-10 rotate-animation"
              />
              <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
                Blockchain Data
              </h5>
            </div>
            <div>
              <p className="mb-3 font-bold text-gray-500">
                Identity tx hash:{" "}
                <span
                  style={{ wordBreak: "break-all" }}
                  className="font-normal">
                  0x2446f1fd773fbb9f080e674b60c6a033c7ed7427b8b9413cf28a2a4a6d
                </span>
              </p>{" "}
              <p className="mb-3 font-bold text-gray-500">
                Property tx hash:{" "}
                <span
                  style={{ wordBreak: "break-all" }}
                  className="font-normal">
                  0x2446f1fd773fbb9f080e674b60c6a033c7ed7427b8b9413cf28a2a4a6d
                </span>
              </p>{" "}
              <p className="mb-3 font-bold text-gray-500">
                Document tx hash:{" "}
                <span
                  style={{ wordBreak: "break-all" }}
                  className="font-normal">
                  0x2446f1fd773fbb9f080e674b60c6a033c7ed7427b8b9413cf28a2a4a6d
                </span>
              </p>{" "}
            </div>
            <a
              href="http://34.203.10.15:4000/"
              target="_blank"
              className="inline-flex font-medium items-center text-blue-600 hover:underline">
              Block Explorer
              <svg
                className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center mx-5 lg:mx-10 my-5 font-semibold opacity-80 gap-1">
          <span className="flex items-center">
            <img src="/mark.png" className="w-6 h-6" />
          </span>
          <h3 className="cursor-pointer" onClick={openAllAccordions}>
            Click to view verified information
          </h3>
        </div>
        <div className="h-full flex flex-col justify-center w-full md:w-5/6 mx-auto">
          <div className="bg-green-100 rounded-t-xl">
            <div id="accordion-open" data-accordion="open">
              <h2 id="accordion-open-heading-1">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium rtl:text-right  border border-b-0 border-gray-200 rounded-t-xl focus:ring-2 focus:ring-black gap-3"
                  onClick={toggleAccordion}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls="accordion-open-body-1">
                  <span className="flex items-center gap-1">
                    <img src="/verifiedi.png" className="w-6 h-6" />
                    Identity Information
                  </span>
                  <svg
                    data-accordion-icon=""
                    className={`w-3 h-3 ${
                      !isOpen ? "rotate-180" : ""
                    } shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>
              <div
                id="accordion-open-body-1"
                className={`p-5 border ${
                  isOpen ? "border-b-0" : ""
                } border-gray-200`}
                style={{ display: isOpen ? "block" : "none" }}
                aria-labelledby="accordion-open-heading-1">
                {/* <img
                  src="/home.png"
                  alt="Verifier"
                  className="w-20 h-20 absolute left-1/2 mt-80 transform -translate-x-1/2 -translate-y-1/2 mx-auto max-w-screen-xl opacity-10"
                /> */}
                <form className="mx-auto bg-white p-5 rounded-xl max-w-lg z-10">
                  {/* <h1 className="font-semibold text-2xl mb-5">
                  Identity verification for property
                </h1> */}
                  <div id="Identity Verifier Details">
                    <h1 className="bg-green-400 text-white p-1 font-bold rounded-sm">
                      Identity Verifier
                    </h1>
                    <div className="flex">
                      <div className="w-1/6">
                        <img
                          src="/group.png"
                          alt="Verifier"
                          className="w-16 h-16 p-1"
                        />
                      </div>
                      <div className="flex mt-2 w-5/6">
                        <div className="flex flex-col w-1/4">
                          <h5 className="text-l font-semibold tracking-tight text-gray-900">
                            Name:
                          </h5>
                          <h5 className="text-l font-semibold tracking-tight text-gray-900">
                            Address:
                          </h5>
                        </div>
                        <div className="flex flex-col w-3/4">
                          <h5 className="text-l font-normal  text-gray-900">
                            {product?.data?.BlockchainData_info_identity
                              ?.identityVerifierName || "NA"}
                          </h5>
                          <p className="text-l font-normal  text-gray-900">
                            {product?.data?.BlockchainData_info_identity
                              ?.identityVerifierAdd || "NA"}{" "}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Property Name
                    </label>
                    <input
                      type="text"
                      id="disabled-input-2"
                      aria-label="disabled input 2"
                      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity
                          ?.propertyName
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Owner
                    </label>
                    <input
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.fullName
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Price
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.price
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Address
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.address
                      }
                      disabled
                      readOnly
                    />
                  </div>{" "}
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Date
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.DOB
                      }
                      disabled
                      readOnly
                    />
                  </div>{" "}
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Pan
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.PAN
                      }
                      disabled
                      readOnly
                    />
                  </div>{" "}
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Aadhar
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity?.Aadhar
                      }
                      disabled
                      readOnly
                    />
                  </div>{" "}
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Verified On
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_identity
                          ?.identityVerifiedOn
                      }
                      disabled
                      readOnly
                    />
                  </div>{" "}
                  <div className="grid md:grid-cols-2 md:gap-6"></div>
                </form>
              </div>
            </div>
            <div id="accordion-open" data-accordion="open">
              <h2 id="accordion-open-heading-1">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0 border-gray-200 rounded-t-xl focus:ring-2 focus:ring-black gap-3"
                  onClick={toggleAccordion1}
                  aria-expanded={isOpen1 ? "true" : "false"}
                  aria-controls="accordion-open-body-1">
                  <span className="flex items-center gap-1">
                    <img src="/house.png" className="w-6 h-6" />
                    Property Information
                  </span>
                  <svg
                    data-accordion-icon=""
                    className={`w-3 h-3 ${
                      !isOpen1 ? "rotate-180" : ""
                    } shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>
              <div
                id="accordion-open-body-1"
                className={`p-5 border ${
                  isOpen1 ? "border-b-0" : ""
                } border-gray-200 `}
                style={{ display: isOpen1 ? "block" : "none" }}
                aria-labelledby="accordion-open-heading-1">
                <form className="mx-auto bg-white p-5 rounded-xl max-w-lg">
                  {/* <h1 className="font-semibold text-2xl mb-5">
                  Property verification for property
                </h1> */}
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Property Type
                    </label>
                    <input
                      type="text"
                      id="disabled-input-2"
                      aria-label="disabled input 2"
                      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_property
                          ?.propertyType
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Building Description{" "}
                    </label>
                    <input
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_property?.description
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Property Address
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_property
                          ?.propertyAddress
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Verified On
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info_property
                          ?.propertyVerifiedOn
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="flex flex-row">
                    {" "}
                    <div className="mb-5">
                      <label
                        htmlFor="repeat-password"
                        className="block mb-2 text-sm font-medium text-gray-900">
                        Property Front photo
                      </label>

                      <img
                        className="w-60 h-60"
                        src={`/api/viewFile?FileName=${fileFrontName}&FileHash=${fileFrontHash} `}
                        alt="File View"
                        id="Front Image"
                      />
                    </div>
                    <div className="mb-5">
                      <label
                        htmlFor="repeat-password"
                        className="block mb-2 text-sm font-medium text-gray-900">
                        Property Side photo
                      </label>
                      <img
                        className="w-60 h-60"
                        src={`/api/viewFile?FileName=${fileSideName}&FileHash=${fileSideHash}`}
                        alt="File View"
                        id="Side Image"
                      />
                    </div>{" "}
                  </div>
                  <div className="flex flex-row">
                    <div className="mb-5">
                      <label
                        htmlFor="repeat-password"
                        className="block mb-2 text-sm font-medium text-gray-900">
                        Property Back photo
                      </label>
                      <img
                        className="w-60 h-60"
                        src={`/api/viewFile?FileName=${fileBackName}&FileHash=${fileBackHash}`}
                        alt="File View"
                        id="Back Image"
                      />
                    </div>{" "}
                    <div className="mb-5">
                      <label
                        htmlFor="repeat-password"
                        className="block mb-2 text-sm font-medium text-gray-900">
                        Property Locality Photo
                      </label>
                      <img
                        className="w-60 h-60"
                        src={`/api/viewFile?FileName=${fileLocalName}&FileHash=${fileLocalHash}`}
                        alt="File View"
                        id="Locality Image"
                      />
                    </div>{" "}
                  </div>

                  <div className="grid md:grid-cols-2 md:gap-6"></div>
                </form>
              </div>
            </div>
            <div id="accordion-open" data-accordion="open">
              <h2 id="accordion-open-heading-1">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium rtl:text-right border border-b-0 border-gray-200 rounded-t-xl focus:ring-2 focus:ring-black gap-3"
                  onClick={toggleAccordion2}
                  aria-expanded={isOpen ? "true" : "false"}
                  aria-controls="accordion-open-body-1">
                  <span className="flex items-center gap-1">
                    <img src="/exam-results.png" className="w-6 h-6" />
                    Document Information
                  </span>
                  <svg
                    data-accordion-icon=""
                    className={`w-3 h-3 ${
                      !isOpen2 ? "rotate-180" : ""
                    } shrink-0`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>
              <div
                id="accordion-open-body-1"
                className={`p-5 border ${
                  isOpen2 ? "border-b-0" : ""
                } border-gray-200 `}
                style={{ display: isOpen2 ? "block" : "none" }}
                aria-labelledby="accordion-open-heading-1">
                <form className="mx-auto bg-white p-5 rounded-xl max-w-lg">
                  {/* <h1 className="font-semibold text-2xl mb-5">
                    Document verification for property
                  </h1> */}
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Property Name
                    </label>
                    <input
                      type="text"
                      id="disabled-input-2"
                      aria-label="disabled input 2"
                      className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info?.Saree || "NA"
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Owner
                    </label>
                    <input
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info?.SareeColour || "NA"
                      }
                      disabled
                      readOnly
                    />
                  </div>
                  <div className="mb-5">
                    <label
                      htmlFor="repeat-password"
                      className="block mb-2 text-sm font-medium text-gray-900">
                      Address
                    </label>
                    <input
                      type="text"
                      id="disabled-input"
                      aria-label="disabled input"
                      className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
                      defaultValue={
                        product?.data?.BlockchainData_info?.Fabric || "NA"
                      }
                      disabled
                      readOnly
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center mx-1 lg:mx-10 my-5 font-semibold opacity-80 gap-3 lg:gap-1 ">
          <span className="flex items-center">
            <img src="/alert.png" className="w-6 h-6 mx-1" />
          </span>
          <h3>
            This information was captured and responsible by the verifiers.
          </h3>
        </div>{" "}
        <div className="flex items-center mx-1 lg:mx-10 my-5 font-semibold opacity-80 gap-1">
          <span className="flex items-center">
            <img src="/alert.png" className="w-6 h-6 mx-1" />
          </span>
          <h3>You can download or save it for future use. </h3>
        </div>
        {/* <button
          onClick={downloadPdf}
          className="mx-auto mb-5 cursor-pointer group relative flex gap-1.5 px-8 py-4 bg-black bg-opacity-80 text-[#f1f1f1] rounded-3xl hover:bg-opacity-70 transition font-semibold shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Download
        </button> */}
      </section>
    </div>
  );
};

export default Product;

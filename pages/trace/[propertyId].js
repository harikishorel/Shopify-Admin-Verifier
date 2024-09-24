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
      `${URL}/api/shopify/traceProduct?propertyId=${propertyId}`
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
  // Assuming product?.data?.BlockchainData_info is a JSON string
  const blockchainData = product?.data?.BlockchainData_info ? JSON.parse(product.data.BlockchainData_info) : null;
  console.log("Parsed BlockchainData_info:", blockchainData);

  // Now access ProductName
  console.log("Product Name:", blockchainData?.ProductName);
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


  return (
    // <div className="bg-gray-200 h-full flex flex-col justify-center">
    <div id="pdfContent" className="h-screen bg-gray-100" ref={pdfRef}>
      <header className="flex justify-start bg13 p-4">
        <h1 className="text-xl font-bold text-white">TRACE</h1>
      </header>
      <div className="bg-blue-800 text-white font-bold uppercase mb-2">
        <Marquee className="gap-3">
          The information given below are coming from blockchain.
        </Marquee>
      </div>
      <form className="mx-auto bg-white p-5 rounded-xl max-w-lg z-10">
        {/* <h1 className="font-semibold text-2xl mb-5">
                  Identity verification for property
                </h1> */}
        <div id="Identity Verifier Details">
          <h1 className="bg-green-400 text-white px-2 py-1 font-bold rounded-sm mb-2">
            Verified Product
          </h1>
          {/* <div className="flex">
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
          </div> */}
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            Product Name
          </label>
          <input
            type="text"
            id="disabled-input-2"
            aria-label="disabled input 2"
            className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
            defaultValue={
              blockchainData?.ProductName
            }
            disabled
            readOnly
          />
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Product ID
          </label>
          <input
            id="disabled-input"
            aria-label="disabled input"
            className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
            defaultValue={
              blockchainData?.ProductId}
            disabled
            readOnly
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="repeat-password"
            className="block mb-2 text-sm font-medium text-gray-900">
            Price (₹)
          </label>
          <input
            type="text"
            id="disabled-input"
            aria-label="disabled input"
            className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed"
            defaultValue={
              blockchainData?.Price}
            disabled
            readOnly
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="product-url"
            className="block mb-2 text-sm font-medium text-gray-900">
            Product URL
          </label>
          <button
            id="product-url"
            onClick={(e) => {
              e.preventDefault(); // Prevent default button behavior
              if (blockchainData?.ProductUrl) {
                window.open(blockchainData.ProductUrl, "_blank");
              }
            }}
            className="mb-5 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 flex items-center justify-center cursor-pointer"
            style={{ pointerEvents: blockchainData?.ProductUrl ? "auto" : "none" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 bg18"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg><span className="px-2 ">View</span>
          </button>
        </div>

        {/*        
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
        </div> */}
        <div className="grid md:grid-cols-2 md:gap-6"></div>
      </form>

    </div>
  );
};

export default Product;

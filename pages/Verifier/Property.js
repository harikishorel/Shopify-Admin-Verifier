import VLayout from "@/components/Dashboard/layout/VLayout";
import React from "react";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";

export async function getServerSideProps(context) {
  const URL = process.env.URL;
  try {
    // Fetch data from the server
    const session = await getSession(context);
    const VerifierID = session?.user?.email;
    const role = session?.user?.image;
    const Property = await axios.get(
      `${URL}/api/verifier/realEstate/getProperty`
    );
    const verified = await axios.get(
      `${URL}/api/verifier/realEstate/getVerifiedProperty?id=${VerifierID}`
    );
    // Return the data as props
    return {
      props: {
        property: Property.data,
        role: role,
        verifiedProd: verified.data,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        property: [],
        verifiedProd: [],
      },
    };
  }
}

const Property = ({ property, role, verifiedProd }) => {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("submitted");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRotated, setRotated] = useState(false);
  const itemsPerPage = 5; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let serialNumber = indexOfFirstItem + 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);
  // Initialize verificationTypes based on the role
  const initialVerificationTypes = property.map((product) => {
    if (role.includes("Identity Verifier")) {
      return "Identity Verifier";
    } else if (role.includes("Property Verifier")) {
      return "Property Verifier";
    } else if (role.includes("Document Verifier")) {
      return "Document Verifier";
    } else {
      return "";
    }
  });

  const [verificationTypes, setVerificationTypes] = useState(
    initialVerificationTypes
  );

  const handleVerificationTypeChange = (index, value) => {
    const newVerificationTypes = [...verificationTypes];
    newVerificationTypes[index] = value;
    setVerificationTypes(newVerificationTypes);
  };

  const handleVerify = (propertyId, index, verificationStatus) => {
    const verificationType = verificationTypes[index];
    if (verificationStatus === "verified") {
      // router.push(`/trace/${productId}`);
      window.open(`/trace/${propertyId}`, "_blank");
    } else {
      // Conditionally redirect based on the verification type
      if (verificationType === "Identity Verifier") {
        router.push(`/Verifier/Property/Identity/${propertyId}`);
      } else if (verificationType === "Property Verifier") {
        router.push(`/Verifier/Property/Property/${propertyId}`);
      } else if (verificationType === "Document Verifier") {
        router.push(`/Verifier/Property/Document/${propertyId}`);
      }
    }
  };

  let displayedProperty = [];
  const [showSubmittedTable, setShowSubmittedTable] = useState(true);
  const [showVerifiedTable, setShowVerifiedTable] = useState(false);

  const handleStatusChange = (newStatus) => {
    switch (newStatus) {
      case "submitted":
        displayedProperty = property;
        if (!showSubmittedTable) {
          setShowVerifiedTable(false);
          setShowSubmittedTable(true);
        }
        break;
      case "approved":
        displayedProperty = verifiedProd.filter(
          (prod) => prod.verificationStatus === "verified"
        );
        if (!showVerifiedTable) {
          setShowSubmittedTable(false);
          setShowVerifiedTable(true);
        }
        break;
      case "rejected":
        displayedProperty = verifiedProd.filter(
          (prod) => prod.verificationStatus === "rejected"
        );
        if (!showVerifiedTable) {
          setShowSubmittedTable(false);
          setShowVerifiedTable(true);
        }
        break;
      default:
        displayedProperty = [];
        setShowSubmittedTable(false);
        setShowVerifiedTable(false);
    }
  };

  // Call this function when the selectedStatus changes
  handleStatusChange(selectedStatus);

  const filteredProperty = displayedProperty.filter((property) => {
    const lowerCasedTerm = searchTerm.toLowerCase();

    // Check if the product name exists and matches the search term
    const matchesPropertyName =
      property.propertyName &&
      property.propertyName.toLowerCase().includes(lowerCasedTerm);

    // Check if the propertyId exists and its product name matches the search term
    const matchesPropertyIdName =
      property.propertyId &&
      property.propertyId.propertyName &&
      property.propertyId.propertyName.toLowerCase().includes(lowerCasedTerm);

    // Return true if either condition is met
    return matchesPropertyName || matchesPropertyIdName;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperty.length / itemsPerPage)
  );
  const filteredAndPaginatedProducts = filteredProperty
    .slice()
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    // Ensure the newPage is within the valid range
    if (newPage > 0 && newPage <= totalPages) {
      const queryParams = {
        currentPage: newPage,
      };
      const queryString = Object.keys(queryParams)
        .map((key) => key + "=" + queryParams[key])
        .join("&");

      const newUrl = `${window.location.pathname}?${queryString}`;

      router.replace(newUrl);
      // Modify the URL without a page reload
      // window.history.replaceState({ path: newUrl }, "", newUrl);
      event.preventDefault();

      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    const numPagesToShow = 3; // Number of page buttons to show

    const getRange = (start, end) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i);

    if (totalPages <= numPagesToShow) {
      // If there are fewer pages than the specified limit, show all pages
      return getRange(1, totalPages).map(renderPageButton);
    }

    const startPage = Math.max(1, currentPage - Math.floor(numPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + numPagesToShow - 1);

    const pageButtons = [
      ...(startPage > 1 ? [renderPageButton(1)] : []), // Show first page number
      ...(startPage > 2
        ? [
            <span key="ellipsis-start" className="relative top-1">
              ...
            </span>,
          ]
        : []),
      ...getRange(startPage, endPage).map(renderPageButton),
      ...(endPage < totalPages - 1
        ? [
            <span key="ellipsis-end" className="relative top-1">
              ...
            </span>,
          ]
        : []),
      ...(endPage < totalPages ? [renderPageButton(totalPages)] : []), // Show last page number
    ];

    return pageButtons;
  };

  const renderPageButton = (pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => handlePageChange(pageNumber)}
      className={`px-3 py-2 rounded-md ${
        currentPage === pageNumber
          ? " text-white border h-full bg11"
          : "text-black h-auto hover:bg-gray-200"
      }`}>
      {pageNumber}
    </button>
  );

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("submitted");
    setCurrentPage(1);
    setRotated(true);
    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  return (
    <div className={`bg-gray-50 flex flex-col h-screen`}>
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-6">
          <h1 className="font-medium text-2xl ml-6">Properties</h1>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between gap-1 px-8">
            <div className="flex flex-column gap-2">
              <form>
                <div className="relative text-gray-600">
                  <input
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    // type="search"
                    name="search"
                    placeholder="Search for property"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    // type="submit"
                    className="absolute right-0 top-0 mt-1 mr-1 rounded-lg bg11 px-2 py-2 font-medium text-white outline-none hover:opacity-80 focus:ring">
                    <svg
                      className="text-white h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      version="1.1"
                      id="Capa_1"
                      x="0px"
                      y="0px"
                      viewBox="0 0 56.966 56.966"
                      style={{ enableBackground: "new 0 0 56.966 56.966" }}
                      xmlSpace="preserve"
                      width="512px"
                      height="512px">
                      <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
                    </svg>
                  </button>
                </div>
              </form>
              <div>
                <button
                  className={`mt-2 font-medium text-black outline-none opacity-50 hover:opacity-80${
                    isRotated ? " rotated" : ""
                  }`}
                  onClick={handleReset}
                  style={{ outline: "none" }}>
                  <svg
                    className={`w-5 h-5 text-gray-800${
                      isRotated ? " rotated" : ""
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 20">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 1v5h-5M2 19v-5h5m10-4a8 8 0 0 1-14.947 3.97M1 10a8 8 0 0 1 14.947-3.97"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center w-1/2 md:w-48">
              <select
                id="status"
                className="block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                onChange={(e) => setSelectedStatus(e.target.value)}
                value={selectedStatus}>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="px-8 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              {showSubmittedTable && (
                <table className="w-full table-auto">
                  <thead className="text-xs text-black uppercase bg14">
                    <tr className="text-sm dark:bg-meta-4 text-left">
                      <th className="py-2 px-4 font-medium  text-black">No</th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Property Name
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Price
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Seller Name
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Location
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Type
                      </th>
                      <th className="py-2 px-4 font-medium text-black">
                        Verification Type
                      </th>
                      <th className="py-2 px-4 font-medium text-black">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndPaginatedProducts.length > 0 ? (
                      filteredAndPaginatedProducts.map((product, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-200 text-left">
                          <td className="border-b border-gray-300 py-3 px-4">
                            <p className="text-sm text-black">
                              {serialNumber + index}
                            </p>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4">
                            <a
                              href={`http://localhost:3000/trace/${product._id}`}
                              target="_blank"
                              rel="noopener noreferrer">
                              <h5 className="text-sm text-black cursor-pointer hover:underline">
                                {product.propertyName}
                              </h5>
                            </a>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4">
                            <p className="text-sm text-black">
                              {product.price}
                            </p>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4">
                            <p className="text-sm text-black">
                              {product.ownerName}
                            </p>
                          </td>
                          <td
                            className="border-b border-gray-300 py-3 px-4 "
                            // onClick={() => renderLocation(product.location)}
                          >
                            <p className="text-sm text-black">
                              {/* {product.location} */}
                              {product.location
                                ? product.location.substring(0, 20) +
                                  (product.location.length > 20 ? "..." : "")
                                : "NA"}
                            </p>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4 ">
                            <p className="text-sm text-black">
                              {product.propertyType}
                            </p>
                          </td>

                          <td className="border-b border-gray-300 py-3 px-4">
                            <div className="flex flex-col w-full bg15 md:w-48">
                              <select
                                id={`status_${index}`}
                                className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                onChange={(e) =>
                                  handleVerificationTypeChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                value={verificationTypes[index]}
                                disabled={
                                  !(
                                    role.includes("Identity Verifier") &&
                                    verificationTypes[index] !== "pending"
                                  ) &&
                                  !(
                                    role.includes("Property Verifier") &&
                                    verificationTypes[index] !== "pending"
                                  ) &&
                                  !(
                                    role.includes("Document Verifier") &&
                                    verificationTypes[index] !== "pending"
                                  )
                                }>
                                <option
                                  value="Identity Verifier"
                                  className={
                                    product.identityStatus === "verified"
                                      ? "text-green-500"
                                      : product.identityStatus === "rejected"
                                      ? "text-red-500"
                                      : ""
                                  }
                                  disabled={
                                    !role.includes("Identity Verifier")
                                  }>
                                  {product.identityStatus === "verified"
                                    ? "\u2713 "
                                    : product.identityStatus === "rejected"
                                    ? "\u2715 "
                                    : ""}
                                  Identity Verification
                                </option>
                                <option
                                  value="Property Verifier"
                                  className={
                                    product.propertyStatus === "verified"
                                      ? "text-green-500"
                                      : product.propertyStatus === "rejected"
                                      ? "text-red-500"
                                      : ""
                                  }
                                  disabled={
                                    !role.includes("Property Verifier")
                                  }>
                                  {product.propertyStatus === "verified"
                                    ? "\u2713 "
                                    : product.propertyStatus === "rejected"
                                    ? "\u2715 "
                                    : ""}
                                  Property Verification
                                </option>
                                <option
                                  value="Document Verifier"
                                  className={
                                    product.documentStatus === "verified"
                                      ? "text-green-500"
                                      : product.documentStatus === "rejected"
                                      ? "text-red-500"
                                      : ""
                                  }
                                  disabled={
                                    !role.includes("Document Verifier")
                                  }>
                                  {product.documentStatus === "verified"
                                    ? "\u2713 "
                                    : product.documentStatus === "rejected"
                                    ? "\u2715 "
                                    : ""}
                                  Document Verification
                                </option>
                              </select>
                            </div>
                          </td>

                          <td className="border-b border-gray-300 py-3 px-4">
                            {verificationTypes[index] &&
                            ((verificationTypes[index] ===
                              "Identity Verifier" &&
                              (product.identityStatus === "verified" ||
                                product.identityStatus === "rejected")) ||
                              (verificationTypes[index] ===
                                "Property Verifier" &&
                                (product.propertyStatus === "verified" ||
                                  product.propertyStatus === "rejected")) ||
                              (verificationTypes[index] ===
                                "Document Verifier" &&
                                (product.documentStatus === "verified" ||
                                  product.documentStatus === "rejected"))) ? (
                              <p
                                className={`inline-flex capitalize rounded-full px-3 py-1 text-center text-sm font-medium ${
                                  product.identityStatus === "verified" ||
                                  product.propertyStatus === "verified" ||
                                  product.documentStatus === "verified"
                                    ? "text-green-700 bg-green-100"
                                    : "text-red-700 bg-red-100"
                                }`}>
                                {product.identityStatus === "verified" ||
                                product.propertyStatus === "verified" ||
                                product.documentStatus === "verified"
                                  ? "Verified"
                                  : "Rejected"}
                              </p>
                            ) : (
                              <button
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none"
                                onClick={() =>
                                  handleVerify(product._id, index)
                                }>
                                Verify
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-gray-900 text-center font-semibold">
                          No Properties Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {showVerifiedTable && (
                <table className="w-full table-auto">
                  <thead className="text-xs text-black uppercase bg14">
                    <tr className="text-sm dark:bg-meta-4 text-left">
                      <th className="py-2 px-4 font-medium  text-black">No</th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Property Name
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Price
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Location
                      </th>
                      <th className="py-2 px-4 font-medium  text-black">
                        Type
                      </th>
                      <th className="py-2 px-4 font-medium text-black">
                        Status
                      </th>
                      <th className="py-2 px-4 font-medium text-black">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndPaginatedProducts.length > 0 ? (
                      filteredAndPaginatedProducts.map((product, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-200 text-left">
                          <td className="border-b border-gray-300 py-3 px-4">
                            <p className="text-sm text-black">
                              {serialNumber + index}
                            </p>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4">
                            <a
                              href={`http://verisilks.in:3000/description/${product.propertyName}/${product._id}`}
                              target="_blank"
                              rel="noopener noreferrer">
                              <h5 className="text-sm text-black cursor-pointer hover:underline">
                                {product?.propertyId?.propertyName ||
                                  product?.propertyName}
                              </h5>
                            </a>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4">
                            <p className="text-sm text-black">
                              {product.price || product?.propertyId?.price}
                            </p>
                          </td>

                          <td
                            className="border-b border-gray-300 py-3 px-4 "
                            // onClick={() => renderLocation(product.location)}
                          >
                            <p className="text-sm text-black">
                              {product.location
                                ? product.location.substring(0, 20) +
                                  (product.location.length > 20 ? "..." : "")
                                : product.propertyId?.location
                                ? product.propertyId.location.substring(0, 20) +
                                  (product.propertyId.location.length > 20
                                    ? "..."
                                    : "")
                                : "NA"}
                            </p>
                          </td>
                          <td className="border-b border-gray-300 py-3 px-4 ">
                            <p className="text-sm text-black">
                              {product.verificationType === "identity"
                                ? "Identity"
                                : product.verificationType === "property"
                                ? "Property"
                                : product.verificationType === "document"
                                ? "Document"
                                : product.propertyType}
                            </p>
                          </td>

                          <td className="border-b border-gray-300 py-3 px-4">
                            {product.verificationStatus === "verified" ? (
                              <p className="inline-flex capitalize rounded-full px-3 py-1 text-center text-sm font-medium text-green-700 bg-green-100">
                                Verified
                              </p>
                            ) : product.verificationStatus === "rejected" ? (
                              <p className="inline-flex capitalize rounded-full px-3 py-1 text-center text-sm font-medium text-red-700 bg-red-100">
                                Rejected
                              </p>
                            ) : (
                              product.verificationStatus
                            )}
                          </td>

                          <td className="border-b border-gray-300 py-3 px-4">
                            <button
                              type="button"
                              className={`${
                                product.verificationStatus === "verified"
                                  ? "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-100 focus:outline-none bg-green-500 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-300 hover:text-green-900 focus:z-10 focus:ring-4 focus:ring-green-200"
                                  : "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none"
                              } ${
                                product.verificationStatus === "rejected"
                                  ? "text-gray-300 bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() =>
                                handleVerify(
                                  product.propertyId._id,
                                  index,
                                  product.verificationStatus
                                )
                              }
                              disabled={
                                product.verificationStatus === "rejected"
                              }>
                              {product.verificationStatus === "verified"
                                ? "View"
                                : "Verify"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-gray-900 text-center font-semibold">
                          No Properties Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min(indexOfFirstItem + 1, property.length)} -{" "}
                {Math.min(indexOfLastItem, filteredProperty.length)} of{" "}
                {filteredProperty.length} entries
              </div>
              {filteredProperty.length > 0 && (
                <div className="flex space-x-2 mt-2 rounded-md overflow-hidden border-2 border-[#D5D9D9] shadow-sm">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`relative flex items-center px-2 py-2 ${
                      currentPage === 1
                        ? "text-[#5B5C5C] cursor-not-allowed"
                        : "text-black hover:bg-gray-200 hover:border-[#F5F6F6]"
                    } transition-all`}
                    style={{
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                    disabled={currentPage === 1}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 mr-1">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                    Previous
                    <div className="border-l border-gray-200 h-6 absolute top-2 bottom-0 right-0"></div>
                  </button>
                  {renderPageNumbers()}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`relative flex items-center px-2 py-2 ${
                      currentPage === totalPages
                        ? "text-[#5B5C5C] cursor-not-allowed"
                        : "text-black hover:bg-gray-200 hover:border-[#F5F6F6]"
                    } transition-all`}
                    style={{
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                    disabled={
                      currentPage === totalPages ||
                      filteredProperty.length === 0
                    }>
                    Next
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 ml-1">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                    <div className="border-r border-gray-200 h-6 absolute top-2 bottom-0 left-0"></div>
                  </button>
                </div>
              )}
              <div className="w-1/6"></div>
            </div>
          </div>
        </div>
      </VLayout>
    </div>
  );
};

export default Property;

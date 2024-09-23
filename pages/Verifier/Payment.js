import VLayout from "@/components/Dashboard/layout/VLayout";
import { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const URL = process.env.URL;
  try {
    const session = await getSession(context);
    console.log("VerifierID", session?.user?.email);
    const VerifierID = session?.user?.email;
    // Fetch data from the server
    const verified = await axios.get(
      `${URL}/api/verifier/realEstate/getPaymentDetails?id=${VerifierID}`,
      {
        params: {
          searchTerm: context.query.searchTerm || "",
          currentPage: context.query.currentPage || "1",
          status: context.query.selectedStatus || "allProps", // Add selectedStatus to the query
        },
      }
    );
    // Return the data as props
    return {
      props: {
        verifiedProd: verified.data,
        sessionData: session.user,
        initialStatus: context.query.status || "allProps",
        currentPage: parseInt(context.query.currentPage) || 1,
        initialSearchTerm: context.query.searchTermInput || "",
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        verifiedProd: [],
        sessionData: null,
        initialSearchTerm: "",
        initialStatus: "allProps",
        currentPage: 1,
      },
    };
  }
}

const Payment = ({
  verifiedProd,
  initialSearchTerm,
  initialStatus,
  sessionData,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(
    initialStatus || "allProps"
  );
  const Role = sessionData?.image;
  const verifierId = sessionData?.email;

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isRotated, setRotated] = useState(false);

  const itemsPerPage = 5; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const TotalProducts = Math.ceil(verifiedProd.length);

  let totalPending = 0;
  let totalPaid = 0;
  verifiedProd.forEach((property) => {
    const { amountAllocated, paymentStatus } = property;

    // Check paymentStatus and update totals
    if (paymentStatus === "pending") {
      totalPending += amountAllocated;
    } else if (paymentStatus === "paid") {
      totalPaid += amountAllocated;
    }
  });

  let serialNumber = indexOfFirstItem + 1;

  useEffect(() => {
    // Reset current page to 1 when search term changes
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;
    const selectedStatusFromQuery = router.query.status || "allProps";

    if (
      currentPageFromQuery !== currentPage ||
      selectedStatusFromQuery !== selectedStatus
    ) {
      setCurrentPage(currentPageFromQuery);
      setSelectedStatus(selectedStatusFromQuery);
    }
  }, [
    router.query.currentPage,
    //  router.query.searchTerm,
    router.query.status,
  ]);

  useEffect(() => {
    // Update the URL with search term and page
    const queryParams = {
      searchTerm: searchTerm,
      status: selectedStatus,
      currentPage: currentPage,
    };

    router.replace(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );
  }, [searchTerm, currentPage, selectedStatus]);

  let displayedProducts;
  // Dropdown Filter
  switch (selectedStatus) {
    case "allProps":
      displayedProducts = verifiedProd;

      break;
    case "paid":
      displayedProducts = verifiedProd.filter(
        (product) => product.paymentStatus === "paid"
      );

      break;
    case "pending":
      displayedProducts = verifiedProd.filter(
        (product) => product.paymentStatus === "pending"
      );
      break;
    default:
      displayedProducts = verifiedProd;
  }

  // Search Filter
  const filteredProducts = displayedProducts.filter((product) => {
    const lowerCasedTerm = searchTerm.toLowerCase();

    // Check if the product matches the search term
    const matchesSearchTerm =
      product.propertyId.propertyName.toLowerCase().includes(lowerCasedTerm) ||
      product.propertyId.ownerName.toLowerCase().includes(lowerCasedTerm);

    // Return true if both conditions are met
    return matchesSearchTerm;
  });

  //   Page Filter
  const filteredAndPaginatedProducts = filteredProducts
    .slice()
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  const handlePageChange = (newPage) => {
    // Ensure the newPage is within the valid range
    if (newPage > 0 && newPage <= totalPages) {
      const queryParams = {
        searchTermInput: searchTerm,
        currentPage: newPage,
      };
      const queryString = Object.keys(queryParams)
        .map((key) => key + "=" + queryParams[key])
        .join("&");

      const newUrl = `${window.location.pathname}?${queryString}`;

      // router.replace(newUrl);
      // Modify the URL without a page reload
      window.history.replaceState({ path: newUrl }, "", newUrl);
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
    const queryParams = {
      searchTermInput: "",
      status: "allProps",
      currentPage: 1,
    };

    router.replace(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );
    setSearchTerm("");
    setSelectedStatus("allProps");
    setCurrentPage(1);
    setRotated(true);
    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  const goToPage = (page) => {
    if (searchTerm && totalPages === 1) {
      // If a search term is applied, go to page 1 when changing pages
      setCurrentPage(1);
    } else {
      const queryParams = {
        searchTermInput: searchTerm,
        currentPage: page,
      };

      router.replace(
        {
          pathname: router.pathname,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );
      // Otherwise, proceed with the normal page change logic
      setCurrentPage(page);
    }
    // Your remaining logic for fetching data or updating the UI based on the new page
  };

  return (
    <div
      className={`bg-gray-50 flex flex-col ${
        filteredAndPaginatedProducts.length > 3 ? "h-full" : "h-screen"
      }`}>
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-6">
          <h1 className="font-medium text-2xl ml-6">All Payments</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-5">
            {/* Card 1 */}
            <div className="text-white rounded-md overflow-hidden shadow-lg p-4 bg11">
              <h4 className="text-base font-bold mb-1.5">
                Total Verified Properties
              </h4>
              <h2 className="text-2xl font-bold mb-1.5">{TotalProducts}</h2>
            </div>
            {/* Card 2 */}
            <div className="bg12 rounded-md overflow-hidden shadow-lg p-4">
              <h4 className="text-base font-bold mb-1.5 text-black ">
                Total Payments Received
              </h4>
              <h2 className="text-2xl font-bold mb-1.5 text-green-600">
                ₹ {totalPaid}
              </h2>
            </div>
            {/* Card 3 */}
            <div className="bg-gray-300 rounded-md overflow-hidden shadow-lg p-4">
              <h3 className="text-base font-bold mb-1.5 text-black">
                Pending Payments
              </h3>
              <p className="text-2xl font-bold mb-1.5 text-red-600">
                ₹ {totalPending}
              </p>
            </div>
          </div>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between gap-1 px-8">
            <div className="flex flex-column gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // handleSearch();
                }}>
                <div className="relative text-gray-600">
                  <input
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    // type="search"
                    name="search"
                    placeholder="Search for items"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    type="submit"
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
                value={selectedStatus}
                // onChange={handleStatusChange}
              >
                <option value="allProps">All Properties</option>
                <option value="paid">Paid Payments</option>
                <option value="pending">Pending Payments</option>
              </select>
            </div>
          </div>

          <div className="px-8 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase bg14">
                  <tr className="text-sm dark:bg-meta-4 text-left">
                    <th className="py-2 px-4 font-medium  text-black">No</th>
                    <th className="py-2 px-4 font-medium  text-black">
                      Property Name
                    </th>
                    <th className="py-2 px-4 font-medium  text-black">
                      Owner Name
                    </th>
                    <th className="py-2 px-4 font-medium  text-black">
                      Amount
                    </th>
                    <th className="py-2 px-4 font-medium text-black ">Type</th>
                    <th className="py-2 px-4 font-medium text-black ">
                      Status
                    </th>
                    <th className="py-2 px-4 font-medium text-black ">
                      Payment
                    </th>
                    <th className="py-2 px-4 font-medium text-black">
                      Payment Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndPaginatedProducts.length > 0 ? (
                    filteredAndPaginatedProducts.map((property, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-200 text-left">
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p className="text-sm text-black">
                            {serialNumber + index}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <a
                            href=""
                            // href={`http://verisilks.in:3000/description/${product.productId.productName}/${product.productId._id}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            <h5 className="py-2 px-4text-sm text-black cursor-pointer hover:underline">
                              {property?.propertyId?.propertyName || "NA"}
                            </h5>
                          </a>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p className="text-sm text-black">
                            {property?.propertyId?.ownerName || "NA"}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p className="text-sm text-black">
                            ₹ {property?.amountAllocated || 0}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p className="text-sm text-black ">
                            {property?.verificationType
                              ? property?.verificationType
                                  .charAt(0)
                                  .toUpperCase() +
                                property?.verificationType
                                  .slice(1)
                                  .toLowerCase()
                              : "Unknown"}{" "}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p
                            className={`inline-flex capitalize rounded-full px-3 py-1 text-center text-sm font-medium ${
                              property.verificationStatus === "verified"
                                ? "text-green-700 bg-green-100"
                                : property.verificationStatus === "rejected"
                                ? "text-red-700 bg-red-100"
                                : ""
                            }`}>
                            {property.verificationStatus === "verified"
                              ? "Verified"
                              : "Rejected"}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p
                            className={`text-sm font-bold ${
                              property.paymentStatus === "pending"
                                ? "text-indigo-800"
                                : property.paymentStatus === "paid"
                                ? "text-green-600"
                                : ""
                            }`}>
                            {property.paymentStatus === "pending"
                              ? "Pending"
                              : "Paid"}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-2 px-4">
                          <p
                            className={`text-sm ${
                              property?.paymentDate
                                ? "text-green-600 font-bold"
                                : "text-indigo-800 font-bold"
                            }`}>
                            {property.paymentDate
                              ? new Date(
                                  property.paymentDate
                                ).toLocaleDateString("en-GB")
                              : "Pending"}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-gray-900 text-center font-semibold">
                        No Properties Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <br />
            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min(indexOfFirstItem + 1, verifiedProd.length)} -{" "}
                {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                {filteredProducts.length} entries
              </div>
              {filteredProducts.length > 0 && (
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
                      filteredProducts.length === 0
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

export default Payment;

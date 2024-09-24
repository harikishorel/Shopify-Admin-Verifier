import VLayout from "@/components/Dashboard/layout/VLayout";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";

export async function getServerSideProps(context) {
  const URL = process.env.URL;
  try {
    const session = await getSession(context);
    console.log("VerifierID", session?.user?.email);
    const VerifierID = session?.user?.email;
    // Fetch data from the server
    const response = await axios.get(`${URL}/api/verifier/getProducts`, {
      params: {
        searchTerm: context.query.searchTerm || "",
        status: context.query.status || "submitted",
        currentPage: context.query.currentPage || "",
      },
    });
    const verified = await axios.get(
      `${URL}/api/verifier/getVerifiedProduct?id=${VerifierID}`
    );
    // const rejected = await axios.get(
    //   `${URL}/api/verifier/getRejectProd?id=${VerifierID}`
    // );
    // Return the data as props
    return {
      props: {
        products: response.data,
        verifiedProd: verified.data,
        initialStatus: context.query.status || "submitted",
        currentPage: parseInt(context.query.currentPage) || 1,
        initialSearchTerm: context.query.searchTermInput || "",
        // rejectProd: rejected.data,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        products: [],
        verifiedProd: [],
        initialSearchTerm: "",
        initialStatus: "submitted",
        currentPage: 1,
        // rejectProd: [],
      },
    };
  }
}

const Table = ({
  products,
  verifiedProd,
  initialSearchTerm,
  initialStatus,
}) => {
  // const { data: session } = useSession();
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState(
    initialStatus || "submitted"
  );
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const itemsPerPage = 5; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const totalPages = Math.ceil(products.length / itemsPerPage);
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isRotated, setRotated] = useState(false);
  console.log("Products", products)
  const submittedProducts = products.filter(
    (product) => product.verificationStatus === "pending"
  );

  // const [filteredProducts, setFilteredProducts] = useState(submittedProducts);

  let displayedProducts;

  switch (selectedStatus) {
    case "submitted":
      displayedProducts = products.filter(
        (product) => product.verificationStatus === "pending"
      );
      break;
    case "approved":
      displayedProducts = verifiedProd.filter(
        (product) => product.verificationStatus === "verified"
      );
      break;
    case "rejected":
      displayedProducts = verifiedProd.filter(
        (product) => product.verificationStatus === "rejected"
      );
      break;
    default:
      displayedProducts = [];
  }

  const filteredProducts = displayedProducts.filter((product) => {
    const lowerCasedTerm = searchTerm.toLowerCase();

    // Check if the product matches the search term
    const matchesSearchTerm =
      product.productName.toLowerCase().includes(lowerCasedTerm) ||
      product.price.toString().includes(lowerCasedTerm) ||
      (product.discountPrice &&
        product.discountPrice.toString().includes(lowerCasedTerm)) ||
      (product.sareeColour &&
        product.sareeColour.toLowerCase().includes(lowerCasedTerm)) ||
      (product.borderColour &&
        product.borderColour.toLowerCase().includes(lowerCasedTerm)) ||
      (product.verificationStatus &&
        product.verificationStatus.toLowerCase().includes(lowerCasedTerm)) ||
      // Search in seller details
      (product.sellerId &&
        product.sellerId.name.toLowerCase().includes(lowerCasedTerm)) ||
      (product.sellerId &&
        product.sellerId.phone.toString().includes(lowerCasedTerm));

    // Return true if both conditions are met
    return matchesSearchTerm;
  });

  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;
    const selectedStatusFromQuery = router.query.status || "submitted";

    if (
      currentPageFromQuery !== currentPage ||
      selectedStatusFromQuery !== selectedStatus
    ) {
      setCurrentPage(currentPageFromQuery);
      setSelectedStatus(selectedStatusFromQuery);
    }
  }, [router.query.currentPage, router.query.searchTerm, router.query.status]);

  // useEffect to update URL based on component state
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAndPaginatedProducts = filteredProducts
    .slice()
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const goToPage = (page) => {
    if (searchTerm && totalPages === 1) {
      // If a search term is applied, go to page 1 when changing pages
      setCurrentPage(1);
    } else {
      const queryParams = {
        searchTermInput: searchTerm,
        status: selectedStatus,
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

  const handlePageChange = (newPage) => {
    // Ensure the newPage is within the valid range
    if (newPage > 0 && newPage <= totalPages) {
      const queryParams = {
        searchTermInput: searchTerm,
        status: selectedStatus,
        currentPage: newPage,
      };
      const queryString = Object.keys(queryParams)
        .map((key) => key + "=" + queryParams[key])
        .join("&");

      const newUrl = `${window.location.pathname}?${queryString}`;

      router.replace(newUrl);
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
      className={`px-3 py-2 rounded-md ${currentPage === pageNumber
        ? " text-white border h-full bg11"
        : " text-black h-auto hover:bg-gray-200"
        }`}>
      {pageNumber}
    </button>
  );

  // // Update this useEffect block
  useEffect(() => {
    // Reset current page to 1 when search term changes
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleReset = () => {
    const queryParams = {
      searchTermInput: "",
      status: "submitted",
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
    setSelectedStatus("submitted");
    setCurrentPage(1);
    setRotated(true);
    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  const handleButtonClick = (productId, verificationStatus) => {
    if (verificationStatus === "verified") {
      // router.push(`/trace/${productId}`);
      // window.open(`/trace/${productId}`, "_blank");
      router.push(`/Verifier/New/${productId}`);
    } else {
      router.push(`/Verifier/Product/${productId}`);
    }
  };

  let serialNumber = indexOfFirstItem + 1;

  return (
    <div
      className={`bg-gray-50 flex flex-col ${filteredAndPaginatedProducts.length > 3 ? "h-full" : "h-screen"
        }`}>
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-6">
          <h1 className="font-medium text-2xl ml-6">Products</h1>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between gap-1 px-8">
            <div className="flex flex-column gap-2">
              <form>
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
                  className={`mt-2 font-medium text-black outline-none opacity-50 hover:opacity-80${isRotated ? " rotated" : ""
                    }`}
                  onClick={handleReset}
                  style={{ outline: "none" }}>
                  <svg
                    className={`w-5 h-5 text-gray-800${isRotated ? " rotated" : ""
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
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase bg14">
                  <tr className="text-sm dark:bg-meta-4 text-left">
                    <th className="py-2 px-4 font-medium  text-black">No</th>
                    <th className="py-2 px-4 font-medium  text-black">
                      Product Name
                    </th>
                    <th className="py-2 px-4 font-medium  text-black">Price</th>
                    <th className="py-2 px-4 font-medium  text-black">
                      View Product
                    </th>

                    <th className="py-2 px-4 font-medium text-black">
                      Actions
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
                            href={`http://verisilks.in:3000/description/${product.productName}/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer">
                            <h5 className="text-sm text-black cursor-pointer hover:underline">
                              {product.productName}
                            </h5>
                          </a>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4">
                          <p className="text-sm text-black">{product.price}</p>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4 ">
                          <p className="text-sm text-black">
                            {product.sellerId.name}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4">
                          <p className="text-sm text-black">
                            {product.sellerId.phone}
                          </p>
                        </td>

                        <td className="border-b border-gray-300 py-3 px-1">
                          <p
                            className={`inline-flex capitalize rounded-full px-3 py-1 text-center text-sm font-medium ${product.verificationStatus === "verified"
                              ? "text-green-700 bg-green-100"
                              : product.verificationStatus === "rejected"
                                ? "text-orange-700 bg-red-100"
                                : "text-yellow-700 bg-yellow-100"
                              }`}>
                            {product.verificationStatus}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4">
                          <button
                            type="button"
                            className={`${product.verificationStatus === "verified"
                              ? "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-100 focus:outline-none bg-green-500 rounded-lg border border-gray-200 hover:border-green-200 hover:bg-green-300 hover:text-green-900 focus:z-10 focus:ring-4 focus:ring-green-200"
                              : "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none"
                              } ${product.verificationStatus === "rejected"
                                ? "text-gray-300 bg-gray-700 hover:bg-gray-700 cursor-not-allowed"
                                : ""
                              }`}
                            onClick={() =>
                              handleButtonClick(
                                product._id,
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
                        No Products Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min(indexOfFirstItem + 1, products.length)} -{" "}
                {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                {filteredProducts.length} entries
              </div>
              {filteredProducts.length > 0 && (
                <div className="flex space-x-2 mt-2 rounded-md overflow-hidden border-2 border-[#D5D9D9] shadow-sm">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`relative flex items-center px-2 py-2 ${currentPage === 1
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
                    className={`relative flex items-center px-2 py-2 ${currentPage === totalPages
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
          {/* <div className="flex justify-between items-center px-10 mb-2">
            <div className="text-sm text-gray-500">
              Showing {Math.min(indexOfFirstItem + 1, products.length)} -{" "}
              {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}>
                Previous
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-700 text-white hover:bg-blue-800"
                }`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div> */}
        </div>
      </VLayout>
    </div>
  );
};

export default Table;

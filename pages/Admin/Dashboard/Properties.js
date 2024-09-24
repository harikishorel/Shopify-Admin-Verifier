import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ query }) {
  const URL = process.env.URL;

  try {
    const response = await axios.get(
      `${URL}/api/admin/realEstate/getVerifiedProperty`,
      {
        params: {
          searchTerm: query.searchTermInput || "",
          dateFrom: query.dateFrom || "",
          dateTo: query.dateTo || "",
          currentPage: query.currentPage || "1", // Include currentPage in the params
        },
      }
    );
    return {
      props: {
        productDetails: response.data,
        isLoading: false,
        initialSearchTerm: query.searchTermInput || "",
        initialDateFrom: query.dateFrom || "",
        initialDateTo: query.dateTo || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Fetch total price error:", error);
    return {
      props: {
        productDetails: [],
        isLoading: false,
        initialSearchTerm: "",
        initialDateFrom: "",
        initialDateTo: "",
        currentPage: 1,
      },
    };
  }
}
const Properties = ({
  productDetails,
  isLoading,
  initialSearchTerm,
  initialDateFrom,
  initialDateTo,
}) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState(""); // Separate state for "Sold Date From"
  const [filterDateTo, setFilterDateTo] = useState(""); // Separate state for "Sold Date To"
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [isRotated, setRotated] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setFilteredProducts(productDetails);

    const hasFilterParams =
      initialSearchTerm || initialDateFrom || initialDateTo;

    if (hasFilterParams) {
      filterProducts();
    }

    setSearchTerm(router.query.searchTermInput || "");
    setFilterDateFrom(router.query.dateFrom || "");
    setFilterDateTo(router.query.dateTo || "");
  }, [
    productDetails,
    initialSearchTerm,
    initialDateFrom,
    initialDateTo,
    router.query,
  ]);

  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    if (currentPageFromQuery !== currentPage) {
      setCurrentPage(currentPageFromQuery);
    }
  }, [router.query.currentPage, productDetails]);

  const filterProducts = () => {
    const fromDateObject =
      filterDateFrom === "" ? null : new Date(filterDateFrom);
    const toDateObject = filterDateTo === "" ? null : new Date(filterDateTo);
    const filteredProductsByDateRange = productDetails.filter((product) => {
      const productDate = new Date(product.verificationDate); // Change 'soldDate' to 'refund.paymentDate'
      return (
        (!fromDateObject || productDate >= fromDateObject) &&
        (!toDateObject || productDate <= toDateObject)
      );
    });

    const filteredData = filteredProductsByDateRange.filter((product) => {
      const ownerName = product.ownerName
        ? product.ownerName.toLowerCase()
        : "";
      const propertyName = product.propertyName
        ? product.propertyName.toLowerCase()
        : "";

      return (
        ownerName.includes(searchTerm.toLowerCase()) ||
        propertyName.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredProducts(filteredData);
    setIsFiltered(true);
  };

  useEffect(() => {
    if (searchClicked || !isFiltered) {
      // If search button clicked or not filtered yet, trigger the filtering logic
      filterProducts();
      setSearchClicked(false);
      setIsFiltered(true); // Set isFiltered to true after filtering
    }
  }, [filterDateFrom, filterDateTo, searchTerm, isFiltered, searchClicked]);

  useEffect(() => {
    // Trigger filtering logic on page load if filters were applied
    if (isFiltered) {
      filterProducts();
    }
  }, [isFiltered]);

  const handleSearch = () => {
    const queryParams = {
      searchTermInput: searchTerm,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    };

    const queryString = Object.keys(queryParams)
      .map((key) => key + "=" + queryParams[key])
      .join("&");

    const newUrl = `${window.location.pathname}?${queryString}`;

    // Modify the URL without a page reload
    router.push(newUrl);
    // Trigger the filtering logic
    setSearchClicked(true);
  };

  const handleReset = () => {
    const queryParams = {
      searchTermInput: "",
      dateFrom: "",
      dateTo: "",
      currentPage: 1,
    };

    const queryString = Object.keys(queryParams)
      .map((key) => key + "=" + queryParams[key])
      .join("&");

    const newUrl = `${window.location.pathname}?${queryString}`;

    // Modify the URL without a page reload
    router.push(newUrl);
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setRotated(true);
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  const totalFilteredProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredProducts / itemsPerPage);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const hasDataForPage = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex).length > 0;
  };

  const handlePageChange = (newPage) => {
    // Ensure the newPage is within the valid range
    if (newPage > 0 && newPage <= totalPages) {
      const queryParams = {
        searchTermInput: searchTerm,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
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

  let serialNumber = indexOfFirstProduct + 1;

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Layout>
        {!isLoading && (
          <div className="sm:ml-64 flex flex-col mt-20 gap-8">
            <div className="flex place-content-between">
              <div className="flex flex-row gap-2">
                <h1 className="font-medium text-2xl ml-6">
                  Total Verified Products:
                </h1>
                <h2 className="text-2xl font-bold bg15">
                  {productDetails?.length || 0}
                </h2>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center w-max max-w-screen-md">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch();
                    }}
                    className="w-fit mx-auto">
                    <div className="relative mb-10 w-full flex  items-center justify-between rounded-md">
                      <svg
                        className="absolute left-2 block h-5 w-5 text-[#3c4799]"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" className=""></circle>
                        <line
                          x1="21"
                          y1="21"
                          x2="16.65"
                          y2="16.65"
                          className=""></line>
                      </svg>
                      <input
                        type="name"
                        name="search"
                        className="h-12 w-full cursor-text rounded-md border border-gray-100 bg-gray-100 py-4 pr-40 pl-12 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Search by Property Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ "::placeholder": { color: "blue" } }}
                      />
                    </div>
                    {/* <div className=" flex flex-wrap items-center justify-center mt-10 gap-4">
                      <div className="flex flex-wrap -mt-5 gap-3"> */}
                    <div className="flex flex-wrap gap-5">
                      <div className="flex flex-col w-full lg:w-48">
                        <label
                          htmlFor="date"
                          className="text-sm font-medium text-stone-600">
                          Date From
                        </label>
                        <input
                          type="date"
                          id="date"
                          className=" h-12 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col w-full lg:w-48">
                        <label
                          htmlFor="dateTo"
                          className="text-sm font-medium text-stone-600">
                          Date To
                        </label>
                        <input
                          type="date"
                          id="dateTo"
                          className="h-12 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-row gap-3 justify-center w-full lg:w-48">
                        <div className="flex justify-center mt-5">
                          <button
                            className="rounded-lg bg11 px-6 py-2 font-medium text-white outline-none hover:opacity-80 focus:ring"
                            type="submit">
                            Search
                          </button>
                        </div>
                        <div className="flex justify-center mt-5">
                          <button
                            className="rounded-lg bg11 px-6 py-2 font-medium text-white outline-none hover:opacity-80 focus:ring"
                            onClick={handleReset}>
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="p-3 w-full ">
              <div className="overflow-x-auto rounded-xl w-full border-[0.5px] ">
                <table className="w-full table-auto">
                  <thead className="text-xs text-black uppercase  bg12 text-left">
                    <tr>
                      <th colSpan="7" className="px-6 py-3 text-sm bg-white">
                        Properties
                      </th>
                    </tr>

                    <tr>
                      <th scope="col" className="px-6 py-3">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Property Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Owner Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Property Type
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Verified Date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Price
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isFiltered && currentProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500">
                          No Products found
                        </td>
                      </tr>
                    )}
                    {currentProducts
                      .sort(
                        (a, b) => new Date(b.soldDate) - new Date(a.soldDate)
                      )
                      .map((product, index) => (
                        <tr
                          key={product._id}
                          className="bg-white border-b hover:bg-gray-200 text-left"
                          //    onClick={() => handleRowClick(user._id)}
                        >
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {serialNumber + index}
                          </th>
                          <td
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                            {product.propertyName}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {product.ownerName}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {product.location}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {product?.propertyType || "NA"}
                          </td>

                          <td className="px-6 py-4 text-red-500 font-medium">
                            {product?.verificationDate
                              ? new Date(
                                  product.verificationDate
                                ).toLocaleDateString("en-GB")
                              : "NA"}
                          </td>
                          <td className="px-6 py-4 bg15 font-medium">
                            ₹ {product.price}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-between m-5 items-center">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(indexOfFirstProduct + 1)} -{" "}
                  {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
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
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
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
        )}
        {isLoading && (
          <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default Properties;

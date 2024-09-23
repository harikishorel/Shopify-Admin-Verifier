import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Dashboard/layout/layout";
import axios from "axios";

export async function getServerSideProps({ req, query }) {
  const URL = process.env.URL;
  const verifierId = query.verifierId;
  if (!verifierId) {
    throw new Error("Verifier ID is missing.");
  }

  try {
    const response = await axios.get(
      `${URL}/api/verifier/getDet?verifierId=${verifierId}`,
      {
        params: {
          searchTerm: query.searchTermInput || "",
          dateFrom: query.dateFrom || "",
          dateTo: query.dateTo || "",
          status: query.status || "",
          currentPage: query.currentPage || "1",
        },
      }
    );
    const data = response.data;
    return {
      props: {
        products: data || [],
        initialSearchTerm: query.searchTermInput || "",
        initialDateFrom: query.dateFrom || "",
        initialDateTo: query.dateTo || "",
        initialStatus: query.status || "",
        currentPage: parseInt(query.currentPage) || 1,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        products: [],
        initialSearchTerm: "",
        initialDateFrom: "",
        initialDateTo: "",
        initialStatus: "",
        currentPage: 1,
      },
    };
  }
}

const Verifier = ({
  products,
  initialSearchTerm,
  initialDateFrom,
  initialDateTo,
  initialStatus,
}) => {
  console.log("products", products);

  const router = useRouter();

  const [productNameFilter, setProductNameFilter] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchClicked, setSearchClicked] = useState(false);
  const itemsPerPage = 10;
  const [filterDateFrom, setFilterDateFrom] = useState(""); // Separate state for "Verified Date From"
  const [filterDateTo, setFilterDateTo] = useState(""); // Separate state for "Verified Date To"
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    setFilteredProducts(products);

    const hasFilterParams =
      initialSearchTerm || initialDateFrom || initialDateTo || initialStatus;

    if (hasFilterParams) {
      filterProducts();
    }

    setSearchTerm(router.query.searchTermInput || "");
    setFilterDateFrom(router.query.dateFrom || "");
    setFilterDateTo(router.query.dateTo || "");
    setSelectedStatus(router.query.status || "");

    // Set the currentPage based on URL

    // const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    // if (currentPageFromQuery !== currentPage) {
    //   setCurrentPage(currentPageFromQuery);
    // }
  }, [
    products,
    initialSearchTerm,
    initialDateFrom,
    initialDateTo,
    initialStatus,
    router.query,
  ]);

  useEffect(() => {
    // Update the URL with the currentPage
    const queryParams = {
      searchTermInput: searchTerm,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
      status: selectedStatus,
      currentPage: currentPage,
    };

    const queryString = Object.keys(queryParams)
      .map((key) => key + "=" + queryParams[key])
      .join("&");

    const newUrl = `${window.location.pathname}?${queryString}`;

    // Modify the URL without a page reload
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }, [
    searchTerm,
    filterDateFrom,
    filterDateTo,
    selectedStatus,
    currentPage,
    router.pathname,
  ]);
  // Use another useEffect to handle the initial load and set the correct currentPage
  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    if (currentPageFromQuery !== currentPage) {
      setCurrentPage(currentPageFromQuery);
    }
  }, [router.query.currentPage, products]);

  const filterProducts = () => {
    // Filter products based on the selected date
    const fromDateObject =
      filterDateFrom === "" ? null : new Date(filterDateFrom);
    const toDateObject = filterDateTo === "" ? null : new Date(filterDateTo);

    const filteredProductsByDateRange = products.filter((product) => {
      const productDate = new Date(product.verifiedOn);
      // Check if the product date is within the specified range
      return (
        (!fromDateObject || productDate >= fromDateObject) &&
        (!toDateObject || productDate <= toDateObject)
      );
    });

    // Filter products based on the selected status
    const filteredProductsByStatus = filteredProductsByDateRange.filter(
      (product) => {
        if (selectedStatus === "") {
          return true;
        }

        return (
          selectedStatus === "" ||
          (product.verificationStatus &&
            product.verificationStatus.toLowerCase() ===
              selectedStatus.toLowerCase())
        );
      }
    );

    const filteredData = filteredProductsByStatus
      .filter((product) => {
        const productNameMatch = product.propertyId.propertyName
          ? product.propertyId.propertyName.toLowerCase()
          : "";

        return productNameMatch.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        return new Date(b.verifiedOn) - new Date(a.verifiedOn);
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
  }, [
    filterDateFrom,
    filterDateTo,
    selectedStatus,
    searchTerm,
    isFiltered,
    searchClicked,
  ]);
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
      status: selectedStatus,
    };

    const queryString = Object.keys(queryParams)
      .map((key) => key + "=" + queryParams[key])
      .join("&");

    const newUrl = `${window.location.pathname}?${queryString}`;

    // Update the URL first
    router.replace(newUrl);

    // Rest of your logic
    const statusDropdown = document.getElementById("status");
    const selectedStatusValue = statusDropdown.value;

    const dateInput = document.getElementById("date");
    setFilterDateFrom(dateInput.value);

    const dateToInput = document.getElementById("dateTo");
    setFilterDateTo(dateToInput.value);
  };

  const filteredProductsByStatus = filteredProducts.filter((product) => {
    return (
      selectedStatus === "" ||
      (product.verificationStatus &&
        product.verificationStatus.toLowerCase() ===
          selectedStatus.toLowerCase())
    );
  });

  const totalFilteredProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredProducts / itemsPerPage);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    // Ensure the newPage is within the valid range
    if (newPage > 0 && newPage <= totalPages) {
      const queryParams = {
        searchTermInput: searchTerm,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
        status: selectedStatus,
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
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSelectedStatus("");
  };

  // const handleRowClick = (propertyId, propertyName) => {
  //   if (!selectedStatus || selectedStatus === "verified") {
  //     const formattedProductName = productName.replace(/\s+/g, "%20");
  //     const url = `http://verisilks.in:3000/description/${formattedProductName}/${propertyId}`;
  //     window.open(url, "_blank");
  //   }
  // };

  let serialNumber = indexOfFirstProduct + 1;

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Verified Properties</h1>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-screen-md">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <form
                  className="w-fit mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}>
                  <div className="relative mb-10 w-full flex items-center justify-between rounded-md">
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
                      placeholder="Search by Property name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ "::placeholder": { color: "blue" } }}
                    />
                  </div>

                  <div className="flex flex-wrap justify-between gap-6">
                    <div className="flex flex-col w-full md:w-48">
                      <label
                        htmlFor="date"
                        className="text-sm font-medium text-stone-600">
                        Verified From:
                      </label>
                      <input
                        type="date"
                        id="date"
                        className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col w-full md:w-48">
                      <label
                        htmlFor="dateTo"
                        className="text-sm font-medium text-stone-600">
                        Verified to:
                      </label>
                      <input
                        type="date"
                        id="dateTo"
                        className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col w-full bg15 md:w-48">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-stone-600">
                        Status
                      </label>
                      <select
                        id="status"
                        className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={selectedStatus}
                        onChange={(e) => {
                          setSelectedStatus(e.target.value);
                        }}>
                        <option value="">All Status</option>
                        <option value="verified">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-5 justify-center">
                    <div className="flex justify-center mt-6">
                      <button
                        className="rounded-lg bg11 px-8 py-2 font-medium text-white outline-none hover:opacity-80 focus:ring"
                        type="submit">
                        Search
                      </button>
                    </div>
                    <div className="flex justify-center mt-6">
                      <button
                        className="rounded-lg bg11 px-8 py-2 font-medium text-white outline-none hover:opacity-80 focus:ring"
                        onClick={handleReset}>
                        Reset
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {isFiltered && currentProducts.length > 0 ? (
            <div className="p-3 w-full">
              <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
                <table className="w-full table-auto">
                  <thead className="text-xs text-black uppercase text-left bg12 ">
                    <tr>
                      <th
                        colSpan="7"
                        className="px-6 py-3 text-start text-sm bg-white">
                        List
                      </th>
                    </tr>
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Products
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Owner
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Verification Type
                      </th>
                      <th scope="col" className="px-6 py-3">
                        status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Verified Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-gray-500">
                          No product available
                        </td>
                      </tr>
                    )}
                    {currentProducts
                      .slice() // Create a shallow copy of the array to avoid mutating the original array
                      .sort(
                        (a, b) =>
                          new Date(b.verifiedOn) - new Date(a.verifiedOn)
                      )
                      .map((product, index) => (
                        <tr
                          key={product._id}
                          className={`bg-white border-b text-left hover:bg-gray-100`}>
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {serialNumber + index}
                          </th>
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {product.propertyId.propertyName}
                          </th>
                          <td className="px-6 py-4 text-gray-900">
                            {product.propertyId.ownerName}
                          </td>
                          <td
                            className="px-6 py-4 text-gray-900"
                            title={product.propertyId.location}>
                            {" "}
                            {/* {product.propertyId.location} */}
                            {product.propertyId.location
                              ? product.propertyId.location.substring(0, 15) +
                                (product.propertyId.location.length > 15
                                  ? "..."
                                  : "")
                              : "NA"}
                          </td>

                          <td className="px-6 py-4 text-gray-900">
                            ₹{product.propertyId.price}
                          </td>

                          <td className="px-6 py-4 text-black">
                            {product?.verificationType
                              ? product?.verificationType
                                  .charAt(0)
                                  .toUpperCase() +
                                product?.verificationType.slice(1).toLowerCase()
                              : "Unknown"}{" "}
                          </td>

                          <td
                            className={`px-6 py-4 font-medium  ${
                              product.verificationStatus === "rejected"
                                ? "text-red-500"
                                : product.verificationStatus === "verified"
                                ? "text-green-500"
                                : "text-gray-500"
                            }`}>
                            {product.verificationStatus === "rejected"
                              ? "Rejected"
                              : product.verificationStatus === "verified"
                              ? "Approved"
                              : ""}
                          </td>

                          <td
                            className={`px-6 py-4 font-medium ${
                              product.verificationStatus === "rejected"
                                ? "text-red-500"
                                : "text-green-500"
                            }`}>
                            {new Date(product.verifiedOn).toLocaleDateString(
                              "en-GB"
                            )}
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
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No Products Available
            </p>
          )}
        </div>
      </Layout>
    </div>
  );
};

export default Verifier;

import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ req, query }) {
  const URL = process.env.URL;

  try {
    const sellerId = query.sellerId; // Assuming the query parameter is named sellerId
    console.log("selleridapifront", sellerId);

    if (!sellerId) {
      throw new Error("Seller ID is missing.");
    }

    const response = await axios.get(
      `${URL}/api/Seller/allproducts/${sellerId}`,
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

function Seller({
  products,
  initialSearchTerm,
  initialDateFrom,
  initialDateTo,
  initialStatus,
}) {
  console.log("proucrs", products);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState(""); // Separate state for "Sold Date From"
  const [filterDateTo, setFilterDateTo] = useState(""); // Separate state for "Sold Date To"
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

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

  // useEffect(() => {
  //   // Update the URL with the currentPage
  //   const queryParams = {
  //     searchTermInput: searchTerm,
  //     dateFrom: filterDateFrom,
  //     dateTo: filterDateTo,
  //     status: selectedStatus,
  //     currentPage: currentPage,
  //   };

  //   const queryString = Object.keys(queryParams)
  //     .map((key) => key + "=" + queryParams[key])
  //     .join("&");

  //   const newUrl = `${window.location.pathname}?${queryString}`;

  //   // Modify the URL without a page reload
  //   router.replace(newUrl);
  // }, [
  //   searchTerm,
  //   filterDateFrom,
  //   filterDateTo,
  //   selectedStatus,
  //   currentPage,
  //   router.pathname,
  // ]);

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

    // Filter products based on the selected date range
    const filteredProductsByDateRange = products.filter((product) => {
      const productDate = new Date(product.soldDate);

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
          (product.soldStatus && selectedStatus === "Sold") ||
          (!product.soldStatus &&
            product.ProdStatus &&
            selectedStatus === "Available") ||
          (!product.soldStatus &&
            !product.ProdStatus &&
            selectedStatus === "Unavailable") ||
          (product.verificationStatus && selectedStatus === "verified") ||
          (product.verificationStatus && selectedStatus === "Not Verified")
        );
      }
    );

    // Filter further based on the search term
    const filteredData = filteredProductsByStatus.filter((product) => {
      const productName = product.productName
        ? product.productName.toLowerCase()
        : "";
      return productName.includes(searchTerm.toLowerCase());
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

    // Reset and disable sold date filters if the selected status is not "Sold"
    if (selectedStatusValue !== "Sold") {
      setFilterDateFrom("");
      setFilterDateTo("");
    } else {
      // Enable and set the filterDate state based on the selected date only if "Sold" is selected
      const dateInput = document.getElementById("date");
      dateInput.removeAttribute("disabled");
      setFilterDateFrom(dateInput.value);

      const dateToInput = document.getElementById("dateTo");
      dateToInput.removeAttribute("disabled");
      setFilterDateTo(dateToInput.value);
    }

    // Disable date inputs if the selected status is not "Sold"
    const dateInput = document.getElementById("date");
    dateInput.disabled = selectedStatusValue !== "Sold";

    const dateToInput = document.getElementById("dateTo");
    dateToInput.disabled = selectedStatusValue !== "Sold";

    // Set opacity based on the disabled/enabled state
    const opacityValue = selectedStatusValue === "Sold" ? 1 : 0.5;
    dateInput.style.opacity = opacityValue;
    dateToInput.style.opacity = opacityValue;
    setSearchClicked(true);
  };

  const [searchQuery, setSearchQuery] = useState("");

  let totalDiscountedPrice = 0;

  products.forEach((product) => {
    const discountedPrice =
      product.discountPrice - (product.discountPrice * 2) / 100 - 200;
    totalDiscountedPrice += discountedPrice;

    // You can log each product's discounted price if needed
    console.log(
      `Discounted Price for ${product.productName}:`,
      discountedPrice
    );
  });

  // Calculate the total price
  const totalPrice = Number(totalDiscountedPrice.toFixed(2));

  let totalReductionAmount = 0;

  products.forEach((product) => {
    // Calculate the reduction amount for each product
    const reductionAmount = product.discountPrice * (2 / 100) + 200;
    totalReductionAmount += reductionAmount;

    // Log the reduction amount for each product if needed
    console.log(
      `Reduction Amount for ${product.productName}:`,
      reductionAmount
    );
  });

  // Round off the total reduction amount to two decimal places
  const totalReduction = Number(totalReductionAmount.toFixed(2));

  // console.log("Total Reduction Amount:", totalReduction);

  const totalProducts = products.length;

  useEffect(() => {
    // setCurrentPage(1);
  }, [products]);

  const totalFilteredProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalFilteredProducts / itemsPerPage);

  const hasDataForPage = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex).length > 0;
  };

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

  const handleRowClick = (productId, productName) => {
    if (!selectedStatus || selectedStatus === "Available") {
      const formattedProductName = productName.replace(/\s+/g, "%20");
      const url = `http://verisilks.in:3000/description/${formattedProductName}/${productId}`;
      window.open(url, "_blank");
    }
  };

  let serialNumber = indexOfFirstProduct + 1;

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 bg-gray-50 gap-8">
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Products</h1>
            </div>
          </div>
          <div className="flex items-center justify-center ">
            <div className="flex flex-col items-center w-max max-w-screen-md">
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
                      placeholder="Search by product, customer name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ "::placeholder": { color: "blue" } }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col w-full md:w-48">
                      <label
                        htmlFor="date"
                        className={`text-sm font-medium text-stone-600 ${
                          selectedStatus !== "Sold" ? "opacity-50" : ""
                        }`}>
                        Sold Date From
                      </label>
                      <input
                        type="date"
                        id="date"
                        className={`mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                          selectedStatus !== "Sold" ? "opacity-50" : ""
                        }`}
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        disabled={selectedStatus !== "Sold"}
                      />
                    </div>
                    <div className="flex flex-col w-full md:w-48">
                      <label
                        htmlFor="dateTo"
                        className={`text-sm font-medium text-stone-600 ${
                          selectedStatus !== "Sold" ? "opacity-50" : ""
                        }`}>
                        Sold Date To
                      </label>
                      <input
                        type="date"
                        id="dateTo"
                        className={`mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                          selectedStatus !== "Sold" ? "opacity-50" : ""
                        }`}
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        disabled={selectedStatus !== "Sold"}
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
                        <option value="Available">Listed</option>
                        <option value="Unavailable">Deactivated</option>
                        <option value="Sold">Sold</option>
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
                  <thead className="text-xs text-black uppercase  bg12 text-left ">
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
                        colour
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Verified Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Sold Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr
                        className={`bg-white border-b ${
                          product.soldStatus
                            ? "cursor-not-allowed opacity-90"
                            : "hover:bg-gray-100"
                        }`}
                        key={product._id}
                        onClick={() =>
                          handleRowClick(product._id, product.productName)
                        }>
                        {" "}
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {serialNumber + index}
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-left text-gray-900 whitespace-nowrap">
                          {product.productName}
                        </th>
                        <td className="px-6 py-4 text-gray-900">
                          {product.sareeColour}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {" "}
                          ₹{product.discountPrice}
                        </td>
                        <td
                          className={`px-6 py-4 font-bold ${
                            product.soldStatus
                              ? "text-red-500"
                              : product.ProdStatus
                              ? "bg15"
                              : "text-gray-500"
                          }`}>
                          {product.soldStatus
                            ? "Sold"
                            : product.ProdStatus
                            ? "Listed"
                            : "Deactivated"}
                        </td>
                        <td
                          className={`px-6 py-4 font-medium ${
                            product.verificationStatus === "verified"
                              ? "text-green-500"
                              : "text-gray-500"
                          }`}>
                          {product.verificationStatus === "verified"
                            ? "Verified"
                            : "Not Verified"}
                        </td>
                        <td
                          className={`px-6 py-4 font-semibold ${
                            product.soldDate ? "text-red-400" : "text-gray-400"
                          }`}>
                          {product.soldDate
                            ? new Date(product.soldDate).toLocaleDateString(
                                "en-US"
                              )
                            : "Not Sold"}
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
              No products added for this seller.
            </p>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default Seller;

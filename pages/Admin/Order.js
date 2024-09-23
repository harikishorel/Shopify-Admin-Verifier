import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export async function getServerSideProps({ req, query }) {
  try {
    const response = await axios.get(`${process.env.URL}/api/admin/getrefund`, {
      params: {
        searchTerm: query.searchTermInput || "",
        dateFrom: query.dateFrom || "",
        dateTo: query.dateTo || "",
        status: query.status || "",
        currentPage: query.currentPage || "1", // Include currentPage in the params
      },
    });

    const data = response.data;

    console.log("Fetched data:", data);

    return {
      props: {
        products: data.combinedRefunds || [],
        isLoading: false,
        initialSearchTerm: query.searchTermInput || "",
        initialDateFrom: query.dateFrom || "",
        initialDateTo: query.dateTo || "",
        initialStatus: query.status || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Error fetching combined refunds:", error);

    return {
      props: {
        products: [],
        isLoading: false,
        initialSearchTerm: "",
        initialDateFrom: "",
        initialDateTo: "",
        initialStatus: "",
        currentPage: 1,
      },
    };
  }
}

function Order({
  products,
  isLoading,
  initialSearchTerm,
  initialDateFrom,
  initialDateTo,
  initialStatus,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState(""); // Separate state for "Sold Date From"
  const [filterDateTo, setFilterDateTo] = useState(""); // Separate state for "Sold Date To"
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
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
  }, [
    products,
    initialSearchTerm,
    initialDateFrom,
    initialDateTo,
    initialStatus,
    router.query,
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
    const fromDateObject =
      filterDateFrom === "" ? null : new Date(filterDateFrom);
    const toDateObject = filterDateTo === "" ? null : new Date(filterDateTo);
    const filteredProductsByDateRange = products.filter((product) => {
      const productDate = new Date(product.refund.paymentDate); // Change 'soldDate' to 'refund.paymentDate'
      return (
        (!fromDateObject || productDate >= fromDateObject) &&
        (!toDateObject || productDate <= toDateObject)
      );
    });
    const filteredProductsByStatus = filteredProductsByDateRange.filter(
      (product) => {
        if (selectedStatus === "") {
          return true; // Include all products when no status is selected
        }
        if (product.refund && product.refund.returnStatus) {
          return (
            (selectedStatus === "Seller Accepted" &&
              product.refund.returnStatus === "Seller Accepted") ||
            (selectedStatus === "Refunded" &&
              product.refund.returnStatus === "Refunded")
          );
        }

        return false; // Exclude products without a refund or return status
      }
    );

    const filteredData = filteredProductsByStatus.filter((product) => {
      const customerName = product.customer.name
        ? product.customer.name.toLowerCase()
        : "";
      const productName = product.product.productName
        ? product.product.productName.toLowerCase()
        : "";

      return (
        customerName.includes(searchTerm.toLowerCase()) ||
        productName.includes(searchTerm.toLowerCase())
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

    // Modify the URL without a page reload
    router.replace(newUrl);
    // Trigger the filtering logic
    setSearchClicked(true);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSelectedStatus("");
  };

  const handleRowClick = (orderId) => {
    router.push(`/Admin/Orderdetails/${orderId}`);
  };
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [products]);

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

  let serialNumber = indexOfFirstProduct + 1;

  const makePayment = async (user) => {
    try {
      // Load Razorpay SDK
      const isRazorpayLoaded = await initializeRazorpay();

      if (!isRazorpayLoaded) {
        alert("Razorpay SDK Failed to load");
        return;
      }

      // Make API call to the serverless API to initiate the payment
      const response = await fetch("/api/test/razorPay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taxAmt: user.totalDiscountPrice,
        }),
      });

      const data = await response.json();

      var options = {
        key: process.env.RAZORPAY_KEY,
        name: "Indradhanu.online",
        currency: data.currency,
        amount: data.taxAmt,
        order_id: data.id,
        description: "Thank you for your test donation",
        image: "https://manuarora.in/logo.png",
        handler: async function (response) {
          // Validate payment at the server - using webhooks is a better idea.
          console.log("sellerlllll", user._id);

          // Check if the payment is successful (you can add more conditions as needed)
          if (response.razorpay_payment_id) {
            // After successful payment, update seller payment status
            try {
              const updateResponse = await axios.post(
                "/api/admin/updateSellerPaymentStatus",
                {
                  sellerId: user._id, // Replace with the actual sellerId
                  // Add any other necessary data to send to the API
                }
              );

              console.log(
                "Update Seller Payment Status Response:",
                updateResponse.data
              );

              // Check if the update was successful
              if (updateResponse.data) {
                // Perform any additional actions based on the update response if needed
                console.log("Payment and Update Successful");
                window.location.reload();
              } else {
                // Handle the case where the update was not successful
                console.error(
                  "Update Seller Payment Status Failed:",
                  updateResponse.data.message
                );
              }
            } catch (updateError) {
              console.error(
                "Error updating seller payment status:",
                updateError
              );
              // Handle the update error
            }
          } else {
            // Handle the case where payment is not successful
            console.error("Payment not successful");
          }
        },
        prefill: {
          name: "pradeep das",
          email: "admin@indradhanu.online",
          contact: "9853785519",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating Razorpay payment:", error);
      // Handle the payment initiation error
    }
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      // document.body.appendChild(script);

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  return (
    <Layout rowCount={filteredProducts.length}>
      {!isLoading && (
        <div className="sm:ml-64 flex flex-col mt-20 bg-gray-50 h-screen gap-8">
          {/* Dropdown for selecting date and month */}

          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Orders</h1>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center w-max max-w-screen-md">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <form
                  className="w-fit mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}>
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
                        className="text-sm font-medium text-stone-600">
                        Date From
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
                        Date To
                      </label>
                      <input
                        type="date"
                        id="dateTo"
                        className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col w-full md:w-48">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-stone-600">
                        Status
                      </label>
                      <select
                        id="status"
                        className="mt-2 block bg15 w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Seller Accepted">Seller Accepted</option>
                        <option value="Refunded">Refunded</option>
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

          {isFiltered && currentProducts.length === 0 ? (
            <p className="text-center text-gray-500">No refunds</p>
          ) : (
            <div className="p-3 w-full">
              <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
                <table className="w-full table-auto">
                  <thead className="text-xs text-black uppercase  bg12  text-left">
                    <tr className="text-sm dark:bg-meta-4 text-left">
                      <th
                        colSpan="8"
                        className="px-6 py-3 text-start text-sm bg-white">
                        Return orders
                      </th>
                    </tr>

                    <tr>
                      <th scope="col" className="px-6 py-3">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Product name
                      </th>

                      <th scope="col" className="px-6 py-3">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Customer name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Seller name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr
                        className="bg-white border-b cursor-pointer hover:bg-gray-200 text-left"
                        onClick={() => handleRowClick(product.refund.orderId)}
                        key={product.refund._id}>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {serialNumber + index}
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {product.product.productName}
                        </th>

                        <td className="px-6 py-4 text-gray-900">
                          {new Date(
                            product.refund.paymentDate
                          ).toLocaleDateString("en-US")}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {product.customer.name}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {product.seller.name}
                        </td>

                        <td className="px-8 py-6 flex items-center text-gray-900">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 mt-1 font-semibold ${
                              product.refund.returnStatus === "Seller Accepted"
                                ? "bg11"
                                : "bg-red-500"
                            }`}></div>
                          <span
                            className={`font-semibold ${
                              product.refund.returnStatus === "Seller Accepted"
                                ? "text-bg11"
                                : "text-red-500"
                            }`}>
                            {product.refund.returnStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-white">
                          {product.refund.returnStatus === "Refunded" ? (
                            <span className="text-red-500 font-semibold">
                              Paid
                            </span>
                          ) : (
                            <button
                              className="rounded-lg overflow-hidden relative w-32 h-10 cursor-pointer flex items-center border border-bg11 bg11 group hover:bg12 active:bg12 active:border-bg12"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Clicked user:", user); // Log the user object
                                makePayment(user);
                              }}>
                              <span className="text-green-300 font-semibold ml-5 transform group-hover:translate-x-20 transition-all duration-300">
                                ₹{product.refund.amountPaid}
                              </span>
                              <span className="absolute right-0 h-full w-10 rounded-lg bg11 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300  group-hover:text-green-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="w-6 h-6 mr-4">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                  />
                                </svg>
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="px-8 py-6 flex items-center text-gray-900">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-2 mt-1"></div>
                          {product.refund.paymentMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap justify-between m-5 items-center">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(indexOfFirstProduct + 1)} -{" "}
                  {Math.min(indexOfLastProduct, currentProducts.length)} of{" "}
                  {filteredProducts.length} entries
                </div>
                {filteredProducts.length > 0 && (
                  <div className="flex space-x-2 mt-2 rounded-md overflow-hidden border-2 border-[#D5D9D9] shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`relative flex items-center px-2 py-2 ${
                        currentPage === 1
                          ? "text-[#5B5C5C] cursor-not-allowed"
                          : " text-black hover:bg-gray-200 hover:border-[#F5F6F6]"
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
          )}
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
  );
}

export default Order;

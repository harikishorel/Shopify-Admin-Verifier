import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ req, query }) {
  const URL = process.env.URL;

  try {
    const sellerId = query.sellerId;

    if (!sellerId) {
      throw new Error("Seller ID is missing.");
    }

    const res = await axios.get(`${URL}/api/Seller/allpayment/${sellerId}`, {
      params: {
        searchTerm: query.searchTermInput || "",
        currentPage: query.currentPage || "1",
        date: query.selectedDate || "", // Include selectedDate in the params
      },
    });

    const data = res.data; // Access the data property directly

    // Calculate the total payment amount
    const totalPaymentAmount = data.reduce(
      (total, product) => total + (product.amountPaid || 0),
      0
    );

    return {
      props: {
        products: data || [],
        totalPaymentAmount,
        sellerId: sellerId,
        currentPage: parseInt(query.currentPage) || 1,
        initialSearchTerm: query.searchTermInput || "",
        date: query.selectedDate || "", // Pass the selected date to the client-side
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      props: {
        products: [],
        totalPaymentAmount: 0,
        sellerId: null,
        initialSearchTerm: "",
        currentPage: 1,
        date: "", // Set default selected date
      },
    };
  }
}

function Paid({
  products: initialProducts,
  sellerId,
  date,
  initialSearchTerm,
}) {
  const [products, setProducts] = useState(initialProducts);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPrices, setTotalPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState(date);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isRotated, setRotated] = useState(false);
  const itemsPerPage = 8;

  let totalDiscountedPrice = 0;

  useEffect(() => {
    setSelectedDate(router.query.selectedDate || "");
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    if (currentPageFromQuery !== currentPage) {
      setCurrentPage(currentPageFromQuery);
    }
  }, [router.query.currentPage, products, router.query.selectedDate]);

  useEffect(() => {
    setFilteredProducts(products);

    const hasFilterParams = initialSearchTerm;

    if (hasFilterParams) {
      filterProducts();
    }

    setSearchTerm(router.query.searchTermInput || "");
  }, [products, initialSearchTerm, router.query]);

  const handleSearch = () => {
    const queryParams = {
      searchTermInput: searchTerm,
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

  const filterProducts = () => {
    const filteredData = products.filter((product) => {
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
  }, [searchTerm, isFiltered, searchClicked]);

  useEffect(() => {
    // Trigger filtering logic on page load if filters were applied
    if (isFiltered) {
      filterProducts();
    }
  }, [isFiltered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchClicked]);
  // Calculate the total price
  const totalPrice = Number(totalDiscountedPrice.toFixed(2));

  let totalReductionAmount = 0;

  products.forEach((product) => {
    // Calculate the reduction amount for each product
    const reductionAmount = product.discountPrice * (2 / 100);
    totalReductionAmount += reductionAmount;

    // Log the reduction amount for each product if needed
  });

  // Round off total reduction amount to two decimal places
  const totalReduction = Number(totalReductionAmount.toFixed(2));

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts
    .filter(
      (product) =>
        product.soldStatus && product.sellerPaymentReceivedStatus === "Paid"
    )
    .slice(indexOfFirstProduct, indexOfLastProduct);
  const [productReductions, setProductReductions] = useState({});
  const totalPages = Math.ceil(
    products.filter(
      (product) =>
        product.soldStatus && product.sellerPaymentReceivedStatus === "Paid"
    ).length / itemsPerPage
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

  // useEffect(() => {

  //   const reductions = {};
  //   products.forEach((product) => {
  //     const reductionAmount = product.discountPrice * (2 / 100);
  //     reductions[product.productName] = Number(reductionAmount.toFixed(2));
  //   });
  //   setProductReductions(reductions);
  // }, [currentProducts]);

  useEffect(() => {
    const prices = {};
    products.forEach((product) => {
      const discountedPrice =
        product.discountPrice - (product.discountPrice * 2) / 100 - 200;
      prices[product.productName] = Number(discountedPrice.toFixed(2));
    });
    setTotalPrices(prices);
  }, [products]);

  const totalPaymentAmount = products.reduce((total, product) => {
    if (
      product.sellerPaymentReceivedStatus === "Initiated" &&
      totalPrices[product.productName]
    ) {
      return total + totalPrices[product.productName];
    }
    return total;
  }, 0);

  const totalPaid = products.reduce((total, product) => {
    if (
      product.sellerPaymentReceivedStatus === "Paid" &&
      totalPrices[product.productName]
    ) {
      return total + totalPrices[product.productName];
    }
    return total;
  }, 0);

  const handleClick = () => {
    router.push(`/Admin/Payout/${sellerId}`);
  };

  const handleClear = () => {
    setSearchTerm(""); // Clear the search term
    setSelectedDate("");
    router.replace(window.location.pathname, undefined, { shallow: true });
    setRotated(true);

    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  let serialNumber = indexOfFirstProduct + 1;

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Sold Products</h1>
            </div>
            <div className="flex items-center justify-end mb-4 mr-4">
              <label className="mr-2 text-gray-500 text-base ">
                Select Payment Date:
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 h-6 text-gray-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="mb-4 md:mb-0 md:w-full">
              <div className="flex items-center justify-between h-30 md:h-auto rounded p-5 shadow-lg bg19 ml-2 md:ml-0 border-4 border-indigo-900 border-opacity-10">
                <div className="text-2xl text-black items-center justify-between">
                  <div>
                    <img src="/wallet.png" className="w-12 h-12 " />
                  </div>
                  <h4 className="text-base font-semibold mb-1.5">
                    Pending Payment
                  </h4>
                  <h2 className="text-xl font-bold mb-1.5 text-red-500 ">
                    ₹ {totalPaymentAmount}
                  </h2>
                </div>

                <div className="mt-12">
                  <button
                    className="relative rounded-lg ml-10 mt-4 py-1.5 px-8 bg12 text-black text-sm font-semibold uppercase overflow-hidden bg-white transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-indigo-500 before:to-indigo-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] hover:before:left-0"
                    onClick={() => handleClick()} // Assuming the sellerId is present in the products array
                  >
                    See More
                  </button>
                </div>
              </div>
            </div>
            <div className="md:w-full">
              <div className="flex items-center justify-between h-30 md:h-auto rounded p-4 shadow-lg bg18 ml-2 border-4 border-indigo-900 border-opacity-10">
                <div className="text-2xl text-black items-center justify-between">
                  <div>
                    <img src="/bill.png" className="w-14 h-14 " />
                  </div>
                  <h4 className="text-base font-semibold mb-1.5">
                    Payment Paid
                  </h4>
                  <h2 className="text-xl font-bold mb-1.5 text-indigo-900">
                    ₹ {totalPaid}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center gap-3  mr-20 ml-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}>
              <label htmlFor="table-search" className="sr-only">
                Search for Seller
              </label>
              <div className=" relative text-gray-600">
                <input
                  className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                  // type="search"
                  name="search"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ "::placeholder": { color: "blue" } }}
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
            <button
              className={` font-medium text-black outline-none opacity-70 hover:opacity-90${
                isRotated ? " rotated" : ""
              }`}
              onClick={handleClear}
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
          <div className="p-3 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              <table className="w-full table-auto">
                <thead className="text-xs text-black text-left uppercase  bg12 ">
                  <tr>
                    <th
                      colSpan="9"
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
                      Sold Date
                    </th>

                    {/* <th scope="col" className="px-6 py-3">
                      Profit
                    </th> */}
                    <th scope="col" className="px-6 py-3">
                      Total Payout
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Payment Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Payment Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Platform Fee %
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Shipping Fee
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isFiltered &&
                    currentProducts
                      .filter(
                        (product) =>
                          product.soldStatus &&
                          product.sellerPaymentReceivedStatus === "Paid" &&
                          (selectedDate
                            ? new Date(product.sellerPaymentReceivedDate)
                                .toISOString()
                                .split("T")[0] === selectedDate
                            : true) // Include all products if the date is not selected
                        // Include products that match the search term
                      )
                      .map((product, index) => (
                        <tr className="bg-white border-b text-left">
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {serialNumber + index}
                          </th>
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {product.productName}
                          </th>
                          <td className="px-6 py-4 text-gray-900">
                            {product.sareeColour}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {" "}
                            {product.discountPrice}
                          </td>
                          <td className="px-6 py-4 text-red-500 font-semibold">
                            {new Date(product.soldDate).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          {/* <td className="px-6 py-4 text-gray-900">
                            {productReductions[product.productName]}
                          </td> */}

                          <td className="px-6 py-4 text-gray-900">
                            {" "}
                            {totalPrices[product.productName]}
                          </td>
                          <td className="px-6 py-4  text-red-500 font-semibold">
                            {product.sellerPaymentReceivedStatus}
                          </td>
                          <td className="px-6 py-4  text-red-500 font-semibold">
                            {new Date(
                              product.sellerPaymentReceivedDate
                            ).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-6 py-4 text-gray-900 text-center">
                            {" "}
                            2%
                          </td>
                          <td className="px-6 py-4 text-gray-900"> 200</td>
                        </tr>
                      ))}
                  {isFiltered &&
                    currentProducts.filter(
                      (product) =>
                        product.soldStatus &&
                        product.sellerPaymentReceivedStatus === "Paid" &&
                        (selectedDate
                          ? new Date(product.sellerPaymentReceivedDate)
                              .toISOString()
                              .split("T")[0] === selectedDate
                          : true) // Include all products if the date is not selected
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-6 py-4 text-center text-gray-900">
                          No Products Available
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min(indexOfFirstProduct + 1)} -{" "}
                {Math.min(indexOfLastProduct, currentProducts.length)} of{" "}
                {currentProducts.length} entries
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
      </Layout>
    </div>
  );
}

export default Paid;

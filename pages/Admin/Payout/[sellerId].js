import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ query }) {
  const URL = process.env.URL;

  try {
    const sellerId = query.sellerId;
    console.log("selleridapifront", sellerId);

    if (!sellerId) {
      throw new Error("Seller ID is missing.");
    }

    const res = await fetch(`${URL}/api/Seller/allpayment/${sellerId}`, {
      date: query.selectedDate || '', // Include selectedDate in the params

    });
    const data = await res.json();
    console.log("outsideproduct", data);

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
        date: query.selectedDate || '', // Pass the selected date to the client-side
        date: '', // Set default selected date

      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      props: {
        products: [],
        totalPaymentAmount: 0,
        sellerId: null,
      },
    };
  }
}

function Seller({ products, sellerId, date }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(date);

  // console.log("insideproduct", products);
  let totalDiscountedPrice = 0;

  useEffect(() => {
    setSelectedDate(router.query.selectedDate || '');

  }, [products, router.query.selectedDate]);

  useEffect(() => {
    const queryParams = {

      selectedDate: selectedDate
    };

    const queryString = Object.keys(queryParams)
      .map((key) => key + "=" + queryParams[key])
      .join("&");

    const newUrl = `${window.location.pathname}?${queryString}`;

    // Modify the URL without a page reload
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }, [selectedDate]);

  products.forEach((product) => {
    const discountedPrice =
      product.discountPrice - (product.discountPrice * 2) / 100 - 200;
    totalDiscountedPrice += discountedPrice;

    // You can log each product's discounted price if needed
    // console.log(`Discounted Price for ${product.productName}:`, discountedPrice);
  });

  // Calculate the total price
  const totalPrice = Number(totalDiscountedPrice.toFixed(2));

  let totalReductionAmount = 0;

  products.forEach((product) => {
    // Calculate the reduction amount for each product
    const reductionAmount = product.discountPrice * (2 / 100);
    totalReductionAmount += reductionAmount;

    // Log the reduction amount for each product if needed
    // console.log(`Reduction Amount for ${product.productName}:`, reductionAmount);
  });

  // Round off the total reduction amount to two decimal places
  const totalReduction = Number(totalReductionAmount.toFixed(2));

  // console.log("Total Reduction Amount:", totalReduction);
  const [currentPage, setCurrentPage] = useState(1);
  const totalProducts = products.length;
  const totalPages = Math.ceil(
    products.filter((product) => product.soldStatus).length / 8
  );
  const indexOfLastProduct = currentPage * 8;
  const indexOfFirstProduct = indexOfLastProduct - 8;
  const currentProducts = products
    .filter((product) => product.soldStatus)
    .slice(indexOfFirstProduct, indexOfLastProduct);
  const [productReductions, setProductReductions] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const handlePageChange = (newPage) => {
    const indexOfLastSeller = newPage * itemsPerPage;
    const hasDataOnNextPage = indexOfLastSeller < products.length;

    if (
      newPage > 0 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      hasDataOnNextPage
    ) {
      setCurrentPage(newPage);
    }
  };
  const hasDataOnNextPage = indexOfLastProduct < products.length;

  useEffect(() => {
    setCurrentPage(1);

    const reductions = {};
    products.forEach((product) => {
      const reductionAmount = product.discountPrice * (2 / 100);
      reductions[product.productName] = Number(reductionAmount.toFixed(2));
    });
    setProductReductions(reductions);
  }, [products]);
  const [totalPrices, setTotalPrices] = useState({});

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
    router.push(`/Admin/Payout/Paid/${sellerId}`);
  };

  const handleClicknext = (sellerId) => {
    router.push(`/Admin/Payout/${sellerId}`);
  };

  const makePayment = async (sellerId) => {
    console.log("sellerid", sellerId);

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
          taxAmt: totalPaymentAmount,
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
          console.log("sellerlllll", sellerId);

          // Check if the payment is successful (you can add more conditions as needed)
          if (response.razorpay_payment_id) {
            // After successful payment, update seller payment status
            try {
              const updateResponse = await axios.post(
                "/api/admin/updateSellerPaymentStatus",
                {
                  sellerId: sellerId, // Replace with the actual sellerId
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
                Select Sold Date:
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
                <div className="flex flex-col">
                  <div className="text-white mt-16 ml-10">
                    <a
                      className="rounded-lg  relative w-32 h-10 cursor-pointer overflow-hidden flex items-center border border-bg11 bg11 group hover:bg12 active:bg12 active:border-bg12"
                      onClick={() => makePayment(sellerId)}>
                      <span className="text-white font-semibold ml-8 transform group-hover:translate-x-30 transition-all duration-300">
                        Pay
                      </span>
                      <span className="absolute right-4 h-full w-10 rounded-lg bg11 flex items-center justify-center transform group-hover:translate-x-5 group-hover:w-full transition-all duration-300  group-hover:text-green-400">
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
                    </a>
                  </div>
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
                <button
                  className="relative rounded-lg ml-20 mt12 py-1.5 px-8 bg12 text-black text-sm font-semibold uppercase overflow-hidden bg-white transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-indigo-500 before:to-indigo-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] hover:before:left-0"
                  onClick={() => handleClick()} // Assuming the sellerId is present in the products array
                >
                  See More
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase text-left  bg12 ">
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
                    <th scope="col" className="px-6 py-3">
                      Platform Fee %
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Shipping Fee
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Profit
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Total Payout
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts
                    .filter(
                      (product) =>
                        product.soldStatus &&
                        product.sellerPaymentReceivedStatus === "Initiated" &&
                        (selectedDate
                          ? new Date(product.soldDate)
                            .toISOString()
                            .split("T")[0] === selectedDate
                          : true) // Include all products if the date is not selected
                    )
                    .map((product, index) => (
                      <tr className="bg-white border-b text-left">
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
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
                        <td className="px-6 py-4 text-gray-900 text-center">
                          {" "}
                          2%
                        </td>
                        <td className="px-6 py-4 text-gray-900"> 200</td>
                        <td className="px-6 py-4 text-gray-900">
                          {productReductions[product.productName]}
                        </td>

                        <td className="px-6 py-4 text-gray-900">
                          {" "}
                          {totalPrices[product.productName]}
                        </td>
                        <td className="px-6 py-4 text-indigo-800 font-semibold">
                          {product.sellerPaymentReceivedStatus}
                        </td>
                      </tr>
                    ))}
                  {currentProducts.filter(
                    (product) =>
                      product.soldStatus &&
                      product.sellerPaymentReceivedStatus === "Initiated" &&
                      (selectedDate
                        ? new Date(product.soldDate)
                          .toISOString()
                          .split("T")[0] === selectedDate
                        : true) // Include all products if the date is not selected
                  ).length === 0 && (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-6 py-4 text-center text-gray-900">
                          No payment available for this seller.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>

            {/* <nav
              className="flex items-center flex-column md:flex-row justify-between ml-4 mr-4 mb-4 mt-6"
              aria-label="Table navigation">
              <span className="text-sm font-normal text-gray-500  mb-4 md:mb-0 block w-full md:inline md:w-auto">
                Showing{" "}
                <span className="font-semibold text-gray-900 ">
                  {indexOfFirstProduct + 1}-
                  {Math.min(indexOfLastProduct, products.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 ">
                  {products.length}
                </span>
              </span>
              <div className="flex items-center justify-center md:justify-center flex-grow">
                {" "}
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                  <li>
                    <a
                      href="#"
                      className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg11 border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}>
                      Previous
                    </a>
                  </li>
                  {Array.from({ length: totalPages }).map((_, page) => (
                    <li key={page}>
                      <a
                        href="#"
                        className={`flex items-center justify-center px-3 h-8 leading-tight text-bg11 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700  ${
                          page + 1 === currentPage
                            ? "text-blue-600 border-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                            : ""
                        }`}
                        onClick={() => handlePageChange(page + 1)}>
                        {page + 1}
                      </a>
                    </li>
                  ))}
\                  <li>
                    <a
                      href="#"
                      className={`flex items-center justify-center px-3 h-8 leading-tight text-white bg11 border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === totalPages || !hasDataOnNextPage
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === totalPages || !hasDataOnNextPage
                      }>
                      Next
                    </a>
                  </li>
                </ul>
              </div>
            </nav> */}
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default Seller;

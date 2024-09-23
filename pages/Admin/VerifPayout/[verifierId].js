import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ query }) {
  const URL = process.env.URL;

  try {
    const verifierId = query.verifierId;
    const response = await axios.get(
      `${URL}/api/admin/verifier/getPriceId?verifierId=${verifierId}`,
      {
        params: {
          searchTerm: query.searchTermInput || "",
          date: query.selectedDate || "", // Include selectedDate in the params
          currentPage: query.currentPage || "1",
        },
      }
    );
    const res = await axios.get(
      `${URL}/api/admin/verifier/getPaidPrice?verifierId=${verifierId}`
    );

    return {
      props: {
        products: response.data || [],
        totalPaidAmount: res.data || [],
        verifierId: verifierId,
        date: query.selectedDate || "", // Pass the selected date to the client-side
        initialSearchTerm: query.searchTermInput || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      props: {
        products: [],
        totalPaidAmount: [],
        verifierId: null,
        date: "",
        initialSearchTerm: "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  }
}

export default function Verifier({
  products,
  totalPaidAmount,
  verifierId,
  date,
}) {
  const { verifiedProperties, totalAmount } = products;
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const { replace } = useRouter();
  const [selectedDate, setSelectedDate] = useState(date);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this based on your needs

  useEffect(() => {
    setSearchTerm(router.query.searchTerm || "");

    // Set the currentPage and selectedStatus based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;
    const selectedDateFromQuery = router.query.selectedDate || "";

    if (
      currentPageFromQuery !== currentPage ||
      selectedDateFromQuery !== selectedDate
    ) {
      setCurrentPage(currentPageFromQuery);
      setSelectedDate(selectedDateFromQuery);
    }
  }, [
    router.query.currentPage,
    products,
    router.query.searchTerm,
    router.query.selectedDate,
  ]);

  const handleSeeMore = () => {
    router.push(`/Admin/VerifPayout/Paid/${verifierId}`);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedDate("");
  };

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
          taxAmt: totalAmount,
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
          console.log("VerifierId", user);

          // Check if the payment is successful (you can add more conditions as needed)
          if (response.razorpay_payment_id) {
            // After successful payment, update seller payment status
            try {
              const updateResponse = await fetch(
                "/api/admin/verifier/updateVerifierPaymentStatus",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    verifierId: user, // Pass the verifierId
                    paymentId: response.razorpay_payment_id, // Pass the paymentId or any other relevant data
                  }),
                }
              );

              console.log("Update Payment Response:", updateResponse.data);
              router.push("/Admin/VerifPayout");
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

  const filteredPendingProducts = verifiedProperties.filter(
    (product) =>
      product.paymentStatus === "pending" &&
      (selectedDate
        ? new Date(product.verifiedOn).toISOString().split("T")[0] ===
          selectedDate
        : true) &&
      (searchTerm
        ? product.propertyId.propertyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true)
  );

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredPendingProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalfiltertedProducts = filteredPendingProducts.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalfiltertedProducts / itemsPerPage)
  );

  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      hasDataForPage(newPage)
    ) {
      // Your existing logic for handling page change
      setCurrentPage(newPage);
    }
  };

  const hasDataOnNextPage = indexOfLastProduct < products.length;

  let serialNumber = indexOfFirstProduct + 1;

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex place-content-between">
            <h1 className="font-medium text-2xl ml-6">Verified Products</h1>

            <div className="flex items-center justify-end mb-4 mr-4">
              <label className="mr-2 text-gray-500 text-base ">
                Select Verified Date:
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
                    ₹ {totalAmount}
                  </h2>
                </div>
                <div className="flex flex-col">
                  <div className="text-white mt-16 ml-10">
                    <a
                      className="rounded-lg  relative w-32 h-10 cursor-pointer overflow-hidden flex items-center border border-bg11 bg11 group hover:bg12 active:bg12 active:border-bg12"
                      onClick={() => makePayment(verifierId)}>
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
                    ₹ {totalPaidAmount.totalAmount}
                  </h2>
                </div>
                <button
                  className="relative rounded-lg ml-20 mt12 py-1.5 px-8 bg12 text-black text-sm font-semibold uppercase overflow-hidden bg-white transition-all duration-400 ease-in-out shadow-md hover:scale-105 hover:text-white hover:shadow-lg active:scale-90 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-indigo-500 before:to-indigo-300 before:transition-all before:duration-500 before:ease-in-out before:z-[-1] hover:before:left-0"
                  onClick={() => handleSeeMore()} // Assuming the sellerId is present in the products array
                >
                  See More
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase text-left bg12 ">
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
                      Properties
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Verified Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Verification Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>

                    <th scope="col" className="px-6 py-3">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Payment Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {verifiedProperties.length > 0 ? (
                    filteredPendingProducts.length > 0 ? (
                      currentProducts.map((product, index) => (
                        <tr
                          key={product._id}
                          className="bg-white border-b cursor-pointer text-left hover:bg-gray-200">
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {serialNumber + index}
                          </th>
                          <td
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {product.propertyId.propertyName}
                          </td>
                          <td className={`px-6 py-4 font-medium text-red-500`}>
                            {new Date(product.verifiedOn).toLocaleDateString(
                              "en-GB"
                            )}
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

                          <td className="px-6 py-4 text-gray-900">
                            ₹ {product.amountAllocated}
                          </td>
                          <td className="px-6 py-4 text-indigo-800 font-semibold">
                            {product.paymentStatus === "pending"
                              ? "Pending"
                              : "Paid"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500">
                          No Properties available.
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-gray-900 font-semibold text-center">
                        {verifiedProperties.every(
                          (product) => product.paymentStatus === "sold"
                        )
                          ? "No pending payments for this verifier."
                          : "No properties available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

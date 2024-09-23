import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps({ query }) {
  const URL = process.env.URL;
  try {
    // Fetch data from the server
    const response = await axios.get(
      `${URL}/api/admin/verifier/getVerifierPrice`,
      {
        params: {
          searchTerm: query.searchTermInput || "",
          status: query.status || "",
          currentPage: query.currentPage || "1",
        },
      }
    );
    // Return the data as props
    return {
      props: {
        verifiers: response.data,
        initialSearchTerm: query.searchTermInput || "",
        initialStatus: query.status || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Error fetching verifiers:", error);
    return {
      props: {
        verifiers: [],
        initialSearchTerm: "",
        initialStatus: "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  }
}

export default function VerifPayout({
  verifiers: initialVerifiers,
  status,
  initialSearchTerm,
}) {
  const [verifiers, setVerifiers] = useState(initialVerifiers);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState(status || "");
  const [filteredVerifiers, setFilteredVerifiers] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isRotated, setRotated] = useState(false);

  useEffect(() => {
    setFilteredVerifiers(verifiers);

    const hasFilterParams = initialSearchTerm;

    if (hasFilterParams) {
      filterVerifiers();
    }

    setSearchTerm(router.query.searchTermInput || "");
  }, [verifiers, initialSearchTerm, router.query]);

  useEffect(() => {
    // Set the currentPage and selectedStatus based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;
    const selectedStatusFromQuery = router.query.selectedStatus || "";

    if (
      currentPageFromQuery !== currentPage ||
      selectedStatusFromQuery !== selectedStatus
    ) {
      setCurrentPage(currentPageFromQuery);
      setSelectedStatus(selectedStatusFromQuery);
    }
  }, [router.query.currentPage, verifiers, router.query.selectedStatus]);

  const handleRowClick = (verifierId) => {
    router.push(`/Admin/VerifPayout/${verifierId}`);
  };

  const filterVerifiers = () => {
    const filteredData = verifiers.filter((verifier) => {
      const verifierName = verifier.name ? verifier.name.toLowerCase() : "";
      const verifierEmail = verifier.email ? verifier.email.toLowerCase() : "";

      return (
        verifierName.includes(searchTerm.toLowerCase()) ||
        verifierEmail.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredVerifiers(filteredData);
    setIsFiltered(true);
  };

  useEffect(() => {
    if (searchClicked || !isFiltered) {
      // If search button clicked or not filtered yet, trigger the filtering logic
      filterVerifiers();
      setSearchClicked(false);
      setIsFiltered(true); // Set isFiltered to true after filtering
    }
  }, [searchTerm, isFiltered, searchClicked]);

  useEffect(() => {
    // Trigger filtering logic on page load if filters were applied
    if (isFiltered) {
      filterVerifiers();
    }
  }, [isFiltered]);

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

  const filteredVerifiersList =
    selectedStatus === "Payment"
      ? filteredVerifiers.filter((user) => user.totalPending > 0)
      : filteredVerifiers;

  const indexOfLastSeller = currentPage * itemsPerPage;
  const indexOfFirstSeller = indexOfLastSeller - itemsPerPage;
  const currentSellers = filteredVerifiersList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalfiltertedseller = filteredVerifiers.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalfiltertedseller / itemsPerPage)
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
      const queryParams = {
        searchTermInput: searchTerm,
        currentPage: newPage,
      };
      const queryString = Object.keys(queryParams)
        .map((key) => key + "=" + queryParams[key])
        .join("&");

      const newUrl = `${window.location.pathname}?${queryString}`;

      // Modify the URL without a page reload
      router.push(newUrl);

      // Prevent the default behavior of the anchor tag
      event.preventDefault();
    }
  };

  const hasDataForPage = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVerifiersList.slice(startIndex, endIndex).length > 0;
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
          taxAmt: user.totalPending,
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
          console.log("VerifierId", user._id);

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
                    verifierId: user._id, // Pass the verifierId
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

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm(""); // Clear the search term
    router.replace(window.location.pathname, undefined, { shallow: true });
    setRotated(true);

    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  let serialNumber = indexOfFirstSeller + 1;

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6"> Verifier Payout</h1>
            </div>
          </div>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between px-4">
            <div className="flex flex-column gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}>
                <label htmlFor="table-search" className="sr-only">
                  Search for Verifier
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
            <div className="flex flex-col w-full bg15 md:w-48">
              <select
                id="status"
                className="mt-2 block w-full cursor-pointer rounded-md border border-gray-100 bg-gray-100 px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={selectedStatus}
                onChange={handleStatusChange}>
                <option value="">All Verifier</option>
                <option value="Payment">Payment Due</option>
              </select>
            </div>
          </div>

          <div className="p-3 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px]">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase text-left bg12 ">
                  <tr>
                    <th
                      colSpan="7"
                      className="px-6 py-3 text-start text-sm bg-white">
                      Verifiers
                    </th>
                  </tr>
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Id-Proof
                    </th>
                    <th scope="col" className="px-14 py-3">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentSellers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500">
                        No Verifier found for payment
                      </td>
                    </tr>
                  )}
                  {currentSellers.map((user, index) => (
                    <tr
                      key={user._id}
                      className="bg-white border-b  cursor-pointer text-left hover:bg-gray-200"
                      onClick={() => handleRowClick(user._id)}>
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {serialNumber + index}
                      </th>
                      <td
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{user.phone}</td>
                      <td className="px-6 py-4 text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {user.idProof}
                      </td>

                      <td className="px-6 py-4 text-white">
                        <button
                          className="rounded-lg overflow-hidden relative w-32 h-10 cursor-pointer flex items-center border border-bg11 bg11 group hover:bg12 active:bg12 active:border-bg12"
                          href="{{ route('process.create') }}"
                          onClick={(e) => {
                            e.stopPropagation();
                            makePayment(user);
                          }}>
                          <span className="text-green-300 font-semibold ml-5 transform group-hover:translate-x-20 transition-all duration-300">
                            ₹{" "}
                            {user.totalPending !== undefined &&
                            user.totalPending !== null
                              ? user.totalPending
                              : 0}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              className="flex items-center flex-column md:flex-row justify-between m-4"
              aria-label="Table navigation">
              <span className="text-sm font-normal text-gray-500  mb-4 md:mb-0 block w-full md:inline md:w-auto">
                Showing{" "}
                <span className="font-semibold text-gray-900 ">
                  {indexOfFirstSeller + 1}-
                  {Math.min(indexOfLastSeller, currentSellers.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 ">
                  {filteredVerifiersList.length}
                </span>
              </span>
              <div className="flex items-center justify-center md:justify-center flex-grow ">
                {" "}
                {/* Added a container div */}
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                  {/* Previous button */}
                  <li>
                    <button
                      className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg11 border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}>
                      Previous
                    </button>
                  </li>
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }).map((_, page) => (
                    <li key={page}>
                      <a
                        href=""
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
                  {/* Next button */}
                  <li>
                    <button
                      className={`flex items-center justify-center px-3 h-8 leading-tight text-white bg11 border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === totalPages || !hasDataForPage
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === totalPages || !hasDataOnNextPage
                      }>
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </Layout>
    </div>
  );
}

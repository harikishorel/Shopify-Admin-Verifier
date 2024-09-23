import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import motion from "framer-motion";

export async function getServerSideProps() {
  const URL = process.env.URL;
  try {
    // Fetch data from the server
    const response = await axios.get(`${URL}/api/admin/getSellers`);
    // console.log("seller data:", response.data);

    // Return the data as props
    return {
      props: {
        sellers: response.data,
      },
    };
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return {
      props: {
        sellers: [],
      },
    };
  }
}

function Paid({ sellers: initialSellers }) {
  const [sellers, setSellers] = useState(initialSellers);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Set the number of sellers per page
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSellers = sellers.filter((seller) => {
    const sellerName = seller.name ? seller.name.toLowerCase() : "";
    const sellerEmail = seller.email ? seller.email.toLowerCase() : "";

    return (
      sellerName.includes(searchTerm.toLowerCase()) ||
      sellerEmail.includes(searchTerm.toLowerCase())
    );
  });

  const handleRowClick = (sellerId) => {
    router.push(`/Admin/Payout/${sellerId}`);
  };

  // const handleRowClick = (sellerId) => {
  //   router.push(`/Admin/products/${sellerId}`);
  // };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get("/api/admin/getSellers");
  //       setSellers(response.data);
  //     } catch (error) {
  //       console.error("Error fetching sellers:", error);
  //     } finally {
  //       setIsLoading(false); // Set isLoading to false when data fetching is complete
  //     }
  //   };

  //   fetchData();
  // }, [alerts]);

  // Assume you have a function to handle the status update

  const handleStatusUpdate = async (sellerId, newStatus) => {
    setLoading(true);

    try {
      // Make a PUT request to the API endpoint
      const response = await axios.put("/api/admin/updateSellerStatus", {
        sellerId,
        newStatus,
      });

      // Handle the updated user data as needed
      const updatedSeller = response.data;
      const sellerName = updatedSeller.name;

      // Find the index of the updated seller in the current sellers array
      const updatedSellerIndex = sellers.findIndex(
        (seller) => seller._id === response.data._id
      );

      // Create a new array with the updated seller
      const updatedSellers = [...sellers];
      updatedSellers[updatedSellerIndex] = response.data;

      // Update the state to trigger a re-render
      setSellers(updatedSellers);

      setLoading(false);

      // Display a success alert
      setAlerts([
        {
          type: "success",
          message: `Seller - ${sellerName} status updated successfully!`,
        },
        ...alerts,
      ]);
    } catch (error) {
      setLoading(false);
      // Handle errors, e.g., show an error alert
      setAlerts([
        {
          type: "danger",
          message: "Error updating seller status. Please try again.",
        },
        ...alerts,
      ]);
      console.error("Error updating seller status:", error.message);
    }
  };

  const toggleStatus = (sellerId, currentStatus) => {
    handleStatusUpdate(sellerId, !currentStatus);
  };

  const handleDelete = async (sellerId) => {
    const confirmDialog = document.createElement("div");
    confirmDialog.innerHTML = `
      <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow">
            <div className="flex flex-col items-center p-10">
              <svg
                className="w-10 h-10 text-gray-800 mb-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 9h2v5m-2 0h4M9.408 5.5h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h5 className="mb-1 text-xl font-medium text-gray-900 ">
                Delete Seller
              </h5>
              <span className="text-sm text-gray-500 ">
                Are you sure want to delete this seller?
              </span>
              <div className="flex mt-4 md:mt-6">
                <button id="confirmBtn" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 ">
                  Delete
                </button>
                <button id="cancelBtn" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200  ms-3">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append the modal to the document body
    document.body.appendChild(confirmDialog);

    // Define event listeners for confirm and cancel buttons
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    const handleConfirm = async () => {
      // Remove the modal from the document body
      document.body.removeChild(confirmDialog);

      setLoading(true);

      try {
        // Your Axios DELETE request here
        const response = await axios.delete("/api/admin/deleteSeller", {
          data: { sellerId },
        });

        // Handle the updated user data as needed
        const deletedSeller = response.data;
        const sellerName = deletedSeller.name;

        // Update the state to trigger a re-render
        setSellers((prevSellers) =>
          prevSellers.filter((seller) => seller._id !== sellerId)
        );
        setLoading(false);

        // Display a success alert
        setAlerts([
          {
            type: "success",
            message: `Seller - ${sellerName} deleted successfully!`,
          },
          ...alerts,
        ]);
      } catch (error) {
        setLoading(false);
        // Handle errors, e.g., show an error alert
        setAlerts([
          {
            type: "danger",
            message: "Error deleting seller details. Please try again.",
          },
          ...alerts,
        ]);
        console.error("Error deleting seller details:", error.message);
      }
    };

    const handleCancel = () => {
      // Remove the modal from the document body
      document.body.removeChild(confirmDialog);
    };

    // Attach event listeners
    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
  };

  const indexOfLastSeller = currentPage * itemsPerPage;
  const indexOfFirstSeller = indexOfLastSeller - itemsPerPage;
  const currentSellers = sellers.slice(indexOfFirstSeller, indexOfLastSeller);
  const totalPages = Math.ceil(sellers.length / itemsPerPage);

  console.log("indexOfFirstSeller:", indexOfFirstSeller);
  console.log("indexOfLastSeller:", indexOfLastSeller);
  console.log("sellers.length:", sellers.length);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  let serialNumber = indexOfFirstProduct + 1;


  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          {/* Dropdown for selecting date and month */}
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Payout</h1>
            </div>
            <div className="flex items-center justify-end mb-4 mr-4">
              <label className="mr-2 text-gray-500 text-base ">
                Select Date:
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 h-6 text-gray-500"
              />
            </div>
          </div>
          <a
            href="/Admin/Seller/AddSeller"
            className="flex flex-row items-center p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 active:bg-gray-200 cursor-pointer w-36 place-content-center ml-20">
            <button
              title="Add New"
              className="group cursor-pointer outline-none hover:rotate-90 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25px"
                height="25px"
                viewBox="0 0 24 24"
                className="stroke-green-400 fill-none group-hover:fill-green-800 group-active:stroke-green-200 group-active:fill-green-600 group-active:duration-0 duration-300">
                <path
                  d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                  strokeWidth="1.5"></path>
                <path d="M8 12H16" strokeWidth="1.5"></path>
                <path d="M12 16V8" strokeWidth="1.5"></path>
              </svg>
            </button>
            <h1 className="ml-2 text-base font-semibold">Add Seller</h1>
          </a>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4 mr-20 ml-20">
            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 "
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"></path>
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
                placeholder="Search for items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Table with Orders */}
          {/* Skeleton loading rows */}
          {/* {isLoading ? (
            <div
              role="status"
              className="w-3/4 text-sm text-left rtl:text-right text-gray-500  ml-20 shadow-xl rounded  animate-pulse p-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full  w-24 mb-2.5" />
                  <div className="w-32 h-2 bg-gray-200 rounded-full " />
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full  w-12" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full  w-24 mb-2.5" />
                  <div className="w-32 h-2 bg-gray-200 rounded-full " />
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full  w-12" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full  w-24 mb-2.5" />
                  <div className="w-32 h-2 bg-gray-200 rounded-full " />
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full  w-12" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full  w-24 mb-2.5" />
                  <div className="w-32 h-2 bg-gray-200 rounded-full " />
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full  w-12" />
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="h-2.5 bg-gray-300 rounded-full  w-24 mb-2.5" />
                  <div className="w-32 h-2 bg-gray-200 rounded-full " />
                </div>
                <div className="h-2.5 bg-gray-300 rounded-full  w-12" />
              </div>
              <span className="sr-only">Loading...</span>
            </div>
          ) : ( */}
          <table className="w-3/4 text-sm text-left rtl:text-right text-gray-500  ml-20 shadow-xl">
            <thead className="text-xs text-black uppercase  bg12 ">
              <tr>
                <th
                  colSpan="7"
                  className="px-6 py-3 text-start text-sm bg-white">
                  Sellers
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
                  Company
                </th>
                <th scope="col" className="px-14 py-3">
                  payment
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Actions
                </th> */}
              </tr>
            </thead>

            <tbody>
              {filteredSellers.map((user, index) => (
                <tr
                  key={user._id}
                  className="bg-white border-b  cursor-pointer hover:bg-gray-200"
                  // onClick={() => handleRowClick()}
                  onClick={() => handleRowClick(user._id)}>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {serialNumber + index}
                  </th>
                  <td
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{user.phone}</td>
                  <td className="px-6 py-4 text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-gray-900"> {user.shopName}</td>

                  <td className="px-6 py-4 text-white">
                    <a
                      className="rounded-lg  relative w-32 h-10 cursor-pointer flex items-center border border-bg11 bg11 group hover:bg12 active:bg12 active:border-bg12"
                      href="{{ route('process.create') }}">
                      <span className="text-white font-semibold ml-5 transform group-hover:translate-x-20 transition-all duration-300">
                        Payment
                      </span>
                      <span className="absolute right-0 h-full w-10 rounded-lg bg11 flex items-center justify-center transform group-hover:translate-x-0 group-hover:w-full transition-all duration-300">
                        <svg
                          xmlns="
http://www.w3.org/2000/svg"
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
                  </td>
                  {/* <td className="px-4 py-4 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-x-6">
                      <button
                        className="text-gray-500 transition-colors duration-200  hover:text-red-500 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user._id);
                        }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
          {/* )} */}

          <nav
            className="flex items-center flex-column md:flex-row justify-between ml-4 mr-4 mb-4"
            aria-label="Table navigation">
            <span className="text-sm font-normal text-gray-500  mb-4 md:mb-0 block w-full md:inline md:w-auto">
              Showing{" "}
              <span className="font-semibold text-gray-900 ">
                {indexOfFirstSeller + 1}-
                {Math.min(indexOfLastSeller, sellers.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 ">
                {sellers.length}
              </span>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              {/* Previous button */}
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-white bg11 border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}>
                  Previous
                </a>
              </li>
              {/* Page numbers */}
              {Array.from({ length: totalPages }).map((_, page) => (
                <li key={page}>
                  <a
                    href="#"
                    className={`flex items-center justify-center px-3 h-8 leading-tight text-bg11 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700  ${page + 1 === currentPage
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
                <a
                  href="#"
                  className="flex items-center justify-center px-3 h-8 leading-tight text-white bg11 border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}>
                  Next
                </a>
              </li>
            </ul>
          </nav>

          {/* <div className="flex justify-center">
            <ListOfSeller />
          </div> */}
        </div>

        {loading && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex-col gap-4 w-full flex items-center justify-center">
                <div className="w-20 h-20 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {alerts.map((alert, index) => (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                key={index}
                className={`flex items-center  p-4 mb-4 text-${alert.type === "success" ? "green" : "red"
                  }-800 border-2 border-${alert.type === "success" ? "green" : "red"
                  }-300 bg-${alert.type === "success" ? "green" : "red"
                  }-50 rounded-lg`}
                role="alert">
                <div
                  className={`flex-shrink-0 w-4 h-4 text-${alert.type === "success" ? "green" : "red"
                    }-500`}>
                  {alert.type === "success" ? (
                    <svg
                      className="flex-shrink-0 w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                  ) : (
                    <svg
                      className="flex-shrink-0 w-4 h-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>
                  )}
                </div>
                <div className="ms-3 text-sm font-medium">{alert.message}</div>
                <button
                  type="button"
                  className={`ms-auto -mx-1.5 -my-1.5 bg-${alert.type === "success" ? "green" : "red"
                    }-50 text-${alert.type === "success" ? "green" : "red"
                    }-500 rounded-lg focus:ring-2 focus:ring-${alert.type === "success" ? "green" : "red"
                    }-400 p-1.5 hover:bg-${alert.type === "success" ? "green" : "red"
                    }-200 inline-flex items-center justify-center h-8 w-8 `}
                  onClick={() =>
                    setAlerts(alerts.filter((_, i) => i !== index))
                  }
                  aria-label="Close">
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </Layout>
    </div>
  );
}

export default Paid;

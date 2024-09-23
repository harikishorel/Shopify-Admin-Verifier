import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import motion from "framer-motion";
import Link from "next/link";

export async function getServerSideProps({ query }) {
  try {
    // Fetch data from the server with searchTerm and currentPage parameters
    const response = await axios.get(
      `${process.env.URL}/api/admin/getSellers`,
      {
        params: {
          searchTerm: query.searchTerm || "",
          currentPage: query.currentPage || "1",
        },
      }
    );

    // Return the data as props
    return {
      props: {
        sellers: response.data,
        initialSearchTerm: query.searchTermInput || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return {
      props: {
        sellers: [],
        initialSearchTerm: "",
        currentPage: 1,
      },
    };
  }
}

function Seller({ sellers: initialSellers, initialSearchTerm }) {
  const [sellers, setSellers] = useState(initialSellers);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Set the number of sellers per page
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isRotated, setRotated] = useState(false);

  const handleSuccessPopup = (show, alertMsg, emailMsg) => {
    setShowSuccessPopup(show);
    setAlertMessage(alertMsg);
    setEmailMessage(emailMsg);
  };
  const router = useRouter();

  useEffect(() => {
    setFilteredSellers(sellers);

    const hasFilterParams = initialSearchTerm;

    if (hasFilterParams) {
      filterSellers();
    }

    setSearchTerm(router.query.searchTermInput || "");
  }, [sellers, initialSearchTerm, router.query]);

  const handleRowClick = (sellerId) => {
    router.push(`/Admin/Seller/product/${sellerId}`);
  };

  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    if (currentPageFromQuery !== currentPage) {
      setCurrentPage(currentPageFromQuery);
    }
  }, [router.query.currentPage, sellers]);

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

  const handleStatusUpdate = async (sellerId, newStatus, email) => {
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

      let alertMessage = `Seller - ${sellerName} Status Changed`;
      let emailMessage = "Unable to send email to the seller";
      try {
        // Make a request to the second API with the updated data
        const email = updatedSeller.email;
        const status = updatedSeller.status;
        const secondApiResponse = await axios.post("/api/email/SellerStatus", {
          email,
          status,
        });
        console.log(secondApiResponse.data);
        if (secondApiResponse.status === 200) {
          alertMessage = `Seller ${sellerName} Status Changed`;
          emailMessage = "Email sent successfully to the seller";
        }
      } catch (emailError) {
        console.error("Error sending email to the seller:", emailError.message);
      }

      handleSuccessPopup(true, alertMessage, emailMessage);
    } catch (error) {
      setLoading(false);
      // Handle errors, e.g., show an error alert
      setShowErrorPopup(true);
      console.error("Error updating seller status:", error.message);
    }
  };

  const handleClose = () => {
    setShowErrorPopup(false);
  };

  const toggleStatus = (sellerId, currentStatus, email) => {
    handleStatusUpdate(sellerId, !currentStatus, email);
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

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const handleShowProfile = async (userId) => {
    try {
      // Set the selected user id
      setSelectedUserId(userId);

      // Fetch user profile data using Axios
      const response = await axios.get(
        `/api/admin/getSellerProfile?id=${userId}`
      );

      // Handle the user profile data
      console.log("SellerData", response.data);

      // Set the profile data in the state
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  const handleCloseModal = () => {
    // Clear the selected user id and profile data
    setSelectedUserId(null);
    setProfileData(null);
  };

  const filterSellers = () => {
    const filteredData = sellers.filter((seller) => {
      const sellerName = seller.name ? seller.name.toLowerCase() : "";
      const sellerEmail = seller.email ? seller.email.toLowerCase() : "";

      return (
        sellerName.includes(searchTerm.toLowerCase()) ||
        sellerEmail.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredSellers(filteredData);
    setIsFiltered(true);
  };

  useEffect(() => {
    if (searchClicked || !isFiltered) {
      // If search button clicked or not filtered yet, trigger the filtering logic
      filterSellers();
      setSearchClicked(false);
      setIsFiltered(true); // Set isFiltered to true after filtering
    }
  }, [searchTerm, isFiltered, searchClicked]);

  useEffect(() => {
    // Trigger filtering logic on page load if filters were applied
    if (isFiltered) {
      filterSellers();
    }
  }, [isFiltered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchClicked]);

  const indexOfLastSeller = currentPage * itemsPerPage;
  const indexOfFirstSeller = indexOfLastSeller - itemsPerPage;
  const currentSellers = filteredSellers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalfiltertedseller = filteredSellers.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalfiltertedseller / itemsPerPage)
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
          {/* Dropdown for selecting date and month */}
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Sellers</h1>
            </div>
          </div>
          <Link
            href="/Admin/Seller/AddSeller"
            className="flex flex-row items-center p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 active:bg-gray-200 cursor-pointer w-36 place-content-center ml-6">
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
          </Link>

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

          <div className="p-3 w-full ">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px] ">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase  bg12 text-left">
                  <tr>
                    <th colSpan="7" className="px-6 py-3 text-sm bg-white">
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
                      shop name
                    </th>
                    <th scope="col" className="px-14 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isFiltered && currentSellers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500">
                        No Sellers found
                      </td>
                    </tr>
                  )}
                  {isFiltered &&
                    currentSellers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="bg-white border-b hover:bg-gray-200 text-left"
                        //    onClick={() => handleRowClick(user._id)}
                      >
                        <td
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {serialNumber + index}
                        </td>
                        <td
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap cursor-pointer hover:underline"
                          onClick={() => handleRowClick(user._id)}>
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {user.phone}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {user.email
                            ? user.email.substring(0, 15) +
                              (user.email.length > 15 ? "..." : "")
                            : "NA"}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {" "}
                          {user.shopName}
                        </td>
                        <td className="px-12 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                          <label
                            key={user._id}
                            className="relative inline-flex items-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={user.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleStatus(user._id, user.status, user.email);
                              }}
                            />
                            <div className="group peer ring-0 bg11 rounded-full outline-none duration-300 after:duration-300 w-20 h-8 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-6 after:w-6 after:top-1 after:left-1 after:-rotate-180 after:flex after:justify-center after:items-center peer-checked:after:translate-x-12 peer-checked:after:content-['✔️'] peer-hover:after:scale-95 peer-checked:after:rotate-0 peer-checked:bg12"></div>
                          </label>
                        </td>
                        <td
                          className="px-6 py-4 text-gray-900 cursor-pointer"
                          onClick={() => handleShowProfile(user._id)}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6 bg18">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing {Math.min(indexOfFirstSeller + 1)} -{" "}
                {Math.min(indexOfLastSeller, filteredSellers.length)} of{" "}
                {filteredSellers.length} entries
              </div>
              {filteredSellers.length > 0 && (
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
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                    disabled={
                      currentPage === totalPages || filteredSellers.length === 0
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

        {loading && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex-col gap-4 w-full flex items-center justify-center">
                <div className="w-20 h-20 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {showErrorPopup && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div
              id="alert-additional-content-2"
              className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 w-1/3 "
              role="alert">
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 w-4 h-4 me-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <h3 className="text-lg font-medium">Error</h3>
              </div>
              <div className="mt-2 mb-4 text-sm">
                Unable to change the Seller Status
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center ">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                id="alert-additional-content-3"
                className="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50"
                role="alert">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-green-800"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fill="currentColor"
                      d="m18.774 8.245-.892-.893a1.5 1.5 0 0 1-.437-1.052V5.036a2.484 2.484 0 0 0-2.48-2.48H13.7a1.5 1.5 0 0 1-1.052-.438l-.893-.892a2.484 2.484 0 0 0-3.51 0l-.893.892a1.5 1.5 0 0 1-1.052.437H5.036a2.484 2.484 0 0 0-2.48 2.481V6.3a1.5 1.5 0 0 1-.438 1.052l-.892.893a2.484 2.484 0 0 0 0 3.51l.892.893a1.5 1.5 0 0 1 .437 1.052v1.264a2.484 2.484 0 0 0 2.481 2.481H6.3a1.5 1.5 0 0 1 1.052.437l.893.892a2.484 2.484 0 0 0 3.51 0l.893-.892a1.5 1.5 0 0 1 1.052-.437h1.264a2.484 2.484 0 0 0 2.481-2.48V13.7a1.5 1.5 0 0 1 .437-1.052l.892-.893a2.484 2.484 0 0 0 0-3.51Z"
                    />
                    <path
                      fill="#fff"
                      d="M8 13a1 1 0 0 1-.707-.293l-2-2a1 1 0 1 1 1.414-1.414l1.42 1.42 5.318-3.545a1 1 0 0 1 1.11 1.664l-6 4A1 1 0 0 1 8 13Z"
                    />
                  </svg>

                  <h3 className="text-lg font-medium ml-1">{alertMessage}</h3>
                </div>
                <div className="mt-2 mb-4 text-sm">{emailMessage} </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-green-800 bg-transparent border border-green-800 hover:bg-green-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center "
                    data-dismiss-target="#alert-additional-content-3"
                    aria-label="Close">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedUserId && (
          // Render the user profile using the selectedUserId
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-black flex items-center justify-center z-50">
            <div className="fixed top-1/2 left-1/2 w-3/4 md:w-1/2 lg:w-1/2 xl:w-1/2  transform -translate-x-1/2 -translate-y-1/2 overflow-auto">
              <div
                id="alert-additional-content-3"
                className="border shadow rounded-lg bg-gray-50 max-h-screen overflow-y-auto"
                role="alert">
                <div className="flex items-center flex-col relative">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="absolute top-2 right-2 text-gray-700 hover:text-gray-500 focus:outline-none">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  {profileData ? (
                    <div className="w-full bg-white border border-gray-200 rounded-lg shadow p-5">
                      <h2 className="text-2xl font-bold  text-black text-center mb-5">
                        Seller Profile
                      </h2>
                      <div className="relative z-0 w-full mb-6 group">
                        <input
                          type="text"
                          name="name"
                          id="floating_first_name"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                          placeholder=""
                          disabled
                          value={profileData.name || "NA"}
                        />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                          Seller Name
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-6 group">
                        <input
                          type="email"
                          name="email"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                          placeholder=""
                          disabled
                          value={profileData.email || "NA"}
                        />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                          Email address
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-6 group">
                        <input
                          type="text"
                          name="address"
                          id="floating_last_name"
                          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                          placeholder=""
                          disabled
                          value={profileData.address || "NA"}
                        />
                        <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                          Address
                        </label>
                      </div>
                      <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="tel"
                            name="phone"
                            id="floating_phone"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.phone || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Phone number
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="text"
                            name="shopName"
                            id="floating_company"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.shopName || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Shop Name
                          </label>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="tel"
                            name="phone"
                            id="floating_phone"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.accountHolderName || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Account Holder Name
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="text"
                            name="shopName"
                            id="floating_company"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.accountNumber || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Account Number
                          </label>
                        </div>
                      </div>{" "}
                      <div className="grid md:grid-cols-2 md:gap-6">
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="tel"
                            name="phone"
                            id="floating_phone"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.ifscCode || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            IFSC Code
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            type="text"
                            name="shopName"
                            id="floating_company"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                            placeholder=""
                            disabled
                            value={profileData.upi || "NA"}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            UPI Id
                          </label>
                        </div>
                      </div>
                      <div className="relative z-0 w-full mb-6 group">
                        <label className=" text-sm text-gray-500 ">
                          ID Proof
                        </label>
                        <img
                          className="h-auto w-full rounded-lg  dark:shadow-gray-800"
                          src={profileData?.proofimg}
                          alt="ID Proof"
                        />
                      </div>
                      <div className="flex justify-end mt-5">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-white border border-gray-200 rounded-lg shadow p-5">
                      <div
                        role="status"
                        className="max-w-sm animate-pulse mt-10">
                        <div className="h-2.5 bg-gray-200 rounded-full  w-48 mb-4" />
                        <div className="h-2 bg-gray-200 rounded-full  max-w-[360px] mb-2.5" />
                        <div className="h-2 bg-gray-200 rounded-full  mb-2.5" />
                        <div className="h-2 bg-gray-200 rounded-full  max-w-[330px] mb-2.5" />
                        <div className="h-2 bg-gray-200 rounded-full  max-w-[300px] mb-2.5" />
                        <div className="h-2 bg-gray-200 rounded-full max-w-[360px]" />
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* {alerts.map((alert, index) => (
          <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
            <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                key={index}
                className={`flex items-center  p-4 mb-4 text-${
                  alert.type === "success" ? "green" : "red"
                }-800 border-2 border-${
                  alert.type === "success" ? "green" : "red"
                }-300 bg-${
                  alert.type === "success" ? "green" : "red"
                }-50 rounded-lg`}
                role="alert">
                <div
                  className={`flex-shrink-0 w-4 h-4 text-${
                    alert.type === "success" ? "green" : "red"
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
                  className={`ms-auto -mx-1.5 -my-1.5 bg-${
                    alert.type === "success" ? "green" : "red"
                  }-50 text-${
                    alert.type === "success" ? "green" : "red"
                  }-500 rounded-lg focus:ring-2 focus:ring-${
                    alert.type === "success" ? "green" : "red"
                  }-400 p-1.5 hover:bg-${
                    alert.type === "success" ? "green" : "red"
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
        ))} */}
      </Layout>
    </div>
  );
}

export default Seller;

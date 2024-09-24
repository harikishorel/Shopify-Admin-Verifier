import Sidebar from "@/components/Dashboard/sidebar/Sidebar";
import { useEffect, useState } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import VLayout from "@/components/Dashboard/layout/VLayout";
import axios from "axios";

export async function getServerSideProps(context) {
  const URL = process.env.URL;
  try {
    // Fetch data from the server
    const session = await getSession(context);
    console.log("VerifierID", session?.user?.email);

    // Get query parameters from the request context
    const { searchTerm, currentPage } = context.query;

    const VerifierID = session?.user?.email;
    const RoleID = session?.user?.image;
    const Property = await axios.get(
      `${URL}/api/verifier/getProducts`,
      {
        params: {
          searchTerm: context.query.searchTerm || "",
          currentPage: context.query.currentPage || "",
        },
      }
    );

    // const PriceData = await axios.get(
    //   `${URL}/api/verifier/realEstate/getPrice?id=${VerifierID}`
    // );
    // const verifiedProperty = await axios.get(
    //   `${URL}/api/verifier/realEstate/getPaymentDetails?id=${VerifierID}`
    // );

    // Return the data as props
    return {
      props: {
        property: Property.data,
        PriceData: 0,
        verifProp: 0,
        initialSearchTerm: context.query.searchTermInput || "",
        currentPage: parseInt(context.query.currentPage) || 1, // Parse currentPage to ensure it's a number
        role: RoleID,
        verifierId: VerifierID,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        property: [],
        PriceData: [],
        verifProp: [],
        initialSearchTerm: "",
        currentPage: 1,
        verifierId: null,
        role: null,
      },
    };
  }
}

const Dashboard = ({ property, initialSearchTerm, role, PriceData }) => {
  // Get the router object
  const router = useRouter();
  console.log(property)
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const TotalPendingProperties = property.filter(
    (product) =>
      product.verificationStatus === "pending"
  );

  const [filteredProducts, setFilteredProducts] = useState(
    TotalPendingProperties
  );
  const [searchClicked, setSearchClicked] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (initialSearchTerm) {
      filterProducts();
    }

    setSearchTerm(router.query.searchTermInput || "");
  }, [initialSearchTerm, router.query]);

  useEffect(() => {
    // Set the currentPage based on URL
    const currentPageFromQuery = parseInt(router.query.currentPage) || 1;

    if (currentPageFromQuery !== currentPage) {
      setCurrentPage(currentPageFromQuery);
    }
  }, [router.query.currentPage, TotalPendingProperties]);

  const filterProducts = () => {
    const filteredData = TotalPendingProperties.filter((property) => {
      const lowerCasedTerm = searchTerm.toLowerCase();

      return (
        property.title.toLowerCase().includes(lowerCasedTerm)
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
  }, [searchTerm, isFiltered, searchClicked]);

  useEffect(() => {
    // Trigger filtering logic on page load if filters were applied
    if (isFiltered) {
      filterProducts();
    }
  }, [isFiltered]);

  const handleSearch = () => {
    const queryParams = {
      searchTermInput: searchTerm,
      currentPage: currentPage,
    };

    router.replace(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );

    setSearchClicked(true);
  };

  const [isRotated, setRotated] = useState(false);
  const handleReset = () => {
    const queryParams = {
      searchTermInput: "",
      currentPage: 1,
    };

    router.replace(
      {
        pathname: router.pathname,
        query: queryParams,
      },
      undefined,
      { shallow: true }
    );
    setSearchTerm("");
    setCurrentPage(1);
    setRotated(true);
    setFilteredProducts(TotalPendingProperties);
    // Optionally, reset the rotation after a certain duration
    setTimeout(() => {
      setRotated(false);
    }, 1000);
  };

  const filteredAndPaginatedProducts = filteredProducts
    .slice()
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
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

      router.replace(newUrl);
      // Modify the URL without a page reload
      // window.history.replaceState({ path: newUrl }, "", newUrl);
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
      className={`px-3 py-2 rounded-md ${currentPage === pageNumber
        ? " text-white border h-full bg11"
        : "text-black h-auto hover:bg-gray-200"
        }`}>
      {pageNumber}
    </button>
  );

  // Function to handle search input changes
  const handleSearchInputChange = (e) => {
    const newSearchTerm = e.target.value;

    // If search term changes, set the current page to 1
    if (newSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }

    setSearchTerm(newSearchTerm);
  };

  let serialNumber = indexOfFirstItem + 1;

  const renderLocation = async (location) => {
    try {
      // Fetch latitude and longitude from OpenStreetMap Nominatim API
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );

      if (response.data && response.data.length > 0) {
        const { lat: latitude, lon: longitude } = response.data[0];

        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(url, "_blank");
      } else {
        console.log("Location not found");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderProduct = async (productUrl) => {
    window.open(productUrl, "_blank");
  }

  // Initialize verificationTypes based on the role
  const initialVerificationTypes = property.map((product) => {
    if (role.includes("Identity Verifier")) {
      return "Identity Verifier";
    } else if (role.includes("Property Verifier")) {
      return "Property Verifier";
    } else if (role.includes("Document Verifier")) {
      return "Document Verifier";
    } else {
      return "";
    }
  });

  const [verificationTypes, setVerificationTypes] = useState(
    initialVerificationTypes
  );

  const handleVerificationTypeChange = (index, value) => {
    const newVerificationTypes = [...verificationTypes];
    newVerificationTypes[index] = value;
    setVerificationTypes(newVerificationTypes);
  };

  const handleVerify = (productId) => {
    router.push(`/Verifier/Product/${productId}`);
  };

  return (
    <div
      className={`bg-gray-50 flex flex-col ${filteredAndPaginatedProducts.length > 3 ? "h-full" : "h-screen"
        }`}>
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 px-5">
            <div className="text-white rounded-md overflow-hidden shadow-lg p-4 bg11">
              <h4 className="text-base font-bold underline">Approved</h4>
              <div className="flex justify-between font-bold my-2">
                {/* {role.includes("Identity Verifier") && (
                  <div>
                    Identity:{" "}
                    <span className="font-bold text-green-500">
                      {PriceData.totalVerifiedIdentity}
                    </span>
                  </div>
                )}

                {role.includes("Property Verifier") && (
                  <div>
                    Property:{" "}
                    <span className="font-bold text-green-500">
                      {PriceData.totalVerifiedProperty}
                    </span>
                  </div>
                )}

                {role.includes("Document Verifier") && (
                  <div>
                    Document:{" "}
                    <span className="font-bold text-green-500">
                      {PriceData.totalVerifiedDocument}
                    </span>
                  </div>
                )} */}
              </div>
            </div>

            <div className="bg12 rounded-md overflow-hidden shadow-lg p-4">
              <h4 className="text-base font-bold text-black underline">
                Rejected
              </h4>
              {/* <div className="flex justify-between font-bold my-2">
                {role.includes("Identity Verifier") && (
                  <div>
                    Identity:{" "}
                    <span className="font-bold text-red-600">
                      {PriceData.totalRejectedIdentity}
                    </span>
                  </div>
                )}

                {role.includes("Property Verifier") && (
                  <div>
                    Property:{" "}
                    <span className="font-bold text-red-600">
                      {PriceData.totalRejectedProperty}
                    </span>
                  </div>
                )}

                {role.includes("Document Verifier") && (
                  <div>
                    Document:{" "}
                    <span className="font-bold text-red-600">
                      {PriceData.totalRejectedDocument}
                    </span>
                  </div>
                )}
              </div> */}
            </div>
          </div>

          <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center gap-1 px-8">
            <div className="flex flex-column gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}>
                <div className="relative text-gray-600">
                  <input
                    className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    // type="search"
                    name="search"
                    placeholder="Search for items"
                    value={searchTerm}
                    // onChange={(e) => setSearchTerm(e.target.value)}
                    onChange={handleSearchInputChange}
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
              <div>
                <button
                  className={`mt-2 font-medium text-black outline-none opacity-50 hover:opacity-80${isRotated ? " rotated" : ""
                    }`}
                  onClick={handleReset}
                  style={{ outline: "none" }}>
                  <svg
                    className={`w-5 h-5 text-gray-800${isRotated ? " rotated" : ""
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
            </div>
          </div>
          <div className="px-8 w-full">
            <div className="overflow-x-auto rounded-xl w-full border-[0.5px] ">
              <table className="w-full table-auto">
                <thead className="text-xs text-black uppercase bg14">
                  <tr className="text-sm dark:bg-meta-4 text-left">
                    <th className="py-2 px-4 font-medium  text-black">No</th>
                    <th className="py-2 px-4 font-medium  text-black">
                      Product Name
                    </th>
                    <th className="py-2 px-4 font-medium  text-black">Price</th>
                    <th className="py-2 px-4 font-medium  text-black">
                      View Product
                    </th>

                    <th className="py-2 px-4 font-medium text-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isFiltered && filteredAndPaginatedProducts.length > 0 ? (
                    filteredAndPaginatedProducts.map((product, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-200 text-left">
                        <td className="border-b border-gray-300 py-3 px-4">
                          <p className="text-sm text-black">
                            {serialNumber + index}
                          </p>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4">
                          <a
                            // href={product?.productUrl}
                            target="_blank"
                            rel="noopener noreferrer">
                            <h5 className="text-sm text-black cursor-pointer hover:underline">
                              {product?.title}
                            </h5>
                          </a>
                        </td>
                        <td className="border-b border-gray-300 py-3 px-4">
                          <p className="text-sm text-black"> ₹ {product?.variants?.length > 0 ? product.variants[0].price : 0}
                          </p>
                        </td>

                        <td
                          className="px-6 py-4 text-gray-900 cursor-pointer items-center"
                          onClick={() => renderProduct(product?.productUrl)}>
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

                        <td className="border-b border-gray-300 py-3 px-4">
                          <button
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none"
                            onClick={() => handleVerify(product._id)}>
                            Verify
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-gray-900 text-center font-semibold">
                        No Products Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between m-5 items-center">
              <div className="text-sm text-gray-500">
                Showing{" "}
                {Math.min(indexOfFirstItem + 1, filteredProducts.length)} -{" "}
                {Math.min(indexOfLastItem, filteredProducts.length)} of{" "}
                {filteredProducts.length} entries
              </div>
              {filteredProducts.length > 0 && (
                <div className="flex space-x-2 mt-2 rounded-md overflow-hidden border-2 border-[#D5D9D9] shadow-sm">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`relative flex items-center px-2 py-2 ${currentPage === 1
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
                    className={`relative flex items-center px-2 py-2 ${currentPage === totalPages
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
      </VLayout>
    </div>
  );
};

export default Dashboard;

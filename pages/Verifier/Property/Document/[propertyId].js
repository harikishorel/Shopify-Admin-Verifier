import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import VLayout from "@/components/Dashboard/layout/VLayout";
import { getSession, useSession } from "next-auth/react";

export async function getServerSideProps(context) {
  const { propertyId } = context.query;
  const URL = process.env.URL;
  // Get the session data
  const session = await getSession(context);

  try {
    const response = await axios.get(
      `${URL}/api/verifier/realEstate/getPropertyDetails?id=${propertyId}`
    );

    return {
      props: {
        propertyDetails: response.data,
        sessionData: session ? session.user : null,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        propertyDetails: null,
      },
    };
  }
}

const Property = ({ propertyDetails: initialDetail, sessionData }) => {
  console.log("Property Details", initialDetail);
  const router = useRouter();

  useEffect(() => {
    // Check if the identityStatus is not 'pending'
    if (initialDetail && initialDetail.documentStatus !== "pending") {
      router.back();
    }
  }, [initialDetail, router]);

  const [verifierId, setVerifierId] = useState(sessionData?.email);
  const [Role, setRole] = useState(sessionData?.image);

  const [loading, setLoading] = useState(false);
  const [responseModal, setResponseModal] = useState(null);
  const [response, setResponse] = useState(null);
  const [property, setProperty] = useState(initialDetail);
  const [formData, setFormData] = useState({
    propertyName: initialDetail?.propertyName || "",
    price: initialDetail?.price || "",
    postId: initialDetail?._id || "",
    fullName: initialDetail?.ownerName || "",
    address: initialDetail?.location || "",
    DOB: "",
    Aadhar: "",
    PAN: "",
    verifier: verifierId,
  });

  const [propertyNameError, setPropertyNameError] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [dateError, setDateError] = useState("");
  const [panError, setPanError] = useState("");
  const [aadharError, setAadharError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Additional validation for propertyName
    if (name === "propertyName" && value.length > 30) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setPropertyNameError(
        "Property Name has a maximum limit of 30 characters."
      );

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setPropertyNameError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "address" && value.length > 30) {
      // Truncate the value to 15 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setAddressError("Address has a maximum limit of 30 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setAddressError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "fullName" && value.length > 15) {
      // Truncate the value to 15 characters
      const truncatedValue = value.substring(0, 15);

      // Display an error message
      setOwnerError("Owner Name has a maximum limit of 15 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setOwnerError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "price") {
      const maxLength = 10; // Set your desired max length for weight
      if (value.length > maxLength) {
        // Truncate the value to the max length
        const truncatedValue = value.substring(0, maxLength);

        // Display an error message
        setPriceError(`Price has a maximum limit of ${maxLength} digits.`);

        // Update the state with the truncated value
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: truncatedValue,
        }));

        return; // Stop further processing
      } else {
        // Clear the error message when within the character limit
        setPriceError("");
      }
    }

    if (name === "DOB") {
      // Get the current date
      const currentDate = new Date();

      // Parse the entered date string
      const enteredDate = new Date(value);

      // Check if the entered date is in the future
      if (enteredDate > currentDate) {
        setDateError("Date of birth cannot be in the future.");
        // Display an error message
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: "", // Clear the invalid date
        }));
        return; // Stop further processing
      } else {
        // Clear the error message when the date is valid
        setDateError("");
      }
    }

    if (name === "PAN" && value.length > 10) {
      // Truncate the value to 10 characters
      const truncatedValue = value.substring(0, 10);

      // Display an error message
      setPanError("Invalid PAN Number.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setPanError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "Aadhar" && value.length > 12) {
      // Truncate the value to 10 characters
      const truncatedValue = value.substring(0, 12);

      // Display an error message
      setAadharError("Invalid Aadhar. Please enter a 12-digit Aadhar number.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setAadharError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show loading spinner

    const isIdentityVerifier = Role.includes("Document Verifier");

    if (isIdentityVerifier && verifierId) {
      setLoading(true);
      // Update formDataToSend with the new FormData object
      try {
        // Send the POST request
        const newData = new FormData();
        // Append form data fields
        newData.append("propertyName", formData.propertyName);
        newData.append("price", formData.price);
        newData.append("fullName", formData.fullName);
        newData.append("address", formData.address);
        newData.append("DOB", formData.DOB);
        newData.append("Aadhar", formData.Aadhar);
        newData.append("PAN", formData.PAN);
        newData.append("verifier", formData.verifier);
        newData.append("postId", formData.postId);

        const response = await axios.post(
          // "/api/verifier/realEstate/submitIdentity",
          newData
        );
        // // Handle the response as needed
        console.log(response.data);
        // Handle the response
        setResponse(response.data);
        handleResponse(response.data);
      } catch (error) {
        // Handle errors
        setShowErrorPopup(true);
        console.error("Error submitting data:", error);
      } finally {
        // Hide loading spinner, whether the request was successful or not
        setLoading(false);
      }
    } else {
      console.warn("Role is not defined. Form submission aborted.");
    }
  };

  const handleResponse = (responseData) => {
    const { txhash } = responseData?.data?.WriteStatus;
    const { updatedProduct } = responseData?.data?.updatedProduct;
    // console.log("Data", txhash, updatedProduct);
    // Show modal with transaction details
    setResponseModal({
      txhash,
      updatedProduct,
    });
  };

  const handleView = () => {
    // Route to /trace
    const objectId = response?.data?.updatedProduct;
    // console.log("ObjectId:", objectId);
    // router.push(`/trace/${objectId}`);
    window.open(`/trace/${objectId}`, "_blank");
  };
  const [reason, setReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handledClose = () => {
    setShowErrorPopup(false);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Response", reason);
      const PropertyId = property._id;

      // Make sure to replace 'your-backend-endpoint' with the actual endpoint
      const response = await axios.post(
        //  "/api/verifier/realEstate/rejectIdentity",
        {
          reason,
          PropertyId,
          verifierId,
        }
      );

      // Handle the response as needed
      console.log(response);

      // Optionally, close the form or handle other logic
      setReason("");
      setShowRejectForm(false);
      setLoading(false);
      setRejectModal(true);
      // router.push("/Verifier/Products");
    } catch (error) {
      // Handle error
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    // Route to /products
    router.push("/Verifier/Dashboard");
  };

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex flex-row gap-4 ml-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 mt-1 text-gray-500 cursor-pointer"
              onClick={() => router.back()}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            <h1 className="font-small text-2xl">
              Document Verify Form -
              <span className="font-medium text-2xl text-green-700">
                {" "}
                {property.propertyName}
              </span>
            </h1>
          </div>
          <div className="flex flex-col justify-left px-10">
            <form
              className="w-full bg-white border border-gray-200 rounded-lg shadow p-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data">
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  id="name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  name="propertyName"
                  maxLength={31}
                  value={formData.propertyName}
                  onChange={handleChange}
                />

                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Property Name <span className="text-red-500">*</span>
                </label>
                {propertyNameError && (
                  <p className="text-red-500 text-sm">{propertyNameError}</p>
                )}
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  id="name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  name="address"
                  maxLength={31}
                  value={formData.address}
                  onChange={handleChange}
                />

                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Property Address <span className="text-red-500">*</span>
                </label>
                {addressError && (
                  <p className="text-red-500 text-sm">{addressError}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="fullName"
                    maxLength={16}
                    value={formData.fullName}
                    onChange={handleChange}
                  />

                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Owner Name <span className="text-red-500">*</span>
                  </label>
                  {ownerError && (
                    <p className="text-red-500 text-sm">{ownerError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="price"
                    maxLength={16}
                    value={formData.price}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Property Price <span className="text-red-500">*</span>
                  </label>
                  {priceError && (
                    <p className="text-red-500 text-sm">{priceError}</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="date"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="DOB"
                    // maxLength={11}
                    value={formData.DOB}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  {dateError && (
                    <p className="text-red-500 text-sm">{dateError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="PAN"
                    maxLength={11}
                    value={formData.PAN}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    PAN <span className="text-red-500">*</span>
                  </label>
                  {panError && (
                    <p className="text-red-500 text-sm">{panError}</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="number"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="Aadhar"
                    maxLength={12}
                    value={formData.Aadhar}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Aadhar <span className="text-red-500">*</span>
                  </label>
                  {aadharError && (
                    <p className="text-red-500 text-sm">{aadharError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <p
                  onClick={handleRejectClick}
                  className="text-white cursor-pointer bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                  Reject
                </p>
                <button
                  type="submit"
                  className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                  Approve
                </button>
              </div>
            </form>
          </div>
          {showRejectForm && (
            <div className="flex justify-center mb-10">
              <form
                onSubmit={handleReject}
                className="w-1/2 bg-white border border-gray-200 rounded-lg shadow p-5">
                <div className="relative z-0 w-full mb-6 group">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-sm font-small text-gray-500">
                    Reason
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    required
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 "
                    placeholder="Write your thoughts here..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="text-white bg-gray-500 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                    Reject
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
          )}

          {responseModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="relative p-4 w-1/2 max-h-full">
                <div className="relative bg-white rounded-lg shadow">
                  <div className="p-4  md:p-5 text-center">
                    <svg
                      className="mx-auto mb-4 w-12 h-12 text-green-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m7 10 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <h3 className="mb-5 px-5 text-lg font-normal text-gray-600 ">
                      <p>The Identity has been verified. Transaction Hash:</p>
                      <p
                        className="text-green-500 px-5"
                        style={{ wordBreak: "break-all" }}>
                        {responseModal.txhash}
                      </p>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleView(responseModal.updatedProduct)}
                      className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                      View
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 ">
                      Close
                    </button>
                  </div>
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
                  Unable to write data in blockchain
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handledClose}
                    className="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center ">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {rejectModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="relative p-4 w-1/4 max-h-full">
                <div className="relative bg-white rounded-lg shadow">
                  <div className="p-4  md:p-5 text-center">
                    <svg
                      className="mx-auto mb-4 w-12 h-12 text-red-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m13 7-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>

                    <h3 className="mb-5 px-5 text-lg font-normal text-gray-600 ">
                      This product has been rejected
                    </h3>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center me-2">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </VLayout>
    </div>
  );
};

export default Property;

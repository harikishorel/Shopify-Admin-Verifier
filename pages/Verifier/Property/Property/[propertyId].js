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

const Product = ({ propertyDetails: initialDetail, sessionData }) => {
  const router = useRouter();
  console.log("Property Details", initialDetail);
  useEffect(() => {
    // Check if the propertyStatus is not 'pending'
    if (initialDetail && initialDetail.propertyStatus !== "pending") {
      router.back();
    }
  }, [initialDetail, router]);

  const [verifierId, setVerifierId] = useState(sessionData?.email);
  const [Role, setRole] = useState(sessionData?.image);
  console.log("Role", Role);
  const [initialProduct, setInitialProduct] = useState(initialDetail);
  const [property, setProperty] = useState(initialDetail);
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [responseModal, setResponseModal] = useState(null);
  const [response, setResponse] = useState(null);

  const [fileFront, setFileFront] = useState(null);
  const [fileBack, setFileBack] = useState(null);
  const [fileLocality, setFileLocality] = useState(null);
  const [fileSide, setFileSide] = useState(null);

  const handleFileChange = (e, setterFunction) => {
    setterFunction(e.target.files[0]);
  };

  const [proTypeError, setProTypeErrorError] = useState("");
  const [descriptionError, setDescriptionErrorError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [filesError, setFilesError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const [formData, setFormData] = useState({
    propertyType: initialDetail?.propertyType || "",
    address: initialDetail?.location || "",
    postId: initialDetail?._id || "",
    verifier: verifierId,
    description: "",
  });

  const validateFiles = () => {
    if (!fileFront || !fileBack || !fileLocality || !fileSide) {
      setFilesError("Upload all the files");
    } else {
      setFilesError("");
    }
  };

  useEffect(() => {
    validateFiles();
  }, [fileFront, fileBack, fileLocality, fileSide]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Additional validation for propertyType
    if (name === "propertyType" && value.length > 20) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 20);

      // Display an error message
      setProTypeErrorError(
        "Property Type has a maximum limit of 20 characters."
      );

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setProTypeErrorError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    // Additional validation for description
    if (name === "description" && value.length > 25) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 25);

      // Display an error message
      setDescriptionErrorError(
        "Property Description has a maximum limit of 25 characters."
      );

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setDescriptionErrorError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "address" && value.length > 25) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 25);

      // Display an error message
      setAddressError("Property Address has a maximum limit of 25 characters.");

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show loading spinner

    const isIdentityVerifier = Role.includes("Property Verifier");

    if (isIdentityVerifier && verifierId) {
      setLoading(true);
      // Update formDataToSend with the new FormData object
      try {
        // Send the POST request
        const newData = new FormData();
        // Append form data fields
        newData.append("propertyType", formData.propertyType);
        newData.append("address", formData.address);
        newData.append("description", formData.description);
        newData.append("postId", formData.postId);
        newData.append("verifier", formData.verifier);

        // Append the file
        newData.append("fileFront", fileFront);
        newData.append("fileBack", fileBack);
        newData.append("fileLocality", fileLocality);
        newData.append("fileSide", fileSide);

        const response = await axios.post(
          "/api/verifier/realEstate/submitProperty",
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
  // console.log("Data:", response?.data?.updatedProduct);

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
    window.open(`/trace/${objectId}`, "_blank");
  };

  const handleClose = () => {
    // Route to /products
    router.push("/Verifier/Dashboard");
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
        "/api/verifier/realEstate/rejectProperty",
        {
          reason,
          PropertyId,
          verifierId,
        }
      );

      // // Handle the response as needed
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
              Property Verify Form -{" "}
              <span className="font-medium text-2xl text-green-700">
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
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  name="propertyType"
                  maxLength={21}
                  value={formData.propertyType}
                  onChange={handleChange}
                />

                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Property Type <span className="text-red-500">*</span>
                </label>
                {proTypeError && (
                  <p className="text-red-500 text-sm">{proTypeError}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="description"
                    maxLength={26}
                    value={formData.description}
                    onChange={handleChange}
                  />

                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Building Description <span className="text-red-500">*</span>
                  </label>
                  {descriptionError && (
                    <p className="text-red-500 text-sm">{descriptionError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="address"
                    maxLength={26}
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
              </div>

              <div>
                <div className="flex flex-col">
                  <label
                    htmlFor="dropzone-file-front"
                    className="text-sm font-sm font-medium text-gray-600">
                    Photo Proofs
                    <span className="text-red-500">*</span>{" "}
                    {filesError && (
                      <span className="text-red-500 text-sm font-semibold">
                        {filesError}
                      </span>
                    )}
                  </label>
                </div>
                <div className="flex lg:flex-row flex-col gap-4 ">
                  <div className="w-full sm:w-1/2 mb-5">
                    <label
                      htmlFor="dropzone-file-front"
                      className="text-sm font-sm text-gray-500">
                      Property Front photo{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <label
                      htmlFor="dropzone-file-front"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {fileFront ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <img
                            src={URL.createObjectURL(fileFront)}
                            alt="File Preview"
                            className="w-full h-1/3 mb-2"
                          />
                          <p className="mb-2 text-sm font-semibold">
                            {fileFront.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {`File type: ${fileFront.type}`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"></svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">or</p>
                          <p className="mb-2 text-sm text-gray-50">
                            drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF
                          </p>
                          <p className="text-xs text-gray-500">
                            (MAX. 800x400px)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file-front"
                        type="file"
                        name="file"
                        accept=".jpg, .jpeg, .png"
                        className="absolute w-0 h-0 overflow-hidden"
                        required
                        onChange={(e) => handleFileChange(e, setFileFront)}
                      />
                    </label>
                  </div>
                  <div className="w-full sm:w-1/2 mb-5">
                    <label
                      htmlFor="dropzone-file-back"
                      className="text-sm font-sm text-gray-500">
                      Property Back photo{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <label
                      htmlFor="dropzone-file-back"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {fileBack ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <img
                            src={URL.createObjectURL(fileBack)}
                            alt="File Preview"
                            className="w-full h-1/3 mb-2"
                          />
                          <p className="mb-2 text-sm font-semibold">
                            {fileBack.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {`File type: ${fileBack.type}`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"></svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">or</p>
                          <p className="mb-2 text-sm text-gray-50">
                            drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF
                          </p>
                          <p className="text-xs text-gray-500">
                            (MAX. 800x400px)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file-back"
                        type="file"
                        name="file"
                        accept=".jpg, .jpeg, .png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setFileBack)}
                      />
                    </label>
                  </div>
                  <div className="w-full sm:w-1/2 mb-5">
                    <label
                      htmlFor="dropzone-file-l"
                      className="text-sm font-sm text-gray-500">
                      Property Locality photo
                      <span className="text-red-500">*</span>
                    </label>

                    <label
                      htmlFor="dropzone-file-l"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {fileLocality ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <img
                            src={URL.createObjectURL(fileLocality)}
                            alt="File Preview"
                            className="w-full h-1/3 mb-2"
                          />
                          <p className="mb-2 text-sm font-semibold">
                            {fileLocality.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {`File type: ${fileLocality.type}`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"></svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">or</p>
                          <p className="mb-2 text-sm text-gray-50">
                            drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF
                          </p>
                          <p className="text-xs text-gray-500">
                            (MAX. 800x400px)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file-l"
                        type="file"
                        name="file"
                        accept=".jpg, .jpeg, .png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setFileLocality)}
                      />
                    </label>
                  </div>
                  <div className="w-full sm:w-1/2 mb-5">
                    <label
                      htmlFor="dropzone-file-side"
                      className="text-sm font-sm text-gray-500">
                      Property Side photo{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <label
                      htmlFor="dropzone-file-side"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {fileSide ? (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <img
                            src={URL.createObjectURL(fileSide)}
                            alt="File Preview"
                            className="w-full h-1/3 mb-2"
                          />
                          <p className="mb-2 text-sm font-semibold">
                            {fileSide.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {`File type: ${fileSide.type}`}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"></svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">or</p>
                          <p className="mb-2 text-sm text-gray-50">
                            drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF
                          </p>
                          <p className="text-xs text-gray-500">
                            (MAX. 800x400px)
                          </p>
                        </div>
                      )}
                      <input
                        id="dropzone-file-side"
                        type="file"
                        name="file"
                        accept=".jpg, .jpeg, .png"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setFileSide)}
                      />
                    </label>
                  </div>
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
                      <p>This property has been verified. Transaction Hash:</p>
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
                      This property has been rejected
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

export default Product;

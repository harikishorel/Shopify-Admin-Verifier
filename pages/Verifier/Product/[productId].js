import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import VLayout from "@/components/Dashboard/layout/VLayout";
import { getSession, useSession } from "next-auth/react";

export async function getServerSideProps(context) {
  const { productId } = context.query;
  const URL = process.env.URL;
  // Get the session data
  const session = await getSession(context);

  try {
    const response = await axios.get(
      `${URL}/api/verifier/getProductDetails?id=${productId}`
    );

    return {
      props: {
        productDetails: response.data,
        sessionData: session ? session.user : null,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        productDetails: null,
      },
    };
  }
}

const Product = ({ productDetails: initialDetail, sessionData }) => {
  const [initialProduct, setInitialProduct] = useState(initialDetail);
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [responseModal, setResponseModal] = useState(null);
  const [response, setResponse] = useState(null);
  const [verifierId, setVerifierId] = useState(sessionData?.email);
  const [Role, setRole] = useState(sessionData?.image);

  const router = useRouter();

  useEffect(() => {
    // Check if the verificationStatus is 'verified'
    if (initialProduct && initialProduct.verificationStatus === "verified") {
      // Redirect to /Verifier/Products
      router.push("/Verifier/Products");
    }
  }, [initialProduct, router]);

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // const handleFileUpload = async () => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const response = await axios.post("/api/upload", formData);
  //     // Handle successful file upload
  //     console.log(response);
  //   } catch (error) {
  //     console.log(error);
  //     // Handle error
  //   }
  // };

  // const handleFileChange = (e) => {
  //   // Update the file property in formData with the selected file
  //   setFormData({ ...formData, file: e.target.files[0] });
  // };

  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;

  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: files ? files[0] : value,
  //   }));
  // };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  const [productNameError, setProductNameError] = useState("");
  const [fabricError, setFabricError] = useState("");
  const [zariError, setZariError] = useState("");
  const [sareeColourError, setSareeColourError] = useState("");
  const [borderColourError, setBorderColourError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [lengthError, setLengthError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Additional validation for productName
    if (name === "productName" && value.length > 30) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setProductNameError("Product Name has a maximum limit of 30 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setProductNameError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    // Additional validation for fabric
    if (name === "fabric" && value.length > 15) {
      // Truncate the value to 15 characters
      const truncatedValue = value.substring(0, 15);

      // Display an error message
      setFabricError("Fabric Type has a maximum limit of 15 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setFabricError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    // Additional validation for sareeColour
    if (name === "sareeColour" && value.length > 10) {
      // Truncate the value to 10 characters
      const truncatedValue = value.substring(0, 10);

      // Display an error message
      setSareeColourError("Saree Color has a maximum limit of 10 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setSareeColourError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    // Additional validation for borderColour
    if (name === "borderColour" && value.length > 10) {
      // Truncate the value to 10 characters
      const truncatedValue = value.substring(0, 10);

      // Display an error message
      setBorderColourError(
        "Border Color has a maximum limit of 10 characters."
      );

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setBorderColourError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    // Additional validation for weight
    if (name === "weight") {
      const maxLength = 5; // Set your desired max length for weight
      if (value.length > maxLength) {
        // Truncate the value to the max length
        const truncatedValue = value.substring(0, maxLength);

        // Display an error message
        setWeightError(`Weight has a maximum limit of ${maxLength} digits.`);

        // Update the state with the truncated value
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: truncatedValue,
        }));

        return; // Stop further processing
      } else {
        // Clear the error message when within the character limit
        setWeightError("");
      }
    }

    // Additional validation for length
    if (name === "length") {
      const maxLength = 5; // Set your desired max length for length
      if (value.length > maxLength) {
        // Truncate the value to the max length
        const truncatedValue = value.substring(0, maxLength);

        // Display an error message
        setLengthError(`Length has a maximum limit of ${maxLength} digits.`);

        // Update the state with the truncated value
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: truncatedValue,
        }));

        return; // Stop further processing
      } else {
        // Clear the error message when within the character limit
        setLengthError("");
      }
    }

    // Additional validation for zari
    if (name === "zari" && value.length > 15) {
      // Truncate the value to 15 characters
      const truncatedValue = value.substring(0, 15);

      // Display an error message
      setZariError("Zari Type has a maximum limit of 15 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setZariError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    // Repeat similar validation logic for other fields
    // ...
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  const [formData, setFormData] = useState({
    productName: initialProduct?.productName || "",
    sareeColour: initialProduct?.sareeColour || "",
    borderColour: initialProduct?.borderColour || "",
    fabric: initialProduct?.fabric || "",
    zari: initialProduct?.zari || "",
    postId: initialProduct?._id || "",
    length: "",
    weight: "",
    verifier: verifierId,
    zariTest: null, // Initialize with null
  });

  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      zariTest: e.target.value === "pass" ? true : false,
    });
    console.log("ZariTest", formData.zariTest);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show loading spinner
    if (Role === "verifier" && verifierId) {
      setLoading(true);
      // Update formDataToSend with the new FormData object
      try {
        // Send the POST request
        const newData = new FormData();
        // Append form data fields
        newData.append("productName", formData.productName);
        newData.append("sareeColour", formData.sareeColour);
        newData.append("borderColour", formData.borderColour);
        newData.append("fabric", formData.fabric);
        newData.append("zari", formData.zari);
        newData.append("length", formData.length);
        newData.append("weight", formData.weight);
        newData.append("postId", formData.postId);
        newData.append("verifier", formData.verifier);

        // Append the file
        newData.append("file", file);

        newData.append("zariTest", formData.zariTest.toString()); // Convert to string

        const response = await axios.post("/api/verifier/submitData", newData);
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
    // console.log("ObjectId:", objectId);
    // router.push(`/trace/${objectId}`);
    window.open(`/trace/${objectId}`, "_blank");
  };

  const handleClose = () => {
    // Route to /products
    router.push("/Verifier/Products");
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
      const ProductId = product._id;

      // Make sure to replace 'your-backend-endpoint' with the actual endpoint
      const response = await axios.post("/api/verifier/rejectProd", {
        reason,
        ProductId,
        verifierId,
      });

      // // Handle the response as needed
      console.log(response);

      console.log("Response", reason);
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
              Verify Saree -
              <span className="font-medium text-2xl text-green-700">
                {" "}
                {product.productName}
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
                  name="productName"
                  maxLength={31}
                  value={formData.productName}
                  onChange={handleChange}
                />

                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Saree Name <span className="text-red-500">*</span>
                </label>
                {productNameError && (
                  <p className="text-red-500 text-sm">{productNameError}</p>
                )}
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="fabric"
                    maxLength={16}
                    value={formData.fabric}
                    onChange={handleChange}
                  />

                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Fabric Type <span className="text-red-500">*</span>
                  </label>
                  {fabricError && (
                    <p className="text-red-500 text-sm">{fabricError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="zari"
                    maxLength={16}
                    value={formData.zari}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Zari Type <span className="text-red-500">*</span>
                  </label>
                  {zariError && (
                    <p className="text-red-500 text-sm">{zariError}</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="sareeColour"
                    maxLength={11}
                    value={formData.sareeColour}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Saree Color <span className="text-red-500">*</span>
                  </label>
                  {sareeColourError && (
                    <p className="text-red-500 text-sm">{sareeColourError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="borderColour"
                    maxLength={11}
                    value={formData.borderColour}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Border Color <span className="text-red-500">*</span>
                  </label>
                  {borderColourError && (
                    <p className="text-red-500 text-sm">{borderColourError}</p>
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
                    name="weight"
                    maxLength={6}
                    value={formData.weight}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Weight (Kg) <span className="text-red-500">*</span>
                  </label>
                  {weightError && (
                    <p className="text-red-500 text-sm">{weightError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="number"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="length"
                    maxLength={6}
                    value={formData.length}
                    onChange={handleChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Length (Inches) <span className="text-red-500">*</span>
                  </label>
                  {lengthError && (
                    <p className="text-red-500 text-sm">{lengthError}</p>
                  )}
                </div>
              </div>
              {/* <div>
                <div className="relative z-0 w-full mb-6 group">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="zariTestCheckbox"
                      name="zariTest"
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      checked={formData.zariTest}
                      onChange={handleCheckboxChange}
                      required
                    />
                    <label
                      htmlFor="zariTestCheckbox"
                      className="ms-2 text-sm font-medium text-gray-700 ">
                      Zari Test <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div> */}
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Zari Test
                </label>
                <div className="ml-4">
                  <input
                    type="radio"
                    id="passRadio"
                    name="zariTest"
                    value="pass"
                    checked={formData.zariTest === true}
                    onChange={handleRadioChange}
                    required
                  />
                  <label
                    htmlFor="passRadio"
                    className="ml-2 text-sm font-medium text-green-600">
                    Pass
                  </label>
                </div>
                <div className="ml-4">
                  <input
                    type="radio"
                    id="failRadio"
                    name="zariTest"
                    value="fail"
                    checked={formData.zariTest === false}
                    onChange={handleRadioChange}
                    required
                  />
                  <label
                    htmlFor="failRadio"
                    className="ml-2 text-sm font-medium text-red-600">
                    Fail
                  </label>
                </div>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <label
                  className="block mb-2 text-sm font-medium text-gray-700"
                  htmlFor="file_input">
                  Upload file <span className="text-red-500">*</span>
                </label>
                <input
                  className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  type="file"
                  id="file"
                  name="file"
                  accept=".jpg, .jpeg, .png"
                  required
                  // onChange={handleChange}
                  onChange={handleFileChange}
                />
                <p className="mt-1 text-sm text-gray-500" id="file_input_help">
                  PNG, JPG or JPEG
                </p>
              </div>
              {/* <div className="grid md:grid-cols-2 md:gap-6">
                <div className="mb-6">
                  <label
                    htmlFor="dropzone-file"
                    className="font-medium text-sm text-gray-500 mb-2">
                    Your Image File <span className="text-red-500">*</span>
                  </label>
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100 ">
                    {file ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="File Preview"
                          className="w-full h-1/3 mb-2"
                        />
                        <p className="mb-2 text-sm font-semibold">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 ">
                          {`File type: ${file.type}`}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 "
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"></svg>
                        <p className="text-sm text-gray-500 ">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-sm text-gray-500 ">or</p>

                        <p className="text-xs text-gray-500 ">SVG, PNG, JPG</p>
                        <p className="text-xs text-gray-500 ">
                          (MAX. 800x400px)
                        </p>
                      </div>
                    )}
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      name="file"
                      required
                      accept=".jpg, .jpeg, .png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div> */}
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
          {/* <div>
            <input
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={handleFileChange}
            />

            <button onClick={handleFileUpload}>Upload</button>
          </div> */}
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
          {/* Loading spinner */}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
          )}

          {/* Response modal */}
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
                      <p>This product has been verified. Transaction Hash:</p>
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

export default Product;

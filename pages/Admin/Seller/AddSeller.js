import Layout from "@/components/Dashboard/layout/layout";
import React, { useState } from "react";
import axios from "axios";

const AddSeller = () => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [EmailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [addError, setaddError] = useState("");
  const [shopError, setshopError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [productNameError, setProductNameError] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const handleSuccessPopup = (show, alertMsg, emailMsg) => {
    setShowSuccessPopup(show);
    setAlertMessage(alertMsg);
    setEmailMessage(emailMsg);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  // Step 2: Create a validation function
  const validateForm = () => {
    const newErrors = {};

    // Example validation rules (customize as needed)
    if (!formData.name.trim()) {
      newErrors.name = "Seller Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    // Validate phone number (10 digits)
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number (must be 10 digits)";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop Name is required";
    }

    setErrors(newErrors);

    // Return true if there are no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  // Step 4: Update state on form field changes

  // const handleInputChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Additional validation for productName
    if (name === "name" && value.length > 30) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setProductNameError("Seller Name has a maximum limit of 30 characters.");

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
    if (name === "address" && value.length > 50) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 50);

      // Display an error message
      setaddError("Address has a maximum limit of 30 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setaddError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "shopName" && value.length > 30) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setshopError("Shop Name has a maximum limit of 30 characters.");

      // Update the state with the truncated value
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: truncatedValue,
      }));
    } else {
      // Clear the error message when within the character limit
      setshopError("");

      // For other fields or when within the character limit, update the state as usual
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }

    if (name === "email") {
      // Regular expression for basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!value.trim()) {
        setEmailError("Email is required");
      } else if (!emailRegex.test(value)) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }
    if (name === "password") {
      // Password validation criteria
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

      if (!value.trim()) {
        setPassError("Password is required");
      } else if (!passwordRegex.test(value)) {
        setPassError(
          "Password must be at least 8 characters with 1 special character and 1 number"
        );
      } else {
        setPassError("");
      }
    }
    if (name === "phone") {
      // Phone number validation criteria
      const phoneRegex = /^\d{10}$/;

      if (!value.trim()) {
        setPhoneError("Phone number is required");
      } else if (!phoneRegex.test(value)) {
        setPhoneError("Invalid phone number format. Please enter 10 digits");
      } else {
        setPhoneError("");
      }
    }
  };

  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Step 2: Create a FormData object and append the file
    const newformData = new FormData();
    newformData.append("file", file);

    // Step 3: Append the rest of the form data
    newformData.append("name", formData.name);
    newformData.append("email", formData.email);
    newformData.append("password", formData.password);
    newformData.append("phone", formData.phone);
    newformData.append("shopName", formData.shopName);
    newformData.append("address", formData.address);

    // Step 4: Trigger validation before submitting
    if (validateForm()) {
      try {
        // Step 5: Send the form data to the backend
        const response = await axios.post(
          "/api/admin/verifier/addSell",
          newformData
        );
        console.log(response.data);
        setLoading(false);

        if (response.status === 201) {
          setFormData({
            name: "",
            email: "",
            password: "",
            phone: "",
            shopName: "",
            address: "",
          });

          let alertMessage = "Seller Added successfully";
          let emailMessage = "Unable to send email to the seller";

          try {
            // Step 6: Send another request to handle email sending
            const secondApiResponse = await axios.post(
              "/api/email/SendSeller",
              formData
            );
            console.log(secondApiResponse.data);
            if (secondApiResponse.status === 200) {
              alertMessage = "Seller Added successfully";
              emailMessage = "Email sent successfully to the seller";
            }
          } catch (emailError) {
            console.error(
              "Error sending email to the seller:",
              emailError.message
            );
          }

          // Step 7: Handle success popup
          handleSuccessPopup(true, alertMessage, emailMessage);
        }
      } catch (error) {
        // Step 8: Handle error and show error popup
        setLoading(false);
        setShowErrorPopup(true);
        console.error("Error adding seller:", error.message);
      }
    } else {
      // Step 9: Validation failed, do something (optional)
      console.log("Validation failed");
    }
  };

  const handleClose = () => {
    setShowErrorPopup(false);
  };

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6">Add Seller</h1>
            </div>
          </div>

          <div className="flex justify-left px-10">
            <form
              className="w-full bg-white border border-gray-200 rounded-lg shadow p-5"
              onSubmit={handleSubmit}
              encType="multipart/form-data">
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="name"
                  id="floating_first_name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  maxLength={31}
                  onChange={handleInputChange}
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Seller Name
                </label>
                {productNameError && (
                  <p className="text-red-500 text-sm">{productNameError}</p>
                )}
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="email"
                  name="email"
                  id="floating_email"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  onChange={handleInputChange}
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Email address
                </label>
                {EmailError && (
                  <p className="text-red-500 text-sm">{EmailError}</p>
                )}
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="password"
                  name="password"
                  id="floating_password"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  onChange={handleInputChange}
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Password
                </label>
                {passError && (
                  <p className="text-red-500 text-sm">{passError}</p>
                )}
              </div>

              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="address"
                  id="floating_last_name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  maxLength={51}
                  onChange={handleInputChange}
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Address
                </label>
                {addError && <p className="text-red-500 text-sm">{addError}</p>}
              </div>

              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="tel"
                    name="phone"
                    id="floating_phone"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    maxLength={11}
                    onChange={handleInputChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Phone number
                  </label>
                  {phoneError && (
                    <p className="text-red-500 text-sm">{phoneError}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    name="shopName"
                    id="floating_company"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    maxLength={31}
                    onChange={handleInputChange}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Shop Name
                  </label>
                  {shopError && (
                    <p className="text-red-500 text-sm">{shopError}</p>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-1/2 mb-5">
                <label
                  htmlFor="dropzone-file"
                  className="text-sm font-sm text-gray-500">
                  Id Proof <span className="text-red-500">*</span>
                </label>

                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {file ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="File Preview"
                        className="w-full h-1/3 mb-2"
                      />
                      <p className="mb-2 text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {`File type: ${file.type}`}
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
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-sm text-gray-500">or</p>
                      <p className="mb-2 text-sm text-gray-50">drag and drop</p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG or GIF
                      </p>
                      <p className="text-xs text-gray-500">(MAX. 800x400px)</p>
                    </div>
                  )}
                  <input
                    id="dropzone-file"
                    type="file"
                    name="file"
                    accept=".jpg, .jpeg, .png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className=" text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                  Add Seller
                </button>
              </div>
            </form>

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
                    Unable to add the Seller details
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

                      <h3 className="text-lg font-medium ml-1">
                        {alertMessage}
                      </h3>
                    </div>
                    <div className="mt-2 mb-4 text-sm">{emailMessage} </div>
                    <div className="flex">
                      <a href="/Admin/Seller">
                        <button
                          type="button"
                          className="text-white bg-green-800 hover:bg-green-900 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center ">
                          {/* <svg
                            className="me-2 h-3 w-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 14">
                            <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                          </svg> */}
                          Home
                        </button>
                      </a>
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

            {loading && (
              <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex-col gap-4 w-full flex items-center justify-center">
                    <div className="w-20 h-20 border-8 text-gray-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default AddSeller;

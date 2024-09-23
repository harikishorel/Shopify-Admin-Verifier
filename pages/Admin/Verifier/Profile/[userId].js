import Layout from "@/components/Dashboard/layout/layout";
import React, { useState } from "react";
import axios from "axios";

export async function getServerSideProps({ query }) {
  const URL = process.env.URL;
  const verifierId = query.userId;
  try {
    // Fetch data from the server
    const response = await axios.get(
      `${URL}/api/admin/verifier/getVerifierProfile?id=${verifierId}`,
      {
        params: {
          searchTerm: query.searchTerm || "",
          currentPage: query.currentPage || "1",
        },
      }
    );

    return {
      props: {
        verifier: response.data,
        initialSearchTerm: query.searchTermInput || "",
        currentPage: parseInt(query.currentPage) || 1, // Parse currentPage to ensure it's a number
      },
    };
  } catch (error) {
    console.error("Error fetching verifiers:", error);
    return {
      props: {
        verifier: [],
        initialSearchTerm: "",
        currentPage: 1,
      },
    };
  }
}

const AddVerifier = ({ verifier: initialVerifiers }) => {
  const [verifier, setVerifier] = useState(initialVerifiers);
  const [editing, setEditing] = useState(false);
  const [alerts, setAlerts] = useState([]);
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
    name: verifier.name || "",
    email: verifier.email || "",
    password: verifier.password || "",
    address: verifier.address || "",
    phone: verifier.phone || "",
    idProof: verifier.idProof || "",
    verifiertype: verifier.verifiertype || "",
    proofimg: verifier.proofimg || "",
  });

  const [file, setFile] = useState(null);
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Additional validation for productName
    if (name === "name" && value.length > 30) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 30);

      // Display an error message
      setProductNameError(
        "Verifier Name has a maximum limit of 30 characters."
      );

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

    if (name === "idProof" && value.length > 10) {
      // Truncate the value to 30 characters
      const truncatedValue = value.substring(0, 10);

      // Display an error message
      setshopError("Enter valid 10 digit pan number.");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );
    if (checkboxes.length === 0) {
      // If no checkbox is selected, show an error message or handle it accordingly
      alert("Please select at least one verifier type");
      return;
    }

    setLoading(true);

    // Step 2: Create a FormData object and append the file
    const newformData = new FormData();
    newformData.append("file", file);
    // Step 3: Append the rest of the form data
    newformData.append("id", verifier._id);
    newformData.append("name", formData.name);
    newformData.append("email", formData.email);
    newformData.append("password", formData.password);
    newformData.append("phone", formData.phone);
    newformData.append("idProof", formData.idProof);
    newformData.append("address", formData.address);
    newformData.append("proofimg", formData.proofimg);
    newformData.append("verifiertype", formData.verifiertype);

    try {
      // Perform your API call to update the verifier with formData
      const response = await axios.put(
        "/api/admin/verifier/updateVerifierProfile",
        newformData
      );
      // Show a success alert
      setAlerts([
        {
          type: "success",
          message: "Profile updated successfully!",
        },
        ...alerts,
      ]);

      // You may want to handle the response here if necessary
      console.log("API Response:", response.data);
    } catch (error) {
      // Handle errors, e.g., show an error alert
      setAlerts([
        {
          type: "danger",
          message: "Error updating profile. Please try again.",
        },
        ...alerts,
      ]);

      // Handle errors if the API call fails
      console.error("API Error:", error.message);
      // You might want to set an error state or display an error message to the user
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  const handleEditBank = () => {
    setEditing(true);
    // Initialize form data with verifier values
  };

  const handleCancelBank = () => {
    setEditing(false);
    // Reset the form data to the original values from verifier
    setFormData({
      name: verifier.name || "NA",
      email: verifier.email || "NA",
      password: verifier.password || "NA",
      address: verifier.address || "NA",
      phone: verifier.phone || "NA",
      idProof: verifier.idProof || "", // Assuming idProof is part of verifier
      proofimg: verifier.proofimg || "", // Assuming proofimg is part of verifier
      verifiertype: verifier.verifiertype || "",
      proofimg: verifier.proofimg || "",
    });
  };

  const handleProfileSubmit = async (e) => {
    if (
      productNameError ||
      EmailError ||
      passError ||
      addError ||
      phoneError ||
      shopError
    ) {
      // Display a general error message or handle the error appropriately
      console.error("Form has errors. Please fix them before submitting.");
      return;
    }
    e.preventDefault();
    setLoading(true);

    if (editing) {
      try {
        const dataToSend = { ...formData, _id: verifier._id };
        // Perform your API call to update the verifier with formData
        const response = await axios.put(
          "/api/admin/verifier/updateVerifierProfile",
          dataToSend
        );

        // After successful update, exit edit mode or handle the response as needed
        setEditing(false);
        setLoading(false);
        // Show a success alert
        setAlerts([
          {
            type: "success",
            message: " Details updated successfully!",
          },
          ...alerts,
        ]);
        // You may want to handle the response here if necessary
        console.log("API Response:", response.data);
      } catch (error) {
        setLoading(false);
        // Handle errors, e.g., show an error alert
        setAlerts([
          {
            type: "danger",
            message: "Error updating details. Please try again.",
          },
          ...alerts,
        ]);
        // Handle errors if the API call fails
        console.error("API Error:", error.message);
        // You might want to set an error state or display an error message to the user
      }
    }
    setEditing(!editing);
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        verifiertype: [...prevFormData.verifiertype, value],
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        verifiertype: prevFormData.verifiertype.filter(
          (type) => type !== value
        ),
      }));
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
              <h1 className="font-medium text-2xl ml-6">Edit Verifier</h1>
            </div>
          </div>

          <div className="flex justify-left px-10 mb-2">
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="w-full bg-white border border-gray-200 rounded-lg shadow p-5">
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  name="name"
                  id="floating_first_name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  value={formData.name}
                  required
                  maxLength={31}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Verifier Name
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
                  value={formData.email}
                  required
                  onChange={handleInputChange}
                  disabled={!editing}
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
                  value={formData.password}
                  required
                  onChange={handleInputChange}
                  disabled={!editing}
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
                  value={formData.address}
                  required
                  maxLength={51}
                  onChange={handleInputChange}
                  disabled={!editing}
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
                    value={formData.phone}
                    required
                    maxLength={11}
                    onChange={handleInputChange}
                    disabled={!editing}
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
                    name="idProof"
                    id="floating_company"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    maxLength={11}
                    value={formData.idProof}
                    onChange={handleInputChange}
                    disabled={!editing}
                  />
                  <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                    Id Proof
                  </label>
                  {shopError && (
                    <p className="text-red-500 text-sm">{shopError}</p>
                  )}
                </div>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <>
                  <h3 className="mb-4 font-medium text-sm text-gray-500">
                    Verifier Type
                  </h3>
                  <ul className="items-center w-full text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:flex">
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r ">
                      <div className="flex items-center ps-3">
                        <input
                          id="Identity Verifier"
                          type="checkbox"
                          name="verifier type"
                          value="Identity Verifier"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.verifiertype.includes(
                            "Identity Verifier"
                          )}
                          disabled={!editing}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          htmlFor="vue-checkbox-list"
                          className="w-full py-3 ms-2 text-sm font-medium text-gray-700 ">
                          Identity Verifier
                        </label>
                      </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r ">
                      <div className="flex items-center ps-3">
                        <input
                          id="Property Verifier"
                          type="checkbox"
                          name="verifier type"
                          value="Property Verifier"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 "
                          checked={formData.verifiertype.includes(
                            "Property Verifier"
                          )}
                          disabled={!editing}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          htmlFor="react-checkbox-list"
                          className="w-full py-3 ms-2 text-sm font-medium text-gray-700">
                          Property Verifier
                        </label>
                      </div>
                    </li>
                    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
                      <div className="flex items-center ps-3">
                        <input
                          id="Document Verifier"
                          type="checkbox"
                          name="verifier type"
                          value="Document Verifier"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.verifiertype.includes(
                            "Document Verifier"
                          )}
                          disabled={!editing}
                          onChange={handleCheckboxChange}
                        />
                        <label
                          htmlFor="angular-checkbox-list"
                          className="w-full py-3 ms-2 text-sm font-medium text-gray-700 ">
                          Document Verifier
                        </label>
                      </div>
                    </li>
                  </ul>
                </>
              </div>

              <div className="w-full sm:w-1/2 mb-5">
                <label
                  htmlFor="dropzone-file"
                  className="text-sm font-sm text-gray-500">
                  Id Proof Image <span className="text-red-500">*</span>
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
                      {formData.proofimg && ( // Check if proofimg exists
                        <img
                          src={formData.proofimg} // Display the proofimg URL
                          alt="Proof Image"
                          className="w-full h-1/3 mb-2"
                        />
                      )}
                    </div>
                  )}
                  <input
                    id="dropzone-file"
                    type="file"
                    name="file"
                    accept=".jpg, .jpeg, .png"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!editing}
                  />
                </label>
              </div>

              <div className="flex justify-center gap-4">
                {editing ? (
                  <>
                    <p
                      onClick={handleCancelBank}
                      className="text-white cursor-pointer bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                      Cancel
                    </p>
                    <button
                      type="submit"
                      className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditBank}
                    className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                    Edit Verifier
                  </button>
                )}
              </div>
            </form>
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
                    <div className="ms-3 text-sm font-medium">
                      {alert.message}
                    </div>
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
            ))}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default AddVerifier;

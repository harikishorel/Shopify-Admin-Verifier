import React, { useState } from "react";
import VLayout from "@/components/Dashboard/layout/VLayout";
import { getSession } from "next-auth/react";
import axios from "axios";

export async function getServerSideProps(context) {
  const URL = process.env.URL;

  try {
    const session = await getSession(context);
    console.log("VerifierID", session?.user?.email);
    const VerifierID = session?.user?.email;
    const response = await axios.get(
      `${URL}/api/verifier/getProfile?id=${VerifierID}`
    );

    return {
      props: {
        Profile: response.data,
        // CustomerProfile: session ? VerifierID : null,
      },
    };
  } catch (error) {
    console.error("Error fetching verifier:", error);
    return {
      props: {
        Profile: null,
      },
    };
  }
}

const Profile = ({ Profile }) => {
  console.log("Role", Profile._id);
  console.log("User", Profile);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState({
    accountHolderName: "",
    accountNumber: "",
    upi: "",
    ifscCode: "",
  });
  const [formData, setFormData] = useState({
    Name: Profile.name || "",
    email: Profile.email || "",
    phone: Profile.phone || "",
    password: Profile.password || "", // You may want to handle password separately based on your requirements
    address: Profile.address || "",
    idProof: Profile.idProof || "",
    upi: Profile.upi || "NA",
  });

  const [bankFormData, setBankFormData] = useState({
    upi: Profile.upi || "NA",
    accountNumber: Profile.accountNumber || "NA",
    ifscCode: Profile.ifscCode || "NA",
    accountHolderName: Profile.accountHolderName || "NA", // You may want to handle password separately based on your requirements
  });
  const [editBank, setEditBank] = useState(false);

  const validateAccountHolderName = (name) => {
    // Basic validation for account holder name
    const trimmedName = name.trim();
    const isNonEmpty = trimmedName.length > 0;
    const isWithinMaxLength = trimmedName.length < 30;

    return {
      isNonEmpty,
      isWithinMaxLength,
    };
  };

  const validateAccountNumber = (accountNumber) => {
    // Basic validation for account number (assuming a simple format)
    const accountNumberRegex = /^\d{6,}$/; // Adjust the regex as per your requirements
    return accountNumberRegex.test(accountNumber);
  };

  const validateUPI = (upi) => {
    // Regular expression for UPI validation
    const upiRegex = /^[0-9A-Za-z.-]{2,256}@[A-Za-z]{2,64}$/;

    // Basic validation for UPI (assuming a simple format)
    return upi.trim().length > 0 && upiRegex.test(upi);
  };

  const validateIFSCCode = (ifscCode) => {
    // Basic validation for IFSC code (assuming a simple format)
    const ifscCodeRegex = /^[A-Za-z]{4}\d{7}$/; // Adjust the regex as per your requirements
    return ifscCodeRegex.test(ifscCode);
  };

  const handleInputChangeBank = (e) => {
    const { name, value } = e.target;

    // Validate bank details as the user types
    switch (name) {
      case "accountHolderName":
        const { isNonEmpty, isWithinMaxLength } =
          validateAccountHolderName(value);

        if (!isNonEmpty) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            accountHolderName: "Invalid account holder",
          }));
        } else if (!isWithinMaxLength) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            accountHolderName: "Maximum Charecters Reached",
          }));
        } else {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            accountHolderName: "",
          }));
        }
        break;
      case "accountNumber":
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          accountNumber: validateAccountNumber(value)
            ? ""
            : "Invalid account number ",
        }));
        break;
      case "upi":
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          upi: validateUPI(value) ? "" : "Invalid UPI",
        }));
        break;
      case "ifscCode":
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          ifscCode: validateIFSCCode(value) ? "" : "Invalid IFSC code",
        }));
        break;
      default:
        break;
    }

    setBankFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    // Reset the form data to the original values from Profile
    setFormData({
      Name: Profile.name || "",
      email: Profile.email || "",
      phone: Profile.phone || "",
      password: Profile.name || "", // Defaulting to name as the password
      address: Profile.address || "",
      idProof: Profile.idProof || "",
      upi: Profile.upi || "NA",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = { ...formData, _id: Profile._id };
      // Perform your API call to update the verifier with formData
      const response = await axios.put(
        "/api/verifier/updateProfile",
        dataToSend
      );

      // After successful update, exit edit mode or handle the response as needed
      setEditMode(false);
      setLoading(false);
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
      setLoading(false);
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
    }
  };

  const handleEditBank = () => {
    setEditBank(true);
  };

  const handleCancelBank = () => {
    setEditBank(false);
    // Reset the form data to the original values from Profile
    setBankFormData({
      upi: Profile.upi || "NA",
      accountNumber: Profile.accountNumber || "NA",
      ifscCode: Profile.ifscCode || "NA",
      accountHolderName: Profile.accountHolderName || "NA",
    });
  };
  const handleBankSubmit = async (e) => {
    if (
      formErrors.accountHolderName ||
      formErrors.accountNumber ||
      formErrors.upi ||
      formErrors.ifscCode
    ) {
      // Display a general error message or handle the error appropriately
      console.error("Form has errors. Please fix them before submitting.");
      return;
    }
    e.preventDefault();
    setLoading(true);

    if (editBank) {
      try {
        const dataToSend = { ...bankFormData, _id: Profile._id };
        // Perform your API call to update the verifier with formData
        const response = await axios.put(
          "/api/verifier/updateProfile",
          dataToSend
        );

        // After successful update, exit edit mode or handle the response as needed
        setEditBank(false);
        setLoading(false);
        // Show a success alert
        setAlerts([
          {
            type: "success",
            message: "Bank Details updated successfully!",
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
    setEditBank(!editBank);
  };

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      <VLayout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <h1 className="font-medium text-2xl ml-6">Profile</h1>
          <div className="flex flex-col justify-left px-10 gap-5">
            <form
              className="w-full bg-white border border-gray-200 rounded-lg shadow p-5"
              encType="multipart/form-data"
              onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 font-semibold text-gray-600 leading-8 mb-5">
                <span className="text-green-500">
                  <svg
                    className="h-5 relative bottom-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <span className="tracking-wide text-main-color text-xl font-bold relative bottom-3">
                  About
                </span>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                <label
                  className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                    editMode
                      ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      : "peer-focus:text-gray-600"
                  }`}>
                  Verifier Name
                </label>
              </div>{" "}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                  placeholder=""
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
                <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                  Email
                </label>
              </div>
              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="number"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editMode
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    Phone Number
                  </label>
                </div>
                {/* <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="password"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editMode
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    Password
                  </label>
                </div> */}
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer`}
                    placeholder=""
                    required
                    name="idProof"
                    value={formData.idProof}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editMode
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    ID Proof
                  </label>
                </div>
              </div>
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer`}
                  placeholder=""
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editMode}
                />
                <label
                  className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                    editMode
                      ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                      : "peer-focus:text-gray-600"
                  }`}>
                  Address
                </label>
              </div>
              {/* <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer`}
                    placeholder=""
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editMode
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    Address
                  </label>
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer`}
                    placeholder=""
                    required
                    name="upi"
                    value={formData.upi}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editMode
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    UPI ID
                  </label>
                </div>
            
              </div> */}
              {/* <div className="flex justify-end gap-3">
                {editMode ? (
                  <>
                    <p
                      onClick={handleCancelClick}
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
                    onClick={handleEditClick}
                    className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                    Edit Profile
                  </button>
                )}
              </div> */}
            </form>

            <form
              className="w-full bg-white border border-gray-200 rounded-lg shadow p-5 mb-10"
              onSubmit={handleBankSubmit}>
              <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-5">
                <span className="text-green-500">
                  <svg
                    className="h-5 relative bottom-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <span className="tracking-wide text-main-color text-xl font-bold relative bottom-3">
                  Bank Details
                </span>
              </div>

              <div className="grid md:grid-cols-2 md:gap-6">
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="accountHolderName"
                    value={bankFormData.accountHolderName}
                    onChange={handleInputChangeBank}
                    disabled={!editBank}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editBank
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    Account Holder Name
                  </label>
                  {formErrors.accountHolderName && (
                    <p className="text-red-500 relative">
                      {formErrors.accountHolderName}
                    </p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="ifscCode"
                    value={bankFormData.ifscCode}
                    onChange={handleInputChangeBank}
                    disabled={!editBank}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editBank
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    IFSC Code
                  </label>
                  {formErrors.ifscCode && (
                    <p className="text-red-500 relative">
                      {formErrors.ifscCode}
                    </p>
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
                    name="accountNumber"
                    value={bankFormData.accountNumber}
                    onChange={handleInputChangeBank}
                    disabled={!editBank}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editBank
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    Account Number
                  </label>
                  {formErrors.accountNumber && (
                    <p className="text-red-500 relative">
                      {formErrors.accountNumber}
                    </p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-6 group">
                  <input
                    type="text"
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
                    placeholder=""
                    required
                    name="upi"
                    value={bankFormData.upi}
                    onChange={handleInputChangeBank}
                    disabled={!editBank}
                  />
                  <label
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] ${
                      editBank
                        ? "peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        : "peer-focus:text-gray-600"
                    }`}>
                    UPI Id
                  </label>
                  {formErrors.upi && (
                    <p className="text-red-500 relative">{formErrors.upi}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                {editBank ? (
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
                    Edit Bank
                  </button>
                )}
              </div>
            </form>
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
      </VLayout>
    </div>
  );
};

export default Profile;

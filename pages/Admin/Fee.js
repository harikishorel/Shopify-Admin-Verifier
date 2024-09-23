import Layout from "@/components/Dashboard/layout/layout";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export async function getServerSideProps() {
  const URL = process.env.URL;
  try {
    const response = await axios.get(`${URL}/api/admin/verifier/fee`);
    const { Identity_Fee, Property_Fee, Document_Fee } = response.data;
    return {
      props: {
        identityFee: Identity_Fee,
        propertyFee: Property_Fee,
        documentFee: Document_Fee,
      },
    };
  } catch (error) {
    console.error("Error fetching fees:", error);
    return {
      props: {
        identityFee: null,
        propertyFee: null,
        documentFee: null,
      },
    };
  }
}

function Fee({ identityFee, propertyFee, documentFee }) {
  const [identityEditing, setIdentityEditing] = useState(false);
  const [propertyEditing, setPropertyEditing] = useState(false);
  const [documentEditing, setDocumentEditing] = useState(false);
  const [editedIdentityFee, setEditedIdentityFee] = useState(identityFee);
  const [editedPropertyFee, setEditedPropertyFee] = useState(propertyFee);
  const [editedDocumentFee, setEditedDocumentFee] = useState(documentFee);
  const [showEditAllButton, setShowEditAllButton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [responseModal, setResponseModal] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const router = useRouter();

  const handleIdentityChange = (e) => {
    const value = e.target.value;
    // Ensure only numbers are accepted
    if (!isNaN(value)) {
      setEditedIdentityFee(value);
    }
  };

  const handlePropertyChange = (e) => {
    const value = e.target.value;
    // Ensure only numbers are accepted
    if (!isNaN(value)) {
      setEditedPropertyFee(value);
    }
  };

  const handleDocumentChange = (e) => {
    const value = e.target.value;
    // Ensure only numbers are accepted
    if (!isNaN(value)) {
      setEditedDocumentFee(value);
    }
  };

  const handleSaveIdentity = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/admin/verifier/fee", {
        Identity_Fee: editedIdentityFee,
      });
      setResponseModal(true);
      setIdentityEditing(false);
      console.log("Identity fee saved successfully", response.data);
    } catch (error) {
      setShowErrorPopup(true);
      console.error("Error saving Identity Fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/admin/verifier/fee", {
        Property_Fee: editedPropertyFee,
      });
      console.log("Property fee saved successfully", response.data);
      setPropertyEditing(false);
      setResponseModal(true);
    } catch (error) {
      setShowErrorPopup(true);
      console.error("Error saving Property Fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/admin/verifier/fee", {
        Document_Fee: editedDocumentFee,
      });
      console.log("Document fee saved successfully", response.data);
      setDocumentEditing(false);
      setResponseModal(true);
    } catch (error) {
      setShowErrorPopup(true);
      console.error("Error saving Document Fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const editAll = () => {
    setIdentityEditing(true);
    setPropertyEditing(true);
    setDocumentEditing(true);
    setShowEditAllButton(false);
  };
  const cancelAll = () => {
    setIdentityEditing(false);
    setPropertyEditing(false);
    setDocumentEditing(false);
    setShowEditAllButton(true);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/admin/verifier/fee", {
        Identity_Fee: editedIdentityFee,
        Property_Fee: editedPropertyFee,
        Document_Fee: editedDocumentFee,
        allFees: true, // Indicate that all fees are being saved
      });
      console.log("All fees saved successfully", response.data);
      setIdentityEditing(false);
      setPropertyEditing(false);
      setDocumentEditing(false);
      setShowEditAllButton(true); // After saving, show the Edit All button again
      setResponseModal(true);
    } catch (error) {
      setShowErrorPopup(true);
      console.error("Error saving all fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/Admin/Fee");
    setResponseModal(false);
    setShowErrorPopup(false);
  };

  return (
    <div className="bg-gray-50 flex flex-col h-screen">
      <Layout>
        <div className="sm:ml-64 flex flex-col mt-20 gap-8">
          <h1 className="font-medium text-2xl ml-6">Fee</h1>
          {showErrorPopup && (
            <div className="fixed inset-0  bg-gray-500 bg-opacity-50 z-50">
              <div
                id="alert-2"
                className="flex items-center p-4 mt-20 text-red-800 rounded-lg bg-red-100 w-1/2 mx-auto"
                role="alert">
                <svg
                  className="flex-shrink-0 w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div className="ms-3 text-sm font-medium mr-3">
                  Unable to update fees amount value
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="ms-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8"
                  data-dismiss-target="#alert-2"
                  aria-label="Close">
                  <span className="sr-only">Close</span>
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
          )}
          {responseModal && (
            <div className="fixed inset-0  bg-gray-500 bg-opacity-50 z-50">
              <div
                id="alert-3"
                className="flex items-center p-4 mt-20 text-green-800 rounded-lg bg-green-100 w-1/2 mx-auto"
                role="alert">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span className="sr-only">Success</span>
                <div className="ms-3 text-sm font-medium mr-3">
                  Fees updated successfully
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="ms-auto -mx-1.5 -my-1.5 bg-green-100 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8"
                  data-dismiss-target="#alert-3"
                  aria-label="Close">
                  <span className="sr-only">Close</span>
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
          )}
          <div className="flex flex-col flex-wrap items-center gap-8 justify-center">
            <div className="flex flex-col mb-4 gap-4 relative">
              <label htmlFor="identity" className="font-medium mb-2">
                Identity Fee
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  ₹
                </span>
                {identityEditing ? (
                  <input
                    type="text"
                    id="identity"
                    value={editedIdentityFee}
                    onChange={handleIdentityChange}
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                ) : (
                  <input
                    type="text"
                    id="identity"
                    value={identityFee}
                    disabled
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                )}
                {identityEditing && (
                  <button
                    type="button"
                    onClick={handleSaveIdentity}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Save
                  </button>
                )}
                {!identityEditing && (
                  <button
                    type="button"
                    onClick={() => setIdentityEditing(true)}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col mb-4 gap-4 relative">
              <label htmlFor="property" className="font-medium mb-2">
                Property Fee
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  ₹
                </span>
                {propertyEditing ? (
                  <input
                    type="text"
                    id="property"
                    value={editedPropertyFee}
                    onChange={handlePropertyChange}
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                ) : (
                  <input
                    type="text"
                    id="property"
                    value={propertyFee}
                    disabled
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                )}
                {propertyEditing && (
                  <button
                    type="button"
                    onClick={handleSaveProperty}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Save
                  </button>
                )}
                {!propertyEditing && (
                  <button
                    type="button"
                    onClick={() => setPropertyEditing(true)}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col mb-4 gap-4 relative">
              <label htmlFor="document" className="font-medium mb-2">
                Document Fee
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  ₹
                </span>

                {documentEditing ? (
                  <input
                    type="text"
                    id="document"
                    value={editedDocumentFee}
                    onChange={handleDocumentChange}
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                ) : (
                  <input
                    type="text"
                    id="document"
                    value={documentFee}
                    disabled
                    className="border border-gray-300 rounded-md pl-10 pr-14 py-2"
                  />
                )}
                {documentEditing && (
                  <button
                    type="button"
                    onClick={handleSaveDocument}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Save
                  </button>
                )}
                {!documentEditing && (
                  <button
                    type="button"
                    onClick={() => setDocumentEditing(true)}
                    className="absolute inset-y-0 right-0 bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center text-white">
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex item-center justify-center">
            {showEditAllButton && (
              <button
                type="button"
                onClick={editAll} // Call editAll function when clicking "Edit all"
                className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-1/3 sm:w-auto px-5 py-2.5 text-center">
                Edit All
              </button>
            )}
            {!showEditAllButton && (
              <>
                <button
                  type="button"
                  onClick={cancelAll} // Call handleSaveAll function when clicking "Save all"
                  className="text-white mr-2 bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-1/3 sm:w-auto px-5 py-2.5 text-center">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll} // Call handleSaveAll function when clicking "Save all"
                  className="text-white bg-gray-900 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-1/3 sm:w-auto px-5 py-2.5 text-center">
                  Save All
                </button>
              </>
            )}
          </div>

          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}

export default Fee;

import Layout from "@/components/Dashboard/layout/layout";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export async function getServerSideProps(context) {
  const URL = process.env.URL;

  try {
    const { orderId } = context.params;
    console.log("selleridapifront", orderId);

    if (!orderId) {
      throw new Error("Seller ID is missing.");
    }

    const res = await fetch(`${URL}/api/admin/getdetails/${orderId}`);
    const data = await res.json();

    return {
      props: {
        orders: data || [],
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    return {
      props: {
        orders: [],
      },
    };
  }
}

const getProgressPercentage = (status) => {
  switch (status) {
    case "confirmed":
      return "25%";
    case "shipped":
      return "50%";
    case "outfordelivery":
      return "75%";
    case "delivered":
      return "100%";
    case "return":
      return "50%";
    case "returnpaid":
      return "100%";
    default:
      return "0%"; // Default progress if status is not one of the specified cases
  }
};

function Orderdetails({ orders }) {
  console.log("ordersss", orders);
  const [progress, setProgress] = useState("0%");
  const subtotal = orders.product.discountPrice;
  const shippingCost = 8.0;
  const total = subtotal + shippingCost;

  const soldDate = new Date(orders.product.soldDate);

  // Format the date as MM/DD/YYYY
  const formattedSoldDate = `${soldDate.getMonth() + 1
    }/${soldDate.getDate()}/${soldDate.getFullYear()}`;

  const nextsoldDate = new Date(orders.product.soldDate);

  const formattedSoldDatenext = nextsoldDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  useEffect(() => {
    // Update the progress when the component mounts or when the status changes
    setProgress(getProgressPercentage(orders.order.status));
  }, [orders.order.status]);

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      <Layout>
        <div className="sm:ml-64 flex flex-col items-center justify-center mt-20 ">
          {/* Dropdown for selecting date and month */}
          <div className="flex place-content-between">
            <div>
              <h1 className="font-medium text-2xl ml-6 p-5">Return/Refund</h1>
            </div>
          </div>

          <div
            className="rounded-lg p-6 border border-gray-300 flex flex-row place-content-between mb-10"
            style={{
              width: "400px",
              boxShadow:
                "0 8px 8px -1px rgba(0, 0, 255, 0.1), 0 2px 4px -1px rgba(0, 0, 255, 0.06)",
            }}>
            <div className="flex flex-col ml-6 gap-2">
              <h1 className="font-medium text-xl">
                Order ID: {orders.order.orderId}
              </h1>
              <h1 className="font-medium text-sm">
                Product Name: {orders.product.productName}
              </h1>
              <h1 className="font-medium text-sm">
                Price: Rs.{orders.product.discountPrice}
              </h1>
              <div className="flex flex-row mt-5">
                <span className="text-gray-400">
                  <h1 className="font-medium text-xs pr-2">Order date:</h1>
                </span>
                <h1 className="font-medium text-xs">{formattedSoldDate}</h1>
                <div className="border-l border-gray-300 h-4 mx-3"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 mr-1 text-green-500  ">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
                <h1 className="font-medium text-xs text-green-500">
                  Estimated delivery: Feb 24,2022
                </h1>
              </div>
            </div>
            {/* <div className='flex flex-row items-center p-2 bg-white rounded-lg border-2 border-gray-200 hover:bg-gray-100 active:bg-gray-200 cursor-pointer w-24 h-10 place-content-center ml-20'>
              <button
                title="Add New"
                className="group cursor-pointer outline-none ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-500">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </button>
              <h1 className='ml-2 text-xs font-medium text-gray-500'>Invoice</h1>
            </div> */}
          </div>

          <div
            className="gap-2 p-4 items-center justify-center bg-white rounded-lg shadow-md border border-gray-300 w-full md:w-1/2 lg:w-1/3 xl:w-1/5 mb-10"
            style={{
              width: "400px",
              boxShadow:
                "0 8px 8px -1px rgba(255, 255, 0, 0.2), 0 2px 4px -1px rgba(255, 255, 0, 0.1)",
            }}>
            {" "}
            <div className="xl:ml-8 mx-auto m-8">
              <h1 className="font-medium text-xl">Order Details</h1>
              <h1 className="font-normal text-gray-600 text-xs">Address</h1>
              <h1 className="font-medium text-gray-500 text-sm">
                20A, 6th street, Thillai nagar, Anna nagar, ch-67
              </h1>
            </div>

            <div className="flex flex-col md:flex-row items-stretch w-full md:w-5/6 lg:w-3/4 xl:w-5/8 xl:ml-8 mx-auto m-8">
              <div className="flex flex-col w-full md:mr-4">
                <h3 className="text-base font-semibold leading-5 text-gray-800 pb-4">
                  Order Summary
                </h3>
                <div className="flex justify-center items-center w-full space-y-4 flex-col">
                  <div className="flex justify-between w-full">
                    <p className="text-base leading-4 text-gray-600 font-medium">
                      Subtotal
                    </p>
                    <p className="text-base leading-4 text-gray-600 font-medium">
                      {orders.product.discountPrice}
                    </p>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base leading-4 text-gray-500 font-medium">
                      Discount{" "}
                    </p>
                    <p className="text-base leading-4 text-gray-500 font-medium">
                      -{orders.product.price} (50%)
                    </p>
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <p className="text-base leading-4 text-gray-500 font-medium">
                      Shipping
                    </p>
                    <p className="text-base leading-4 text-gray-500 font-medium">
                      {shippingCost}
                    </p>
                  </div>
                </div>
                <hr className="h-0.5 w-full bg-gray-300 border-0 " />

                <div className="flex justify-between items-center w-full mt-3 mb-3">
                  <p className="text-base  font-semibold leading-4 text-gray-500">
                    Total
                  </p>
                  <p className="text-base  font-semibold leading-4 text-gray-800">
                    Rs.{total}
                  </p>
                </div>
                <hr className="h-0.5 w-full bg-gray-300 border-0 " />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default Orderdetails;

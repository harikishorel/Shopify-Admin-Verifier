import Chartdata from "@/components/Dashboard/chart/Chartdata";
import Layout from "@/components/Dashboard/layout/layout";
import React from "react";
import axios from "axios";
import Link from "next/link";

export async function getServerSideProps() {
  const URL = process.env.URL;

  try {
    // Make a GET request to your total price API
    const response = await axios.get(
      `${URL}/api/admin/realEstate/getVerifiedProperty`
    );

    const verifier = await axios.get(`${URL}/api/admin/verifier/get`);
    return {
      props: {
        totalProperty: response.data,
        totalVerifiers: verifier.data.length,
      },
    };
  } catch (error) {
    console.error("Fetch total price error:", error);
    return {
      props: {
        totalProperty: [],
        totalVerifiers: 0,
      },
    };
  }
}

function Dashboard({ totalProperty, totalVerifiers }) {
  const totalCount = Math.max(totalProperty.length);

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Layout>
        <div className="p-4 sm:ml-64 flex flex-col md:flex-row">
          <div className="p-4 rounded-lg mt-14 ">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex flex-col gap-7">
                <div className="flex flex-row gap-5 ">
                  <Link
                    href="/Admin/Dashboard/Properties"
                    className="flex items-center justify-between w-3/6 rounded p-3 shadow-lg bg11 transition-transform transform hover:scale-105">
                    <div className="text-2xl text-white">
                      <h4 className="text-base font-semibold mb-1.5">
                        Total Verified Products
                      </h4>
                      <h2 className="text-2xl font-bold mb-1.5">
                        {totalCount}
                      </h2>
                      <h6 className="text-sm">
                        Total {totalCount} Products verified
                      </h6>
                    </div>
                    <div className="mt-10 ">
                      <img
                        src="/home1.png" // Replace with the actual path to your image
                        className="w10 h-10 " // Adjust the size and styling as needed
                      />
                    </div>
                  </Link>

                  <Link
                    href="/Admin/Verifier"
                    className="flex items-center rounded p-3  w-3/6 bg-white shadow-lg bg12 justify-between transition-transform transform hover:scale-105">
                    <div className="text-2xl text-gray-700 ">
                      <h4 className="text-base font-semibold mb-1.5">
                        Total Verifiers
                      </h4>
                      <h2 className="text-2xl font-bold mb-1.5">
                        {totalVerifiers}
                      </h2>
                      <h6 className="text-sm">Available Count</h6>
                    </div>
                    <div className="mt-10 ">
                      <img
                        src="/group1.png" // Replace with the actual path to your image
                        className="w-12 h-12 rounded-md mr-2" // Adjust the size and styling as needed
                      />
                    </div>
                  </Link>
                </div>

                <Chartdata monthlySales={totalProperty} />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default Dashboard;

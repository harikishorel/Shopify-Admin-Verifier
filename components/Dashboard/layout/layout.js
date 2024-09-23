import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import NextProgress from "nextjs-progressbar";
import Chartdata from "../chart/Chartdata";
import axios from "axios";

export default function Layout({ children, rowCount }) {
  const [data, setData] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/admin/getrefund");
        const responseData = response.data.combinedRefunds || [];
        const rowCount = responseData.length;
        setData(rowCount);
      } catch (error) {
        console.error("Error fetching combined refunds:", error);
      }
    };

    fetchData();
  }, [data]);
  return (
    <>
      <NextProgress
        color="#F8B940"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
      />
      <div>
        <Sidebar rowCount={data} />
        <main>{children}</main>
      </div>
    </>
  );
}

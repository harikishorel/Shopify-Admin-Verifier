import React, { useState } from "react";
import VerifierSidebar from "../sidebar/VerifierSidebar";
import NextProgress from "nextjs-progressbar";

const VLayout = ({ children }) => {
  const { loading, setloading } = useState();

  return (
    <>
      <NextProgress
        color="#F8B940"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
      />
      <div>
        <VerifierSidebar />
        <main>{children}</main>
      </div>
    </>
  );
};

export default VLayout;

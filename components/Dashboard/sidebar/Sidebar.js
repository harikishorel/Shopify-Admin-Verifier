import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

function Sidebar({ rowCount }) {
  useEffect(() => {
    // Your existing code for useEffect

    // Log the rowCount whenever it changes
    console.log("RowCount:", rowCount);
  }, [rowCount]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const { data: session } = useSession();
  console.log(session);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
    };
  }, [router]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveLink = (href) => {
    return router.pathname.startsWith(href);
  };

  // const handleLogout = () => {
  //   signOut();
  //   // Redirect to login page if session is not available
  //   if (!session) {
  //     router.push("/Admin/Login");
  //   }
  // };

  return (
    <div ref={sidebarRef}>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg13">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                onClick={toggleSidebar}
                type="button"
                className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>
              <Link href="/Admin/Dashboard" className="flex ms-2 md:me-24">
                {/* <img
                    src=""
                    className="self-center whitespace-nowrap ml-4 w-24 h-10"
                  /> */}
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ml-4 text-white">
                  Admin
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform pt-14 ${
          isSidebarOpen ? "" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg13 pt-5">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/Admin/Dashboard"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${
                  isActiveLink("/Admin/Dashboard") ? "bg14" : ""
                }`}>
                {" "}
                <svg
                  className="w-5 h-5 text-white transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3 text-white  group-hover:text-gray-900">
                  Dashboard
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/Admin/Verifier"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${
                  isActiveLink("/Admin/Verifier") ? "bg14" : ""
                }`}>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75 d group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900">
                  Verifiers
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/Admin/Fee"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group  ${
                  isActiveLink("/Admin/Fee") ? "bg14" : ""
                }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75 d group-hover:text-gray-900 ">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900">
                  Fee
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/Admin/VerifPayout"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group  ${
                  isActiveLink("/Admin/VerifPayout") ? "bg14" : ""
                }`}>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75 d group-hover:text-gray-900 "
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900">
                  Verifier Payout
                </span>
              </Link>
            </li>
          </ul>
          <ul className="font-medium border-t border-gray-200 absolute bottom-0 left-0 justify-center p-4 space-x-4 w-full">
            <li>
              <Link
                href="/Admin/Login"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
                // onClick={handleLogout}
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    router.push("/Admin/Login"); // Redirect to the dashboard page after signing out
                  });
                }}>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 16">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  />
                </svg>
                <span
                  className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900"
                  // onClick={() => signOut()}
                >
                  Logout
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"></div>
      )}
    </div>
  );
}
export default Sidebar;

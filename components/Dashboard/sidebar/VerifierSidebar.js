import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const VerifierSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sidebarRef = useRef();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveLink = (href) => {
    return router.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    // Use signOut to clear the session
    await signOut({ callbackUrl: "/Verifier/Login" });
  };

  useEffect(() => {
    const handleStart = (url) => {
      // Check if the route change is within the same page
      if (!url.includes(router.pathname)) {
        setLoading(true);
      }
    };
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

  return (
    <div ref={sidebarRef}>
      <nav className="fixed top-0 z-50 w-full bg13 border-b border-gray-700">
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
              <Link href="/Verifier/Dashboard" className="flex ms-2 md:me-24">
                {/* <img
                  src="/VasthraDarkLogo.png"
                  className="self-center whitespace-nowrap ml-4 w-24 h-10"
                /> */}
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ml-4 text-white">
                  Verifier
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform pt-14 ${isSidebarOpen ? "" : "-translate-x-full"
          } sm:translate-x-0`}
        aria-label="Sidebar">
        <div className="h-full px-3 pb-4 overflow-y-auto bg13 pt-5">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/Verifier/Dashboard"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${isActiveLink("/Verifier/Dashboard") ? "bg14" : ""
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
                href="/Verifier/Products"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${isActiveLink("/Verifier/Product") ? "bg14" : ""
                  }`}>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 20">
                  <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                </svg>

                <span className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900">
                  Products
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/Verifier/Profile"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${isActiveLink("/Verifier/Profile") ? "bg14" : ""
                  }`}>
                <svg
                  className="flex-shrink-0 w-5 h-5 text-white transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 14 18">
                  <path d="M7 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm2 1H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap text-white  group-hover:text-gray-900">
                  Profile
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/Verifier/Payment"
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 group ${isActiveLink("/Verifier/Payment") ? "bg14" : ""
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
                  Payment Details
                </span>
              </Link>
            </li>
          </ul>
          <ul className="font-medium border-t border-gray-200 absolute bottom-0 left-0 justify-center p-4 space-x-4 w-full">
            <li>
              <Link
                href="/Verifier/Login"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
                // onClick={handleLogout}
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    router.push("/Verifier/Login"); // Redirect to the dashboard page after signing out
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
                // onClick={() => handleLogout()}
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
};

export default VerifierSidebar;

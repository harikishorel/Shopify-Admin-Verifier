import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/router";

function Login({ req }) {
  const { data: session } = useSession();
  console.log("session", session);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [showInvalidCredentialsPopup, setShowInvalidCredentialsPopup] =
    useState(false);

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
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   if (!email) {
  //     setIsEmailValid(false);
  //     setEmailErrorMessage('Please enter your email');
  //     return;
  //   } else {
  //     setIsEmailValid(true);
  //     setEmailErrorMessage('');
  //   }

  //   // Check if password is entered
  //   if (!password) {
  //     setIsPasswordValid(false);
  //     setPasswordErrorMessage('Please enter your password');
  //     return;
  //   } else {
  //     setIsPasswordValid(true);
  //     setPasswordErrorMessage('');
  //   }

  //   try {
  //     const response = await axios.post('/api/admin/login', { email, password });
  //     if (response.status === 200) {
  //       window.location.href = '/Admin/Dashboard';
  //     }
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //     // Display popup for invalid credentials
  //     setShowInvalidCredentialsPopup(true);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      setIsEmailValid(false);
      setEmailErrorMessage("Please enter your email");
      return;
    } else {
      setIsEmailValid(true);
      setEmailErrorMessage("");
    }

    // Check if password is entered
    if (!password) {
      setIsPasswordValid(false);
      setPasswordErrorMessage("Please enter your password");
      return;
    } else {
      setIsPasswordValid(true);
      setPasswordErrorMessage("");
    }

    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        route: "/Admin/Login",
        redirect: false,
      });

      if (res.error) {
        setLoading(false);
        console.log("Error:", res.error);
        setShowInvalidCredentialsPopup(true); // Display popup for other errors if needed
        return;
      }

      // If successful, you can handle the redirection here
      router.push("/Admin/Dashboard");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowInvalidCredentialsPopup(true); // Display popup for other errors if needed
    }
  };

  const handleButtonClick = () => {
    // Validate email and password before setting state
    if (!email) {
      setIsEmailValid(false);
      setEmailErrorMessage("Please enter your email");
    } else {
      setIsEmailValid(true);
      setEmailErrorMessage("");
    }

    if (!password) {
      setIsPasswordValid(false);
      setPasswordErrorMessage("Please enter your password");
    } else {
      setIsPasswordValid(true);
      setPasswordErrorMessage("");
    }

    // Reset popup state when attempting login again
    setShowInvalidCredentialsPopup(false);

    const emailValue = document.getElementById("email").value;
    const passwordValue = document.getElementById("password").value;

    setEmail(emailValue);
    setPassword(passwordValue);
  };

  // useEffect(() => {
  //   const checkSession = async ({ req }) => {
  //     const sessionData = await getSession(req); // Get session data
  //     const session = sessionData ? sessionData.user : null; // Check for user object within session
  //     console.log("session", session);
  //     if (!session?.user?.image === "verifier") {
  //       return {
  //         redirect: {
  //           destination: "/",
  //           permanent: false, // Set to true for permanent redirect
  //         },
  //       };
  //     }
  //   };

  //   checkSession({ req });
  // }, []);

  return (
    <div className="flex h-screen bg-lcolor">
      <div className="hidden lg:flex w-2/3 bg-white flex-col items-center justify-center curved-container bg-pattern-image bg-cover">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="mb-10 text-center">
            <img src="/vastralogo.png" className="w-50 h-30 mb-5 ml-4" />
            <div className="text-black text-6xl font-bold">Hello Admin</div>
            <br />
            <div className="text-black text-2xl">Login to your Dashboard</div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md relative flex flex-col p-4 rounded-md text-black w-full">
          <div className="mb-3">
            <div className="text-sm font-semibold mb-4 text-white ml-2">
              <div className="lg:hidden flex justify-center items-center flex-col mb-10">
                <img src="/vastra logo2.png" className="w-30 h-20 mb-5" />
              </div>
              <span style={{ fontSize: "1.5em" }}>Welcome to </span>
              <span style={{ fontSize: "2em" }}>Vastra Admin</span>
            </div>
          </div>
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <div className="relative">
              <label className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                className={`rounded-3xl border ${
                  isEmailValid ? "border-gray-200" : "border-red-500"
                } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setIsEmailValid(true);
                  setEmailErrorMessage("");
                }}
              />
              {isEmailValid || (
                <p className="text-red-500 text-xs mt-1">{emailErrorMessage}</p>
              )}
            </div>

            <div className="relative">
              <label className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6  text-gray-400">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                className={`rounded-3xl border ${
                  isPasswordValid ? "border-gray-200" : "border-red-500"
                } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsPasswordValid(true);
                  setPasswordErrorMessage("");
                }}
              />
              {isPasswordValid || (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrorMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#4ce13f] w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-[#3aa72f] active:bg-[#2d801e] focus:outline-none"
              onClick={handleButtonClick}>
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Popup for Invalid Credentials */}
      {showInvalidCredentialsPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white p-6 rounded-md shadow-lg flex items-center justify-center flex-col">
              <p className="text-red-500 text-lg">
                Invalid credentials. Please try again.
              </p>
              <button
                className="mt-4 bg-[#4ce13f] px-4 py-2 rounded text-white "
                onClick={() => setShowInvalidCredentialsPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"></div>
      )}
    </div>
  );
}

export default Login;

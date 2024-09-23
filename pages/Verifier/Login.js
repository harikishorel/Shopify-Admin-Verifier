import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showInvalidCredentialsPopup, setShowInvalidCredentialsPopup] =
    useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const { data: session } = useSession();
  // Get the router object
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const Role = session?.user?.id;
  console.log("Role", Role);

  const [message, setMessage] = useState("");
  const [showOTPPopup, setShowOTPPopup] = useState(false);

  const otpInputRefs = useRef([]);
  const [view, setView] = useState("login"); // 'login' as the default view
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [Otpvalue, setOtpValue] = useState("");
  const [isOTPValid, setIsOTPValid] = useState(true);
  const [otpErrorMessage, setOTPErrorMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(true);
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = useState("");
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState("");

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [unmetConditions, setUnmetConditions] = useState([]);
  useEffect(() => {
    // Focus the first OTP input when the component mounts
    if (showOtpInput) {
      otpInputRefs.current[0].focus();
    }
  }, [showOtpInput]);

  const handleOtpChange = (index, value) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;

    // Move to the previous OTP input box if backspace is pressed and the current input is empty
    if (value === "" && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }

    // Move to the next OTP input box if a digit is entered
    if (index < otp.length - 1 && value !== "") {
      otpInputRefs.current[index + 1].focus();
    }

    setOtp(updatedOtp);
  };

  const handleForgotPasswordClick = () => {
    setView("forgotPassword");
    setEmail("");
    setIsEmailValid(true);
    setEmailErrorMessage("");
  };

  const handleBackClick = () => {
    setView("login");
    setEmail("");
    setIsEmailValid(true);
    setEmailErrorMessage("");
    setPassword("");
    setIsPasswordValid(true);
    setPasswordErrorMessage("");
    // Additional logic for handling the "Back" click, if needed
  };

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
      // const response = await axios.post("/api/verifier/login", {
      //   email,
      //   password,
      // });
      const response = await signIn("credentials", {
        email,
        password,
        route: "/Verifier/Login",
        redirect: false,
      });

      // if (response.status === 200) {
      //   // TODO: Redirect to Dashboard or handle session logic
      //   console.log("Login successful");
      //   window.location.href = "/Verifier/Dashboard";
      // } else {
      //   console.error("Login error:", response.data.error);
      // }

      if (response.error) {
        setLoading(false);

        console.log("Error:", response.error);
        setShowInvalidCredentialsPopup(true); // Display popup for other errors if needed

        return;
      }

      // If successful, you can handle the redirection here
      router.push("/Verifier/Dashboard");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowInvalidCredentialsPopup(true); // Display popup for other errors if needed
      console.error("Login error:", error.message);
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

  const handleSendClick = () => {
    // Validate email and password before setting state
    if (!email) {
      setIsEmailValid(false);
      setEmailErrorMessage("Please enter your email");
    } else {
      setIsEmailValid(true);
      setEmailErrorMessage("");
    }

    // Reset popup state when attempting login again
    setShowInvalidCredentialsPopup(false);

    const emailValue = document.getElementById("email").value;
    setEmail(emailValue);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setIsEmailValid(false);
      setEmailErrorMessage("Please enter your email");
      return;
    } else {
      setIsEmailValid(true);
      setEmailErrorMessage("");
    }

    try {
      setLoading(true);
      // Send a request to your API endpoint to send an email with OTP
      const response = await axios.post(
        "/api/verifier/notification/forgetPassword",
        {
          toAddress: email,
        }
      );

      // Assuming your API response has a 'message' and 'otp' property
      if (response.data.message === "Email sent successfully") {
        // Access the OTP from the response
        const otpFromApi = response.data.otp;
        setOtpValue(otpFromApi);
        setLoading(false);
        setView("resetPassword");
        setShowOTPPopup(true);
        setMessage("OTP Sent Successfully");
      }
    } catch (error) {
      setLoading(false);
      setShowOTPPopup(true);
      setMessage("Unable to sent OTP to this Email");
      console.error("Login error:", error.message);
    }
  };

  const handleOTPClick = () => {
    // Validate email and password before setting state
    if (!otp) {
      setIsOTPValid(false);
      setOTPErrorMessage("Please enter the OTP correctly");
    } else {
      setIsOTPValid(true);
      setOTPErrorMessage("");
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp === Otpvalue) {
      setLoading(true);
      setView("changePassword");
      setLoading(false);
      setShowOTPPopup(true);
      setMessage("OTP validated successfully");
    } else {
      setLoading(false);
      setShowOTPPopup(true);
      setMessage("OTP Validation Failed");
    }
  };

  const handlePasswordClick = () => {
    // Validate email and password before setting state
    if (!newPassword) {
      setIsNewPasswordValid(false);
      setNewPasswordErrorMessage("Please enter your New Password");
    } else {
      setIsNewPasswordValid(true);
      setNewPasswordErrorMessage("");
    }

    if (!confirmPassword) {
      setIsConfirmPasswordValid(false);
      setConfirmPasswordErrorMessage("Please enter your Confirm Password");
    } else {
      setIsConfirmPasswordValid(true);
      setConfirmPasswordErrorMessage("");
    }

    const newPasswordValue = document.getElementById("newPassword").value;
    const confirmPasswordValue =
      document.getElementById("confirmPassword").value;

    setNewPassword(newPasswordValue);
    setConfirmPassword(confirmPasswordValue);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      setIsConfirmPasswordValid(false);
      setConfirmPasswordErrorMessage(
        "Both New Password and Confirm Password must match"
      );
      return;
    }
    const conditions = [];

    // Track the conditions that the password doesn't meet
    if (!/[a-z]/.test(newPassword)) {
      conditions.push("* At least one lowercase letter is required");
    }

    if (!/[A-Z]/.test(newPassword)) {
      conditions.push("* At least one uppercase letter is required");
    }

    if (!/\d/.test(newPassword)) {
      conditions.push("* At least one digit is required");
    }

    if (!/[@$!%*?&]/.test(newPassword)) {
      conditions.push("* At least one special character is required");
    }

    if (newPassword.length < 8 || newPassword.length > 15) {
      conditions.push("* should be between 8 and 15 characters");
    }
    if (/\s/.test(newPassword)) {
      conditions.push("* Spaces are not allowed");
    }
    // Update the unmetConditions state
    setUnmetConditions(conditions);

    // If there are unmet conditions, display them to the user
    if (conditions.length > 0) {
      return;
    }

    // Make a request to update the password
    try {
      setLoading(true);
      const response = await axios.post(`/api/verifier/changepassword`, {
        email: email, // Make sure to replace this with the actual email state
        newPassword: newPassword,
      });

      if (response.status === 200) {
        setShowSuccessPopup(true);
        setLoading(false);
        setView("login");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating password:", error.message);
    }
  };

  return (
    <div className="flex h-screen bg-lcolor">
      <div className="hidden lg:flex w-2/3 bg-white flex-col items-center justify-center curved-container bg-pattern-image bg-cover">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="mb-10 text-center">
            <img src="/vastralogo.png" className="w-50 h-30 mb-5 ml-4" />
            <div className="text-black text-6xl font-bold">Hello Verifier</div>
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
              <span style={{ fontSize: "2em" }}>Vastra Verifier</span>
            </div>
          </div>
          {view === "login" && (
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
                  value={email}
                  required
                  className={`rounded-3xl border ${
                    isEmailValid ? "border-gray-200" : "border-red-500"
                  } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailValid(true);
                    setEmailErrorMessage("");
                  }}
                />
              </div>
              {isEmailValid || (
                <p className="text-red-400 text-sm -mt-3">
                  *{emailErrorMessage}
                </p>
              )}
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
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  required
                  className={`rounded-3xl border ${
                    isPasswordValid ? "border-gray-200" : "border-red-500"
                  } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordValid(true);
                    setPasswordErrorMessage("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                  {isPasswordVisible ? (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 14c-.5-.6-.9-1.3-1-2 0-1 4-6 9-6m7.6 3.8A5 5 0 0 1 21 12c0 1-3 6-9 6h-1m-6 1L19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {isPasswordValid || (
                <p className="text-red-400 text-sm -mt-3">
                  *{passwordErrorMessage}
                </p>
              )}
              <div className="flex justify-end -mt-3">
                <Link
                  href=""
                  onClick={handleForgotPasswordClick}
                  className="hover:underline hover:text-blue-400 text-white text-sm">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                onClick={handleButtonClick}
                className="bg-[#4ce13f] w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-[#3aa72f] active:bg-[#2d801e] focus:outline-none">
                Login
              </button>
            </form>
          )}
          {view === "forgotPassword" && (
            <form
              onSubmit={handleSendOTP}
              className="your-forgot-password-form-styles">
              <label className="font-medium text-green-400">
                Enter your email to send OTP
              </label>
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
                  value={email}
                  required
                  className={`rounded-3xl border ${
                    isEmailValid ? "border-gray-200" : "border-red-500"
                  } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailValid(true);
                    setEmailErrorMessage("");
                  }}
                />
              </div>
              {isEmailValid || (
                <p className="text-red-400 text-sm">*{emailErrorMessage}</p>
              )}
              <div className="flex mt-3">
                <Link
                  href=""
                  className="bg-blue-500 w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-blue-400 active:bg-blue-400 focus:outline-none"
                  onClick={handleBackClick}>
                  Back
                </Link>
                <button
                  type="Submit"
                  onClick={() => {
                    handleSendClick();
                  }}
                  className="bg-[#4ce13f] w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-[#3aa72f] active:bg-[#2d801e] focus:outline-none">
                  Send OTP
                </button>
              </div>
            </form>
          )}

          {view === "resetPassword" && (
            <form onSubmit={handleOtpSubmit}>
              <div className="gap-1 flex flex-col">
                <h1 className="relative bottom-3 text-base text-center font-medium text-green-400">
                  Enter the OTP code below to confirm the Email Address
                </h1>
                <div className="flex gap-2 my-2">
                  {[0, 1, 2, 3, 4].map((digit, index) => (
                    <input
                      key={digit}
                      type="text"
                      maxLength="1"
                      id="OTP-input"
                      value={otp[index]}
                      onChange={(e) => {
                        handleOtpChange(index, e.target.value);
                        setIsOTPValid(true);
                        setOTPErrorMessage("");
                      }}
                      className="h-10 px-2 bg-[#e1feff] text-black outline-none w-1/5 text-center rounded-lg"
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      required
                    />
                  ))}
                </div>
                {isOTPValid || (
                  <p className="text-red-400 text-sm -mt-3">
                    *{otpErrorMessage}
                  </p>
                )}
                <button
                  type="submit"
                  onClick={handleOTPClick}
                  className="bg-[#4ce13f] w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-[#3aa72f] active:bg-[#2d801e] focus:outline-none">
                  Submit
                </button>
              </div>
            </form>
          )}

          {view === "changePassword" && (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleChangePassword}>
              <h1 className="relative text-base font-medium text-green-400">
                Change your new password.
              </h1>
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
                  type={isNewPasswordVisible ? "text" : "password"}
                  id="newPassword"
                  placeholder="New Password"
                  value={newPassword}
                  required
                  className={`rounded-3xl border ${
                    isNewPasswordValid ? "border-gray-200" : "border-red-500"
                  } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setIsNewPasswordValid(true);
                    setNewPasswordErrorMessage("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                  {isNewPasswordVisible ? (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 14c-.5-.6-.9-1.3-1-2 0-1 4-6 9-6m7.6 3.8A5 5 0 0 1 21 12c0 1-3 6-9 6h-1m-6 1L19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {isNewPasswordValid || (
                <p className="text-red-400 text-sm -mt-3">
                  *{newPasswordErrorMessage}
                </p>
              )}{" "}
              {unmetConditions.length > 0 && (
                <div>
                  <p></p>
                  <ul className="text-red-500">
                    {unmetConditions.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  required
                  className={`rounded-3xl border ${
                    isConfirmPasswordValid
                      ? "border-gray-200"
                      : "border-red-500"
                  } text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] pl-12 focus:ring-2 ring-offset-2 ring-gray-900 outline-0`}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setIsConfirmPasswordValid(true);
                    setConfirmPasswordErrorMessage("");
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
                  {isConfirmPasswordVisible ? (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 14c-.5-.6-.9-1.3-1-2 0-1 4-6 9-6m7.6 3.8A5 5 0 0 1 21 12c0 1-3 6-9 6h-1m-6 1L19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {isConfirmPasswordValid || (
                <p className="text-red-400 text-sm -mt-3">
                  *{confirmPasswordErrorMessage}
                </p>
              )}
              <button
                type="submit"
                onClick={handlePasswordClick}
                className="bg-[#4ce13f] w-max m-auto px-10 py-2 rounded-2xl text-white text-sm font-normal transition duration-200 ease-in-out hover:bg-[#3aa72f] active:bg-[#2d801e] focus:outline-none">
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
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
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white p-6 rounded-md shadow-lg flex items-center justify-center flex-col">
              <p className="text-green-500 text-lg">
                Password Changed Successfully
              </p>
              <button
                className="mt-4 bg-[#4ce13f] px-4 py-2 rounded text-white "
                onClick={() => setShowSuccessPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showOTPPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-opacity-80 bg-gray-800 text-white flex items-center justify-center z-50">
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white p-6 rounded-md shadow-lg flex items-center justify-center flex-col">
              <p className="text-black text-lg">{message}</p>
              <button
                className="mt-4 bg-[#4ce13f] px-4 py-2 rounded text-white "
                onClick={() => setShowOTPPopup(false)}>
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
};

export default Login;

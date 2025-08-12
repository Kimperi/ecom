import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
} from "@aws-amplify/auth";

const Login = () => {
  const location = useLocation();
  const message = location.state?.message;
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState("Login"); // "Login" | "Sign Up"
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      if (currentState === "Sign Up") {
        if (!isConfirmStep) {
          await signUp({
            username: email,
            password,
            options: { userAttributes: { email, name: fullName } },
          });
          setMsg("Verification code sent to your email.");
          setIsConfirmStep(true);
        } else {
          await confirmSignUp({ username: email, confirmationCode: code });
          setMsg("Account confirmed. Please log in.");
          setIsConfirmStep(false);
          setCurrentState("Login");
        }
      } else {
        await signIn({ username: email, password });
        setMsg("Signed in successfully.");
        window.location.href = "/";
      }
    } catch (e) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setMsg("Password reset code sent to your email.");
      setIsResetStep(true);
    } catch (e) {
      setErr(e?.message || "Could not start password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmReset(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: password,
      });
      setMsg("Password changed. Please log in.");
      setIsResetStep(false);
      setCurrentState("Login");
    } catch (e) {
      setErr(e?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={isResetStep ? handleConfirmReset : handleSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="flex items-center ">
        {message && (
          <p className=" text-red-600 text-3xl px-5 py-5">{message}</p>
        )}
        {/* your login form here */}
      </div>
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">
          {isResetStep
            ? "Reset Password"
            : isConfirmStep
            ? "Confirm Code"
            : currentState}
        </p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {!isResetStep && !isConfirmStep && currentState !== "Login" && (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {!isConfirmStep && (
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder={isResetStep ? "New Password" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}

      {(isConfirmStep || isResetStep) && (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      )}

      {!isResetStep && (
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p className="cursor-pointer" onClick={handleForgotPassword}>
            Forgot your password?
          </p>
          {currentState === "Login" ? (
            <p
              onClick={() => {
                setCurrentState("Sign Up");
                setIsConfirmStep(false);
                setErr("");
                setMsg("");
              }}
              className="cursor-pointer"
            >
              Create account
            </p>
          ) : (
            <p
              onClick={() => {
                setCurrentState("Login");
                setIsConfirmStep(false);
                setErr("");
                setMsg("");
              }}
              className="cursor-pointer"
            >
              Login Here
            </p>
          )}
        </div>
      )}

      <button
        disabled={loading}
        className="bg-black text-white font-light px-8 py-2 mt-4 disabled:opacity-60"
      >
        {loading
          ? "Please wait…"
          : isResetStep
          ? "Confirm Reset"
          : isConfirmStep
          ? "Confirm Sign Up"
          : currentState === "Login"
          ? "Sign in"
          : "Sign Up"}
      </button>

      {msg && <p className="text-green-700 text-sm mt-2">{msg}</p>}
      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
    </form>
  );
};

export default Login;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const data = new FormData();
      data.append("email", formData.email);
      data.append("password", formData.password);
      
      const response = await axios.post("/api/users/login", data);
      
      if (!response.data.isVerified) {
        setError("AUTHENTICATION FAILED: EMAIL UNVERIFIED");
        toast.error("Please verify your email first", {
          style: { background: '#020617', color: '#06b6d4', border: '1px solid #06b6d4' }
        });
        return;
      }
      
      if (response.data.role === "municipal_staff") {
        router.push("/department");
      } else {
        router.push("/user-profile");
      }
      
      setFormData({
        email: "",
        password: "",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "UPLINK FAILED. PLEASE RETRY.";
      setError(`ERROR: ${errorMessage}`);
      console.log(error);
      toast.error(errorMessage, {
        style: { background: '#020617', color: '#ef4444', border: '1px solid #ef4444' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden z-10">
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-0" />

      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full relative z-10 text-center border border-cyan-500/30 rounded-2xl px-8 py-10 bg-gray-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] group"
      >
        {/* Decorative corner markers */}
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none rounded-tl-2xl"></div>
        <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none rounded-tr-2xl"></div>
        <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none rounded-bl-2xl"></div>
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none rounded-br-2xl"></div>

        <Link href={"/"}>
          <div className="flex justify-start text-cyan-500 hover:text-cyan-300 transition-colors cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
              />
            </svg>
          </div>
        </Link>
        <h1 className="text-white text-3xl mt-6 font-bold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          Auth_Gateway
        </h1>
        <p className="text-cyan-400/70 font-mono text-sm mt-2 tracking-widest uppercase">
          Enter credentials to proceed
        </p>
        
        {/* Email Input */}
        <div className="flex items-center w-full mt-10 bg-black/50 border border-cyan-500/40 h-12 rounded-lg overflow-hidden pl-4 gap-3 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]">
          <svg
            width="16"
            height="11"
            viewBox="0 0 16 11"
            fill="none"
            className="text-cyan-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
              fill="currentColor"
            />
          </svg>
          <input
            type="email"
            name="email"
            placeholder="OPERATOR_ID"
            value={formData.email}
            onChange={handleChange}
            className="bg-transparent text-cyan-100 placeholder-cyan-700 outline-none text-sm w-full h-full font-mono uppercase tracking-wider"
            required
          />
        </div>
        
        {/* Password Input */}
        <div className="flex items-center mt-6 w-full bg-black/50 border border-cyan-500/40 h-12 rounded-lg overflow-hidden pl-4 gap-3 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]">
          <svg
            width="13"
            height="17"
            viewBox="0 0 13 17"
            fill="none"
            className="text-cyan-500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
              fill="currentColor"
            />
          </svg>
          <input
            type="password"
            name="password"
            placeholder="ACCESS_CODE"
            value={formData.password}
            onChange={handleChange}
            className="bg-transparent text-cyan-100 placeholder-cyan-700 outline-none text-sm w-full h-full font-mono tracking-wider"
            required
          />
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-2 bg-red-950/50 border border-red-500/50 rounded flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
            <p className="text-red-400 font-mono text-xs text-left w-full break-words tracking-wide">{error}</p>
          </div>
        )}

        <div className="mt-6 text-left w-full flex justify-end">
          <a className="text-xs font-mono text-cyan-500 hover:text-cyan-300 hover:underline underline-offset-4 tracking-widest uppercase transition-colors" href="#">
            Recover_Code?
          </a>
        </div>
        
        <button
          type="submit"
          className="mt-6 w-full h-12 rounded-lg text-cyan-300 bg-cyan-500/10 border border-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-300 font-bold uppercase tracking-[0.2em] relative overflow-hidden group"
        >
          <span className="relative z-10">Authenticate</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>
        
        <p className="text-slate-500 font-mono text-xs mt-6 uppercase tracking-wider">
          Unregistered node?{" "}
          <Link className="text-cyan-400 hover:text-cyan-300 hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all" href={`/signup`}>
            Request_Access
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
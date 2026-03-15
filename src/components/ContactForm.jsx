'use client'
import React, { useState } from "react";

const ContactForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);

    // Here you can send data to an API or service
    // fetch("/api/contact", { method: "POST", body: JSON.stringify(formData) })
    //TODO: Call the form data post API

    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center text-sm text-slate-300 m-4 relative z-10"
    >
      {/* HUD-style Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

      {/* Heading */}
      <h1 className="text-4xl font-bold py-4 text-center text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] tracking-wide uppercase mt-6">
        TRANSMIT DATA.
      </h1>

      {/* Subtext */}
      <p className="max-md:text-sm text-gray-400 pb-10 text-center tracking-wide">
        Establish manual connection at{" "}
        <a
          href="mailto:help@civicbuddy.com"
          className="text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_8px_rgba(6,182,212,0.8)] transition duration-300"
        >
          sysadmin@autointel.gov
        </a>
      </p>

      {/* Form Fields */}
      <div className="max-w-96 w-full px-8 py-8 text-white bg-gray-950/60 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl-3xl opacity-50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 rounded-tr-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 rounded-bl-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br-3xl opacity-50"></div>

        {/* Name */}
        <label htmlFor="name" className="font-semibold text-xs tracking-widest text-cyan-400 uppercase">
          Operator ID
        </label>
        <div className="flex items-center mt-2 mb-6 h-12 pl-4 border border-slate-700 bg-black/50 rounded-full focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all overflow-hidden shadow-inner">
          {/* Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-600"
          >
            <path
              d="M18.311 16.406a9.64 9.64 0 0 0-4.748-4.158 5.938 5.938 0 1 0-7.125 0 9.64 9.64 0 0 0-4.749 4.158.937.937 0 1 0 1.623.938c1.416-2.447 3.916-3.906 6.688-3.906 2.773 0 5.273 1.46 6.689 3.906a.938.938 0 0 0 1.622-.938M5.938 7.5a4.063 4.063 0 1 1 8.125 0 4.063 4.063 0 0 1-8.125 0"
              fill="currentColor"
            />
          </svg>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="h-full px-3 w-full outline-none bg-transparent placeholder-slate-600 font-mono text-sm"
            placeholder="Enter designation"
            required
          />
        </div>

        {/* Email */}
        <label htmlFor="email" className="font-semibold text-xs tracking-widest text-cyan-400 uppercase mt-4">
          Secure Channel
        </label>
        <div className="flex items-center mt-2 mb-6 h-12 pl-4 border border-slate-700 bg-black/50 rounded-full focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all overflow-hidden shadow-inner">
          {/* Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-600"
          >
            <path
              d="M17.5 3.438h-15a.937.937 0 0 0-.937.937V15a1.563 1.563 0 0 0 1.562 1.563h13.75A1.563 1.563 0 0 0 18.438 15V4.375a.94.94 0 0 0-.938-.937m-2.41 1.874L10 9.979 4.91 5.313zM3.438 14.688v-8.18l5.928 5.434a.937.937 0 0 0 1.268 0l5.929-5.435v8.182z"
              fill="currentColor"
            />
          </svg>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="h-full px-3 w-full outline-none bg-transparent placeholder-slate-600 font-mono text-sm"
            placeholder="Enter comm frequency"
            required
          />
        </div>

        {/* Message */}
        <label htmlFor="message" className="font-semibold text-xs tracking-widest text-cyan-400 uppercase mt-4">
          Payload Data
        </label>
        <textarea
          id="message"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          className="w-full mt-2 p-4 bg-black/50 border border-slate-700 rounded-2xl resize-none outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner placeholder-slate-600 font-mono text-sm"
          placeholder="Awaiting data stream..."
          required
        ></textarea>

        {/* Submit Button */}
        <button
          type="submit"
          className="group flex items-center justify-center gap-2 mt-8 bg-cyan-500/10 border border-cyan-400 hover:bg-cyan-400 hover:text-black text-cyan-300 py-3 w-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] font-bold tracking-widest uppercase text-xs"
        >
          Initialize Upload
          <svg
            className="mt-0.5 group-hover:translate-x-1 transition-transform"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m18.038 10.663-5.625 5.625a.94.94 0 0 1-1.328-1.328l4.024-4.023H3.625a.938.938 0 0 1 0-1.875h11.484l-4.022-4.025a.94.94 0 0 1 1.328-1.328l5.625 5.625a.935.935 0 0 1-.002 1.33"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ContactForm;

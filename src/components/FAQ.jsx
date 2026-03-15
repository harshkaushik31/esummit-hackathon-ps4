'use client'
import React, { useState } from 'react';

const FAQ = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center px-4 md:px-0 relative z-10 w-full">
      <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mt-12 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">System Queries</p>
      <h1 className="text-3xl font-bold text-center text-white mt-2 tracking-wide">KNOWLEDGE BASE</h1>
      <p className="text-sm text-slate-400 mt-3 pb-8 text-center font-mono">
        Review commonly requested operational parameters and intelligence gathering protocols.
      </p>

      <div className="w-full flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border border-slate-700 bg-gray-950/60 backdrop-blur-md rounded-xl p-4 cursor-pointer transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] ${openIndex === index ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''} group`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-slate-200 font-mono group-hover:text-cyan-300 transition-colors duration-300">
                <span className="text-cyan-500 mr-2 opacity-70">[{String(index + 1).padStart(2,'0')}]</span>
                {faq.question}
              </h3>
              <div className={`p-1 rounded-full border border-slate-700 bg-black/50 transition-colors duration-300 group-hover:border-cyan-500/50 ${openIndex === index ? 'bg-cyan-500/20 border-cyan-400' : ''}`}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${openIndex === index ? 'rotate-180 text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'} transition-all duration-500 ease-in-out drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]`}
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === index
                  ? 'opacity-100 max-h-[500px] mt-4'
                  : 'opacity-0 max-h-0'
              }`}
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-cyan-500/0 mb-3" />
              <p className="text-sm text-slate-400 leading-relaxed font-sans pl-8 border-l-2 border-cyan-500/30 ml-2">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;

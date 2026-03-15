import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="relative z-10 w-full mt-20">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      <footer className="flex flex-col md:flex-row gap-4 items-center justify-around w-full py-6 text-xs font-mono bg-gray-950 backdrop-blur-md text-slate-400 uppercase tracking-widest">
        <p className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
          SYS.LOG_END // © 2025 AUTO-INTEL CORP.
        </p>

        <div className="flex items-center gap-6">
          <Link href={`/contact`} className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-300">
            TRANSMIT
          </Link>

          <div className="h-4 w-px bg-cyan-500/20 rotate-12"></div>

          <Link href={`/privacy`} className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-300">
            PROTOCOLS
          </Link>

          <div className="h-4 w-px bg-cyan-500/20 rotate-12"></div>

          <Link href={'/about'} className="hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-300">
            ARCHITECTURE
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

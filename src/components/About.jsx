import Image from 'next/image';
import React from 'react';

const About = () => {
  return (
    <div className="py-20 relative z-10">
      <h1 className="text-3xl font-bold text-center mx-auto text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">SYSTEM ARCHITECTURE</h1>

      <p className="text-sm text-cyan-400 font-mono text-center mt-3 max-w-xl mx-auto tracking-widest opacity-80">
        A VISUAL REPRESENTATION OF OUR CORE INTELLIGENCE MODULES AND CAPABILITIES.
      </p>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 px-6 md:px-0 py-16">
        
        {/* Holographic Image Container */}
        <div className="max-w-sm w-full relative p-1 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-gray-900 to-teal-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] group">
           {/* Decorative corner markers */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-20"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-20"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-20"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-20"></div>
          
          <div className="rounded-[15px] overflow-hidden bg-gray-950 relative">
            <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay z-10 group-hover:bg-cyan-400/20 transition-all duration-500"></div>
            <Image
              src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&w=830&h=844&auto=format&fit=crop"
              alt="System Core"
              width={400}
              height={500}
              className="w-full h-auto object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20 pointer-events-none"></div>
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-2 flex items-center gap-3">
             <span className="w-2 h-6 bg-cyan-500 block animate-pulse"></span>
             CORE PROTOCOLS
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-mono leading-relaxed mb-10">
            Deploying civic infrastructure AI analysis tools with unprecedented accuracy and speed.
          </p>

          <div className="flex flex-col gap-8">

            {/* Feature 1 */}
            <div className="flex items-start gap-5 group">
              <div className="mt-1 size-10 flex items-center justify-center bg-gray-900 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-cyan-300 transition-colors">Lightning-Fast Analysis</h3>
                <p className="text-sm text-slate-500 font-mono mt-1 leading-relaxed">Processing live telemetry with sub-second latency.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-5 group">
              <div className="mt-1 size-10 flex items-center justify-center bg-gray-900 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-cyan-300 transition-colors">Computer Vision Nodes</h3>
                <p className="text-sm text-slate-500 font-mono mt-1 leading-relaxed">Advanced neural heuristics mapping road anomalies seamlessly.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-5 group">
              <div className="mt-1 size-10 flex items-center justify-center bg-gray-900 border border-cyan-500/30 rounded-lg group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-cyan-300 transition-colors">Secure Uplink</h3>
                <p className="text-sm text-slate-500 font-mono mt-1 leading-relaxed">Encrypted data handshakes directly to municipal databases.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

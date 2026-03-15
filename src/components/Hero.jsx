"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 192;

const Hero = () => {
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Preload images for smooth scrubbing
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;
    
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const frameNum = i.toString().padStart(3, '0');
      img.src = `/scrollImages/frame_${frameNum}_delay-0.041s.webp`;
      img.onload = () => {
        loadedCount++;
        // Initial draw once first image is ready
        if (i === 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Handle GSAP Scroll Animation
  useGSAP(() => {
    if (images.length === 0 || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Handle Resize for Canvas inside GSAP
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (images[0] && images[0].complete) {
        ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const frameData = { frame: 0 };

    const render = (index) => {
      const img = images[index];
      if (img && img.complete && img.naturalHeight !== 0 && canvas.width > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    // Use a timeline to synchronize video scrub and text fade out
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=3000",
        pin: true,
        scrub: 0.5,
        anticipatePin: 1
      }
    });

    // Image sequence scrub
    tl.to(frameData, {
      frame: TOTAL_FRAMES - 1,
      snap: "frame",
      ease: "none",
      onUpdate: () => render(frameData.frame),
      duration: TOTAL_FRAMES
    }, 0);

    // Fade out Hero Text in the first 20% of the scroll
    if (contentRef.current) {
      tl.to(contentRef.current, {
        y: -50,
        opacity: 0,
        ease: "power1.inOut",
        duration: TOTAL_FRAMES * 0.2
      }, 0);
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      tl.kill();
    };
  }, [images]);

  // Navbar Mobile Toggle
  useEffect(() => {
    const toggleBtn = toggleRef.current;
    const navMenu = navRef.current;

    const handleToggle = () => {
      if(navMenu) navMenu.classList.toggle("hidden");
    };

    if(toggleBtn) toggleBtn.addEventListener("click", handleToggle);
    return () => {
      if(toggleBtn) toggleBtn.removeEventListener("click", handleToggle);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {/* Absolute Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
      />
      {/* Deep asphalt overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none" />

      {/* Floating UI Container */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center z-10 pt-4">
        
        {/* Holographic Navbar */}
        <nav className="pointer-events-auto flex items-center justify-between px-6 md:px-16 py-4 border border-cyan-500/30 rounded-full bg-black/50 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium w-[95%] max-w-7xl relative mx-auto z-[60]">
          {/* Logo */}
          <Logo/> 

          {/* Hamburger (Mobile) */}
          <button
            ref={toggleRef}
            className="md:hidden text-cyan-400 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Nav Links */}
          <ul
            ref={navRef}
            className="hidden max-md:absolute top-full left-0 max-md:w-full md:flex md:items-center gap-8 max-md:bg-gray-950 max-md:shadow-cyan-500/20 max-md:px-6 max-md:py-4 flex-col md:flex-row z-50 max-md:rounded-2xl max-md:border max-md:border-cyan-500/30 max-md:mt-2 uppercase tracking-wider text-xs"
          >
            {["Home", "About", "Privacy", "Contact"].map((item, i) => (
              <li key={i}>
                <Link
                  className="text-slate-300 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300"
                  href={item === 'Home' ? '/' : item.toLowerCase()}
                >
                  {item}
                </Link>
              </li>
            ))}
            {/* Login button for mobile */}
            <Link href={`login`} className="block md:hidden mt-4">
              <button className="group flex items-center gap-2 text-cyan-400">
                LOG IN
                <svg className="group-hover:translate-x-1 transition pt-0.5" width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5h10.182m-4-3.5 4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Link>
          </ul>

          {/* Login button for desktop */}
          <div>
            <Link href={`login`}>
              <button className="group hidden md:flex items-center gap-2 text-slate-300 hover:text-cyan-400 uppercase tracking-wider text-xs transition duration-300">
                LOG IN
                <svg className="group-hover:translate-x-1 transition pt-0.5" width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4.5h10.182m-4-3.5 4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero Content (Centered) */}
        <div ref={contentRef} className="flex-1 flex flex-col items-center justify-center px-4 text-center pointer-events-auto shrink-0 w-full mb-[10vh]">
          <h2 className="text-cyan-400 uppercase tracking-[0.2em] text-sm md:text-md mb-4 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
            Autonomous Pothole Intelligence
          </h2>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold max-w-4xl text-white drop-shadow-2xl">
            Detect. Lock. Report.
          </h1>
          <p className="text-slate-400 mt-6 max-w-2xl text-lg mix-blend-screen shadow-black">
            {/* Scroll down to engage visual confirmation matrix. */}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link href={`/login`}>
              <button className="px-8 py-3 rounded-full cursor-pointer bg-cyan-500/10 border border-cyan-400 text-cyan-300 font-bold uppercase tracking-widest text-sm hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all duration-300 transform hover:scale-105 backdrop-blur-md">
                Initiate Sequence
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;

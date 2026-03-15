"use client";
import React, { useRef, useState } from "react";
import { TestimonialCard } from "./TestimonialCard";
const testimonials = [
  {
    name: "Aditya Tripathi",
    title: "Resident, New Delhi",
	mainTitle: "Easy to Use",
    message:
      "Civic Buddy made it so easy to report a broken streetlight in my area. Within days, it was fixed! The process was simple and transparent.",
    image:
      "https://res.cloudinary.com/dpcal7pun/image/upload/v1759388142/WhatsApp_Image_2025-08-05_at_10.52.21_AM_eetw5h.jpg",
  },
  {
    name: "Vaibhav Sahu",
    title: "Community Volunteer",
	mainTitle: "The Website Works",
    message:
      "I love how Civic Buddy connects people directly with the right authorities. It has helped our neighborhood stay cleaner and safer.",
    image:
      "https://res.cloudinary.com/dpcal7pun/image/upload/v1759388456/WhatsApp_Image_2025-10-02_at_12.29.11_PM_1_gx4ry6.jpg",
  },
  {
    name: "Tanmay Singh",
    title: "College Student",
	mainTitle: "Very Easy to Integerate",
    message:
      "Reporting potholes and waste management issues has never been easier. Civic Buddy saves time and actually gets results!",
    image:
      "https://res.cloudinary.com/dpcal7pun/image/upload/v1759388584/WhatsApp_Image_2025-10-02_at_12.27.54_PM_1_iwn4ur.jpg",
  },
];

const Testimonial = () => {
	const [tooltip, setTooltip] = useState({
		visible: false,
		x: 0,
		y: 0,
		text: "",
	});
	const cardRefs = useRef([]);

	const handleMouseMove = (e, index) => {
		const bounds = cardRefs.current[index].getBoundingClientRect();
		setTooltip({
			visible: true,
			x: e.clientX - bounds.left,
			y: e.clientY - bounds.top,
			text: testimonials[index].name,
		});
	};

	const handleMouseLeave = () => {
		setTooltip((prev) => ({ ...prev, visible: false }));
	};

	return (
		<div className="py-20 px-4 relative z-10 w-full flex flex-col items-center">
			{/* Decorative Top Border */}
			<div className="w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-12"></div>
			
			<h1 className="text-center text-4xl font-bold text-white tracking-wide uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
				OPERATOR LOGS
			</h1>
			<p className="text-center text-cyan-400 font-mono text-sm mt-3 tracking-widest max-w-xl opacity-80">
				CIVILIAN FEEDBACK AND SYSTEM INTEGRATION CONFIRMATIONS.
			</p>
			
			<div className="flex flex-wrap items-center justify-center gap-8 mt-16 max-w-7xl mx-auto">
				{testimonials.map((testimonial, index) => (
					<TestimonialCard
						key={index}
						testimonial={testimonial}
						index={index}
						cardRefs={cardRefs}
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						tooltip={tooltip}
					/>
				))}
			</div>
			
			{/* Decorative Bottom Border */}
			<div className="w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-20"></div>
		</div>
	);
};

export default Testimonial;

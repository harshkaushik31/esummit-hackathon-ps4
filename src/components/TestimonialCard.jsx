export const TestimonialCard = ({ testimonial, index, cardRefs, onMouseMove, onMouseLeave, tooltip }) => (
  <div
    className="relative border border-cyan-500/20 bg-gray-950/80 backdrop-blur-md rounded-2xl overflow-hidden max-w-sm hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 group"
  >
    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-cyan-500/20 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>

    <div className="flex flex-col items-start justify-center p-8 text-left z-10 relative">
      <div className="mb-6 text-white w-full">
        <h3 className="text-xl font-bold text-white tracking-wider group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">{testimonial.mainTitle}</h3>
        <p className="my-4 text-sm leading-relaxed text-slate-300 font-serif opacity-90 italic">"{testimonial.message}"</p>
      </div>
      <div className="flex items-center justify-start w-full pt-4 border-t border-slate-800">
        <img
          className="rounded-full w-10 h-10 border-2 border-cyan-500/50 object-cover shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          src={testimonial.image}
          alt={`${testimonial.name} profile`}
        />
        <div className="space-y-1 font-medium text-left ml-4">
          <p className="text-sm font-bold text-white tracking-widest uppercase">{testimonial.name}</p>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">{testimonial.title}</p>
        </div>
      </div>
    </div>
  </div>
);
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- ANIMATION CONFIGURATION ---
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.1,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const HeroCarousel = ({ slides, autoPlayInterval = 5000 }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  // Wrap around logic using modulus
  const imageIndex = Math.abs(page % slides.length);

  const paginate = useCallback(
    (newDirection) => {
      setPage([page + newDirection, newDirection]);
    },
    [page]
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [page, isPaused, autoPlayInterval, paginate]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 }, // The "Butter" feel
            opacity: { duration: 0.2 },
            scale: { duration: 0.5 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Responsive Picture */}
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet={slides[imageIndex].desktopSrc}
            />
            <source
              media="(min-width: 768px)"
              srcSet={slides[imageIndex].tabletSrc}
            />
            <img
              src={slides[imageIndex].mobileSrc}
              alt={slides[imageIndex].altText || "Hero Image"}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </picture>

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 pointer-events-none" />

          {/* Dynamic Slide Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 pointer-events-none p-4">
            {slides[imageIndex].title && (
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-2xl"
              >
                {slides[imageIndex].title}
              </motion.h2>
            )}
            {slides[imageIndex].subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-2xl font-light mt-2 drop-shadow-md"
              >
                {slides[imageIndex].subtitle}
              </motion.p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4 z-20 pointer-events-none">
        <button
          className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md text-white transition-all"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md text-white transition-all"
          onClick={() => paginate(1)}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const direction = index > imageIndex ? 1 : -1;
              setPage([page + (index - imageIndex), direction]);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === imageIndex ? "w-8 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

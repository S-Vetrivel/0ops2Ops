import React from "react";
import { motion } from "framer-motion";

const HeroImage = ({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  altText = "Hero Image",
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* <picture> allows us to specify different images for different viewport widths.
        Browser loads ONLY the correct image, saving bandwidth.
      */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full h-full"
      >
        <picture>
          {/* Desktop Image (min-width: 1024px) */}
          <source media="(min-width: 1024px)" srcSet={desktopSrc} />

          {/* Tablet Image (min-width: 768px) */}
          <source media="(min-width: 768px)" srcSet={tabletSrc} />

          {/* Mobile Image (Default fallback) */}
          <img
            src={mobileSrc}
            alt={altText}
            className="w-full h-full object-cover object-center"
          />
        </picture>
      </motion.div>

      {/* Optional Gradient Overlay for text readability if needed later */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
};

export default HeroImage;

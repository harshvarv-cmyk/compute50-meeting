import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { photos } from '../../data/photos';

export const PhotoStrip: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // If no photos or fewer than 2 photos are present, render nothing
  if (!photos || photos.length < 2) {
    return null;
  }

  // Display at most 4 photos
  const displayPhotos = photos.slice(0, 4);
  const rotations = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3'];

  return (
    <section aria-label="Photo Gallery" className="py-8">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 px-4">
        {displayPhotos.map((imgSrc, idx) => {
          const rotationClass = rotations[idx % rotations.length];

          return (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative bg-white text-slate-800 p-3 pb-8 rounded-lg shadow-xl border border-slate-200 transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:z-10 ${
                shouldReduceMotion ? '' : rotationClass
              }`}
            >
              <div className="w-48 h-48 sm:w-56 sm:h-56 overflow-hidden rounded-md bg-slate-100">
                <img
                  src={imgSrc}
                  alt={`Memory ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

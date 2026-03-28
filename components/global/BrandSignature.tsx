'use client';

import { motion } from 'framer-motion';

/**
 * BrandSignature — premium animated watermark.
 * Fixed bottom-right on desktop, bottom-center on mobile.
 * pointer-events: none — never blocks any UI interaction.
 */
export default function BrandSignature() {
  return (
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        .brand-sig-wrap {
          pointer-events: none;
          position: fixed;
          bottom: 20px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 0;
          user-select: none;
        }
        @media (max-width: 640px) {
          .brand-sig-wrap {
            right: 50%;
            transform: translateX(50%);
            bottom: 14px;
          }
        }
        .brand-sig-inner {
          position: relative;
          padding: 5px 13px;
          border-radius: 99px;
          animation: floatY 5s ease-in-out infinite;
          opacity: 0.68;
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .brand-sig-inner:hover {
          opacity: 1;
          transform: scale(1.05) translateY(-1px);
        }
        /* Blurred glow blob behind text */
        .brand-sig-glow {
          position: absolute;
          inset: -4px -8px;
          border-radius: 99px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%);
          opacity: 0.08;
          filter: blur(10px);
          pointer-events: none;
          transition: opacity 0.4s ease;
        }
        .brand-sig-inner:hover .brand-sig-glow {
          opacity: 0.18;
        }
        /* Very subtle glass rim */
        .brand-sig-rim {
          position: absolute;
          inset: 0;
          border-radius: 99px;
          border: 1px solid rgba(99,102,241,0.12);
          background: rgba(9, 13, 25, 0.35);
          backdrop-filter: blur(6px);
          pointer-events: none;
        }
        /* Animated gradient text */
        .brand-sig-text {
          position: relative;
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.03em;
          background: linear-gradient(
            90deg,
            #818cf8 0%,
            #60a5fa 30%,
            #22d3ee 60%,
            #818cf8 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: gradientShift 7s ease-in-out infinite;
          white-space: nowrap;
          line-height: 1;
        }
      `}</style>

      <motion.div
        className="brand-sig-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <div className="brand-sig-inner">
          {/* Glow blob */}
          <div className="brand-sig-glow" />
          {/* Glass rim */}
          <div className="brand-sig-rim" />
          {/* Text */}
          <span className="brand-sig-text">
            Made by Madani Kavya
          </span>
        </div>
      </motion.div>
    </>
  );
}

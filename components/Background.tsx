import * as React from 'react';
import { motion } from 'framer-motion';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-noble-dark pointer-events-none">
      {/* Base Noise Texture for film grain feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Deep Green Fog - Bottom Left */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-green-950 blur-[120px] opacity-40 mix-blend-screen" />
      
      {/* Golden Glow - Top Right (Sunlight through leaves) */}
      <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#3a3521] blur-[100px] opacity-30 mix-blend-screen" />

      {/* Animated Particles / Fireflies */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-noble-gold opacity-20"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            scale: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -100],
            opacity: [0, 0.4, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
          }}
        />
      ))}
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
};

export default Background;
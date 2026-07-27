'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'alternate' | 'subtle';
  showGrid?: boolean;
  showParticles?: boolean;
  showLines?: boolean;
}

export function AnimatedBackground({ 
  variant = 'default',
  showGrid = true,
  showParticles = true,
  showLines = true
}: AnimatedBackgroundProps) {
  const getColors = () => {
    switch (variant) {
      case 'alternate':
        return {
          orb1: 'bg-gradient-to-r from-secondary-400/30 to-accent-green-400/30 dark:from-secondary-600/20 dark:to-accent-green-600/20',
          orb2: 'bg-gradient-to-l from-accent-orange-400/30 to-primary-400/20 dark:from-accent-orange-600/20 dark:to-primary-600/10',
          orb3: 'bg-gradient-to-br from-accent-yellow-400/20 to-secondary-400/20 dark:from-accent-yellow-600/10 dark:to-secondary-600/10',
        };
      case 'subtle':
        return {
          orb1: 'bg-gradient-to-r from-primary-300/20 to-secondary-300/20 dark:from-primary-700/15 dark:to-secondary-700/15',
          orb2: 'bg-gradient-to-l from-secondary-300/20 to-accent-orange-300/15 dark:from-secondary-700/15 dark:to-accent-orange-700/10',
          orb3: 'bg-gradient-to-br from-accent-green-300/15 to-primary-300/15 dark:from-accent-green-700/10 dark:to-primary-700/10',
        };
      default:
        return {
          orb1: 'bg-gradient-to-r from-primary-400/30 to-secondary-400/30 dark:from-primary-600/20 dark:to-secondary-600/20',
          orb2: 'bg-gradient-to-l from-secondary-400/30 to-accent-orange-400/20 dark:from-secondary-600/20 dark:to-accent-orange-600/10',
          orb3: 'bg-gradient-to-br from-accent-green-400/20 to-primary-400/20 dark:from-accent-green-600/10 dark:to-primary-600/10',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Grid Pattern */}
      {showGrid && (
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" 
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }}
        />
      )}

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${colors.orb1} rounded-full blur-3xl`}
      />
      
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute bottom-1/4 right-1/4 w-[600px] h-[600px] ${colors.orb2} rounded-full blur-3xl`}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className={`absolute top-1/2 right-1/3 w-[400px] h-[400px] ${colors.orb3} rounded-full blur-3xl`}
      />

      {/* Floating Particles */}
      {showParticles && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
              className="absolute w-1 h-1 bg-primary-500/30 dark:bg-primary-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </>
      )}

      {/* Animated Lines */}
      {showLines && (
        <>
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
            className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
          />
          
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              delay: 1.5,
              ease: 'easeInOut',
            }}
            className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary-500/30 to-transparent"
          />
        </>
      )}
    </div>
  );
}



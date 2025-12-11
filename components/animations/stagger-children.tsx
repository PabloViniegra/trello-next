'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type TStaggerChildrenProps = {
  children: ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (custom: { staggerDelay: number; initialDelay: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.initialDelay,
      staggerChildren: custom.staggerDelay,
    },
  }),
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
}: TStaggerChildrenProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      custom={{ staggerDelay, initialDelay }}
    >
      {children}
    </motion.div>
  )
}

type TStaggerItemProps = {
  children: ReactNode
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  },
}

export function StaggerItem({ children, className }: TStaggerItemProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}

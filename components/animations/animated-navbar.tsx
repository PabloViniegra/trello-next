'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type TAnimatedNavbarProps = {
  children: ReactNode
  className?: string
}

export function AnimatedNavbar({ children, className }: TAnimatedNavbarProps) {
  return (
    <motion.nav
      className={className}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.nav>
  )
}

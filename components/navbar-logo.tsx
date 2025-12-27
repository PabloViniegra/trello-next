'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GradientText } from '@/components/ui/gradient-text'

const MotionLink = motion.create(Link)

export function NavbarLogo() {
  return (
    <MotionLink
      href='/'
      className='text-xl font-bold'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
    >
      <GradientText
        colors={['#7f6a3f', '#deb6a0', '#9383b2', '#7f6a3f']}
        animationSpeed={5}
      >
        Trello Clone
      </GradientText>
    </MotionLink>
  )
}

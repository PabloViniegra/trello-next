import { HeroSection } from '@/components/hero-section'
import { Navbar } from '@/components/navbar'

export const dynamic = 'force-dynamic'

export default async function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  )
}

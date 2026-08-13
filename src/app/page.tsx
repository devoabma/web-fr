import { DashboardPreview } from '@/components/app/dashboard-preview'
import { Features } from '@/components/app/features'
import { Footer } from '@/components/app/footer'
import { Header } from '@/components/app/header'
import { HeroContent } from '@/components/app/hero-content'

export default function Home() {
  return (
    <>
      <Header />
      <HeroContent />
      <DashboardPreview />
      <Features />
      <Footer />
    </>
  )
}

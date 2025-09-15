'use client'

import { Providers } from './providers'
import { Header } from '../components/header'
import { HeroSection } from '../components/HeroSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { ApiDemoSection } from '../components/ApiDemoSection'
import { PricingSection } from '../components/PricingSection'
import { TestimonialsSection } from '../components/TestimonialsSection'

import { Footer } from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function HomeContent() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboards')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full">
        <HeroSection />
        <FeaturesSection />
        <ApiDemoSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  )
}


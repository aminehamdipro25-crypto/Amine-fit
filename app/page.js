import Navbar          from '@/components/landing/Navbar'
import Hero            from '@/components/landing/Hero'
import Stats           from '@/components/landing/Stats'
import About           from '@/components/landing/About'
import Services        from '@/components/landing/Services'
import HowItWorks      from '@/components/landing/HowItWorks'
import PlatformTour    from '@/components/landing/PlatformTour'
import Pricing         from '@/components/landing/Pricing'
import Calculator      from '@/components/landing/Calculator'
import Testimonials    from '@/components/landing/Testimonials'
import Results         from '@/components/landing/Results'
import FAQ             from '@/components/landing/FAQ'
import ContactSection  from '@/components/landing/ContactSection'
import Footer          from '@/components/landing/Footer'
import WhatsAppButton  from '@/components/landing/WhatsAppButton'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Services />
        <HowItWorks />
        <PlatformTour />
        <Pricing />
        <Calculator />
        <Testimonials />
        <Results />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

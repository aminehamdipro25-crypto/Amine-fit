import Navbar          from '@/components/landing/Navbar'
import PromoBanner     from '@/components/landing/PromoBanner'
import Hero            from '@/components/landing/Hero'
import Stats           from '@/components/landing/Stats'
import About           from '@/components/landing/About'
import Services        from '@/components/landing/Services'
import HowItWorks      from '@/components/landing/HowItWorks'
import Pricing         from '@/components/landing/Pricing'
import Calculator      from '@/components/landing/Calculator'
import Testimonials    from '@/components/landing/Testimonials'
import ContactSection  from '@/components/landing/ContactSection'
import Footer          from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Services />
        <HowItWorks />
        <Pricing />
        <Calculator />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

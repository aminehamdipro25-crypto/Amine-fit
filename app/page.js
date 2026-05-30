import Navbar          from '@/components/landing/Navbar'
import Hero            from '@/components/landing/Hero'
import Stats           from '@/components/landing/Stats'
import About           from '@/components/landing/About'
import Services        from '@/components/landing/Services'
import HowItWorks      from '@/components/landing/HowItWorks'
import Pricing         from '@/components/landing/Pricing'
import Testimonials    from '@/components/landing/Testimonials'
import ContactSection  from '@/components/landing/ContactSection'
import Footer          from '@/components/landing/Footer'

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
        <Pricing />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

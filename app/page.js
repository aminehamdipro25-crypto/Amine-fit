import Navbar          from '@/components/landing/Navbar'
import Hero            from '@/components/landing/Hero'
import VideoSection    from '@/components/landing/VideoSection'
import Stats           from '@/components/landing/Stats'
import About           from '@/components/landing/About'
import Services        from '@/components/landing/Services'
import HowItWorks      from '@/components/landing/HowItWorks'
import PlatformTour    from '@/components/landing/PlatformTour'
import PlanQuiz        from '@/components/landing/PlanQuiz'
import Pricing         from '@/components/landing/Pricing'
import ComparisonTable from '@/components/landing/ComparisonTable'
import Calculator      from '@/components/landing/Calculator'
import Testimonials    from '@/components/landing/Testimonials'
import Results         from '@/components/landing/Results'
import FAQ             from '@/components/landing/FAQ'
import Referral        from '@/components/landing/Referral'
import WaitingList     from '@/components/landing/WaitingList'
import ContactSection  from '@/components/landing/ContactSection'
import Footer          from '@/components/landing/Footer'
import WhatsAppButton  from '@/components/landing/WhatsAppButton'
import ScrollToTop     from '@/components/landing/ScrollToTop'

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <VideoSection />
        <Stats />
        <About />
        <Services />
        <HowItWorks />
        <PlatformTour />
        <PlanQuiz />
        <Pricing />
        <ComparisonTable />
        <Calculator />
        <Testimonials />
        <Results />
        <FAQ />
        <Referral />
        <WaitingList />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </>
  )
}

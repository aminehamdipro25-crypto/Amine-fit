import ContactForm from './ContactForm'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const info = [
  { icon: Phone, label: 'الهاتف', value: '+974 3065 3759', href: 'tel:+97430653759' },
  { icon: Mail,  label: 'البريد', value: 'amine.hamdi.pro25@gmail.com', href: 'mailto:amine.hamdi.pro25@gmail.com' },
  { icon: MapPin,label: 'الموقع', value: 'الدوحة، قطر', href: '#' },
  { icon: Clock, label: 'ساعات العمل', value: 'السبت – الخميس: 8ص – 9م', href: '#' },
]

export default function ContactSection() {
  return (
    <section id="contact"
      className="py-24 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-emerald-400 font-bold text-center text-sm uppercase tracking-wider mb-2">تواصل معنا</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-3">
          ابدأ رحلتك اليوم
        </h2>
        <p className="text-white/60 text-center text-lg max-w-xl mx-auto mb-14">
          أرسل طلبك وسأتواصل معك خلال 24 ساعة لإعداد برنامجك المخصص
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {info.map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl
                  hover:bg-white/10 transition group">
                <div className="w-11 h-11 bg-primary-600/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/60 transition">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-xs mb-0.5">{label}</p>
                  <p className="text-white font-medium text-sm">{value}</p>
                </div>
              </a>
            ))}

            {/* Social hint */}
            <div className="pt-4">
              <p className="text-white/40 text-xs mb-3">تابعنا على</p>
              <div className="flex gap-3">
                {['فيسبوك', 'انستغرام', 'يوتيوب'].map(s => (
                  <span key={s}
                    className="px-3 py-1.5 bg-white/10 border border-white/15 text-white/70 text-xs rounded-full hover:bg-white/20 transition cursor-pointer">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

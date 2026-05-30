import ContactForm from './ContactForm'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const info = [
  { icon: Phone, label: 'الهاتف',      value: '+974 3065 3759',            href: 'tel:+97430653759' },
  { icon: Mail,  label: 'البريد',      value: 'amine.hamdi.pro25@gmail.com', href: 'mailto:amine.hamdi.pro25@gmail.com' },
  { icon: MapPin,label: 'الموقع',      value: 'الدوحة، قطر',              href: '#' },
  { icon: Clock, label: 'ساعات العمل', value: 'السبت – الخميس: 8ص – 9م', href: '#' },
]

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-[#0f0f0f] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-gold-400/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-gold-400/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">تواصل معنا</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          ابدأ رحلتك اليوم
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto mb-14 font-medium">
          أرسل طلبك وسأتواصل معك خلال 24 ساعة لإعداد برنامجك المخصص
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-3">
            {info.map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex items-center gap-4 p-4 bg-white/3 border border-white/8 rounded-2xl hover:border-gold-400/30 hover:bg-white/5 transition group">
                <div className="w-11 h-11 bg-gold-400/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold-400/20 transition">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-0.5 font-medium">{label}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              </a>
            ))}

            <div className="pt-4">
              <p className="text-white/20 text-xs mb-3 font-medium uppercase tracking-wide">تابعنا على</p>
              <div className="flex gap-2">
                {['فيسبوك', 'انستغرام', 'يوتيوب'].map(s => (
                  <span key={s}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/40 text-xs rounded-full hover:border-gold-400/30 hover:text-white/70 transition cursor-pointer font-medium">
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

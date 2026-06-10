'use client'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'هل أحتاج معدات أو صالة رياضية؟',
    a: 'لا — يمكن تصميم البرنامج حسب إمكانياتك: صالة رياضية كاملة، معدات منزلية بسيطة (دمبل + عصا)، أو حتى تمارين الوزن الحر بدون أي معدات. تُذكر ذلك في استبيان التسجيل وسيتكيّف البرنامج معك.',
  },
  {
    q: 'كم من الوقت قبل أرى نتائج؟',
    a: 'يشعر معظم العملاء بتحسن ملحوظ في مستوى الطاقة واللياقة خلال 2–3 أسابيع. أما التغييرات المرئية في الجسم فتبدأ من الأسبوع الرابع وتتسارع بعد الشهر الأول — شريطة الالتزام بالخطة.',
  },
  {
    q: 'ماذا يحدث إذا فاتني أسبوع أو لم أتمكن من التدريب؟',
    a: 'لا مشكلة — هذا أمر وارد جداً. أبلغ مدربك عبر واتساب أو من خلال التقرير الأسبوعي في بوابة العميل، وسيُعدّل البرنامج وفقاً لذلك. الهدف هو الاستمرارية على المدى الطويل وليس الكمال.',
  },
  {
    q: 'ما الفرق بين "نظام التبادل الغذائي" وحساب السعرات التقليدي؟',
    a: 'حساب السعرات يُخبرك "كم" تأكل فقط — نظام التبادل الغذائي ADA يُخبرك "ماذا، متى، وكيف" تأكل. يتيح لك المرونة: تختار من قائمة بدائل غذائية متكافئة دون الحاجة إلى وزن كل شيء.',
  },
  {
    q: 'هل الخطط مناسبة للنساء أيضاً؟',
    a: 'بالتأكيد. جميع الخطط مُصمَّمة بشكل شخصي 100% حسب بيانات كل شخص (الوزن، الطول، العمر، الهدف، المستوى، قيود الصحة). تستخدم معادلة Mifflin-St Jeor الحديثة التي تُعطي حسابات منفصلة ودقيقة للجنسين.',
  },
  {
    q: 'كيف يتم الدفع والتواصل مع المدرب؟',
    a: 'التواصل يتم عبر واتساب حصراً. بعد الاتفاق على الباقة، يرسل المدرب تفاصيل الدفع ثم يُفعِّل حسابك في بوابة العميل التي تتضمن خطتك الغذائية والتدريبية الكاملة.',
  },
  {
    q: 'هل يمكن استخدام بوابة العميل على الهاتف؟',
    a: 'نعم — بوابة العميل مُحسَّنة بالكامل للهاتف. يمكنك متابعة خطتك الغذائية والتدريبية، تسجيل شرب الماء، رفع صور التقدم، وإرسال التقرير الأسبوعي من هاتفك مباشرة.',
  },
  {
    q: 'ماذا يشمل "ضمان النتيجة" في باقة 3 أشهر؟',
    a: 'إذا التزمت بالخطة كاملاً (تدريب + تغذية + التقارير الأسبوعية) ولم تُحقق تقدماً ملموساً في 3 أشهر، يُمدِّد المدرب أمين متابعتك مجاناً حتى تصل إلى هدفك.',
  },
]

function FAQItem({ q, a, open, toggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-colors
        ${open ? 'border-gold-400/30 bg-white/5' : 'border-white/8 bg-white/[0.02] hover:border-white/15'}`}
    >
      <button
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center gap-4 px-6 py-5 text-right cursor-pointer"
      >
        <span className={`font-extrabold text-sm flex-1 text-right leading-relaxed transition-colors
          ${open ? 'text-white' : 'text-white/70'}`}>
          {q}
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-all duration-300
          ${open ? 'rotate-180 text-gold-400' : 'text-white/30'}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-white/5">
          <p className="text-white/50 text-sm leading-relaxed font-medium pt-4 text-right">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section id="faq" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-gold-400" />
          <p className="text-gold-400 font-bold text-xs uppercase tracking-widest">الأسئلة الشائعة</p>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          أسئلة يطرحها كل عميل
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium text-sm mb-12">
          إجابات مباشرة على أكثر ما يُسأل عنه قبل الاشتراك
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              open={openIdx === i}
              toggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/30 text-sm font-medium">
            لم تجد إجابة لسؤالك؟{' '}
            <a href="https://wa.me/97430653759" target="_blank" rel="noreferrer"
              className="text-gold-400 font-bold hover:text-gold-300 transition">
              تواصل معنا مباشرة ←
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

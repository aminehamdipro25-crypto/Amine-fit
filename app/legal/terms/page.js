const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

export const metadata = {
  title: 'شروط الاستخدام — AmineFit',
  description: 'شروط استخدام خدمات Amine-Fit للتدريب الشخصي والتخطيط الغذائي عن بُعد — الاشتراك، الدفع، والتزامات العميل.',
  alternates: { canonical: `${BASE}/legal/terms` },
  robots: { index: true, follow: true },
}

export default function Terms() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-extrabold text-white mb-2">شروط الاستخدام</h1>
      <p className="text-white/40 text-sm mb-8">آخر تحديث: يونيو 2026</p>
      {[
        { title: '1. قبول الشروط', body: 'باستخدامك لخدمات AmineFit، فأنت توافق على هذه الشروط بالكامل. إذا كنت لا توافق على أي بند، يُرجى التوقف عن استخدام الخدمة.' },
        { title: '2. طبيعة الخدمة', body: 'AmineFit منصة للتدريب الشخصي والتخطيط الغذائي عن بُعد. لا تُعدّ خدماتنا بديلاً عن الرعاية الطبية. استشر طبيبك قبل بدء أي برنامج رياضي إذا كنت تعاني من حالات صحية.' },
        { title: '3. الاشتراك والدفع', body: 'تُدفع الرسوم شهرياً مسبقاً. الأسعار بالدينار التونسي (د.ت) وقابلة للتغيير مع إشعار مسبق بـ 30 يوماً. لا يحق المطالبة باسترداد المال عند انتهاء الفترة المدفوعة.' },
        { title: '4. التزامات العميل', body: 'يلتزم العميل بتقديم معلومات صحيحة ودقيقة، وبالتواصل مع المدرب عند أي تغيير في حالته الصحية، والالتزام بالخطة المقررة للحصول على أفضل النتائج.' },
        { title: '5. الملكية الفكرية', body: 'جميع المحتويات المقدمة (خطط التدريب، الخطط الغذائية، المواد التعليمية) هي ملكية حصرية لـ AmineFit ولا يجوز نسخها أو مشاركتها دون إذن مسبق.' },
      ].map(({ title, body }) => (
        <div key={title} className="mb-8">
          <h2 className="text-lg font-extrabold text-white mb-3">{title}</h2>
          <p className="text-white/50 leading-relaxed text-sm">{body}</p>
        </div>
      ))}
    </div>
  )
}

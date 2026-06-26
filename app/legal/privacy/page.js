const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

export const metadata = {
  title: 'سياسة الخصوصية — AmineFit',
  description: 'كيف يجمع ويستخدم ويحمي Amine-Fit بياناتك الشخصية والصحية — لا نبيع أو نشارك بياناتك مع أي طرف ثالث.',
  alternates: { canonical: `${BASE}/legal/privacy` },
  robots: { index: true, follow: true },
}

export default function Privacy() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-extrabold text-white mb-2">سياسة الخصوصية</h1>
      <p className="text-white/40 text-sm mb-8">آخر تحديث: يونيو 2026</p>

      {[
        { title: '1. المعلومات التي نجمعها', body: 'نجمع المعلومات التي تقدمها عند التسجيل أو ملء الاستبيان، بما يشمل: الاسم، البريد الإلكتروني، رقم الهاتف، والبيانات الصحية (الوزن، الطول، العمر، الأهداف). لا نجمع أي بيانات دون موافقتك الصريحة.' },
        { title: '2. كيف نستخدم بياناتك', body: 'تُستخدم بياناتك حصرياً لتقديم خدمات التدريب والتغذية المخصصة، والتواصل معك بشأن برنامجك، وتحسين جودة خدماتنا. لا نبيع أو نشارك بياناتك مع أي طرف ثالث تحت أي ظرف.' },
        { title: '3. أمان البيانات', body: 'نستخدم تشفير SSL لجميع البيانات المنقولة. كلمات المرور مشفرة ومحمية. يتم تخزين البيانات على خوادم آمنة مشفرة. وصول البيانات مقيد بالموظفين المختصين فقط.' },
        { title: '4. حقوقك', body: 'يحق لك في أي وقت: طلب الاطلاع على بياناتك، طلب تصحيح أي معلومات غير دقيقة، طلب حذف حسابك وجميع بياناتك، إلغاء الاشتراك من أي رسائل تسويقية.' },
        { title: '5. التواصل', body: 'لأي استفسار بخصوص خصوصيتك، تواصل معنا عبر: amine.hamdi.pro25@gmail.com أو ‪+974 3065 3759‬' },
      ].map(({ title, body }) => (
        <div key={title} className="mb-8">
          <h2 className="text-lg font-extrabold text-white mb-3">{title}</h2>
          <p className="text-white/50 leading-relaxed text-sm">{body}</p>
        </div>
      ))}
    </div>
  )
}

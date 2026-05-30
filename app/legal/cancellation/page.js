export const metadata = { title: 'سياسة الإلغاء — AmineFit' }

export default function Cancellation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-extrabold text-white mb-2">سياسة الإلغاء والاسترداد</h1>
      <p className="text-white/40 text-sm mb-8">آخر تحديث: يناير 2025</p>
      {[
        { title: '1. إلغاء الاشتراك', body: 'يمكنك إلغاء اشتراكك في أي وقت عبر التواصل المباشر مع المدرب. سيستمر وصولك للخدمة حتى نهاية الفترة المدفوعة.' },
        { title: '2. سياسة الاسترداد', body: 'نقدم ضمان استرداد كامل خلال أول 7 أيام من الاشتراك إذا لم تكن راضياً عن الخدمة لأي سبب. بعد 7 أيام لا يتم الاسترداد للفترة المتبقية.' },
        { title: '3. ضمان النتائج (الباقة الاحترافية)', body: 'للمشتركين في الباقة الاحترافية: إذا التزمت بالخطة كاملاً ولم تحقق أي تقدم ملموس خلال الشهر الأول، نُعيد لك كامل المبلغ أو نجدد الاشتراك مجاناً.' },
        { title: '4. التواصل للإلغاء', body: 'للإلغاء أو طلب الاسترداد، تواصل معنا عبر: amine.hamdi.pro25@gmail.com أو +974 3065 3759. نلتزم بالرد خلال 24 ساعة.' },
      ].map(({ title, body }) => (
        <div key={title} className="mb-8">
          <h2 className="text-lg font-extrabold text-white mb-3">{title}</h2>
          <p className="text-white/50 leading-relaxed text-sm">{body}</p>
        </div>
      ))}
    </div>
  )
}

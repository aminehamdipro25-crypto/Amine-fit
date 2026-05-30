const stats = [
  { value: '100+', label: 'مشترك نشط',    desc: 'يحققون أهدافهم يومياً',     color: 'text-primary-600', bg: 'bg-primary-50' },
  { value: '95%',  label: 'نسبة النجاح',  desc: 'من المشتركين يصلون لهدفهم',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: '5+',   label: 'سنوات خبرة',   desc: 'في التدريب الشخصي والتغذية', color: 'text-amber-600',   bg: 'bg-amber-50' },
  { value: '500+', label: 'تحويل ناجح',   desc: 'قصة نجاح موثقة',             color: 'text-rose-600',    bg: 'bg-rose-50' },
]

export default function Stats() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label}
              className={`${s.bg} rounded-2xl p-6 text-center card-hover border border-transparent hover:border-slate-200`}>
              <p className={`text-4xl font-extrabold ${s.color} mb-1`}>{s.value}</p>
              <p className="font-bold text-slate-800 text-lg">{s.label}</p>
              <p className="text-slate-500 text-sm mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

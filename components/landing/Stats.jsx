const stats = [
  { value: '100+', label: 'مشترك نشط',  desc: 'يحققون أهدافهم يومياً' },
  { value: '95%',  label: 'نسبة النجاح', desc: 'من المشتركين يصلون لهدفهم' },
  { value: '10+',  label: 'سنوات خبرة',  desc: 'في التدريب الشخصي والتغذية' },
  { value: '500+', label: 'تحويل ناجح',  desc: 'قصة نجاح موثقة' },
]

export default function Stats() {
  return (
    <section className="bg-[#0a0a0a] py-16 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label}
              className="bg-white/3 border border-white/8 rounded-2xl p-6 text-center hover:border-gold-400/30 hover:bg-white/5 transition-all group">
              <p className="text-4xl font-extrabold text-gold-400 mb-1 group-hover:scale-110 transition-transform inline-block">
                {s.value}
              </p>
              <p className="font-extrabold text-white text-base">{s.label}</p>
              <p className="text-white/30 text-sm mt-1 font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

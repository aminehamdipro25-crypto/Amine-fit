'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Printer, ArrowRight } from 'lucide-react'
import NutritionReportView, { ReportStyles } from '@/components/NutritionReportView'

export default function ClientNutritionReport() {
  const router = useRouter()
  const [plan, setPlan]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => { if (r.status === 401) { router.push('/client/login'); return null } return r.json() })
      .then(d => {
        if (!d) return
        // The professional report needs the full calculator plan (form/ex/bmr/menu)
        const calc = d.nutritionCalcPlan
        if (calc?.form) setPlan({ ...calc, form: { ...calc.form, name: calc.form.name || d.name } })
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!plan) return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="text-6xl mb-4">🥗</div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-2">لا يوجد تقرير بعد</h2>
      <p className="text-slate-400 text-sm mb-6">سيظهر تقريرك الاحترافي هنا فور اعتماد المدرب لخطتك.</p>
      <Link href="/client/plan/nutrition" className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl">
        العودة للخطة
      </Link>
    </div>
  )

  return (
    <>
      <ReportStyles />
      <div className="no-print flex items-center justify-between gap-3 mb-4 max-w-[820px] mx-auto">
        <Link href="/client/plan/nutrition"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-slate-300 transition text-sm font-bold">
          <ArrowRight className="w-4 h-4" /> رجوع
        </Link>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition text-sm shadow">
          <Printer className="w-4 h-4" /> طباعة / حفظ PDF
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <NutritionReportView plan={plan} />
      </div>
    </>
  )
}

'use client'
import { useEffect, useState } from 'react'
import NutritionReportView, { ReportStyles } from '@/components/NutritionReportView'

export default function PlanReport() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amineFitPlan')
      if (raw) setPlan(JSON.parse(raw))
    } catch {}
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-lg">جارٍ التحميل...</p>
    </div>
  )

  return (
    <>
      <ReportStyles />
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <button onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          🖨️ طباعة / حفظ PDF
        </button>
        <button onClick={() => window.close()}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg text-sm">
          ✕ إغلاق
        </button>
      </div>
      <NutritionReportView plan={plan} />
    </>
  )
}

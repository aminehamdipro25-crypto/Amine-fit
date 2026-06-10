export const COUNTRIES = [
  { code:'TN', label:'🇹🇳 تونس' },
  { code:'MA', label:'🇲🇦 المغرب' },
  { code:'DZ', label:'🇩🇿 الجزائر' },
  { code:'LY', label:'🇱🇾 ليبيا' },
  { code:'QA', label:'🇶🇦 قطر' },
  { code:'SA', label:'🇸🇦 السعودية' },
  { code:'AE', label:'🇦🇪 الإمارات' },
  { code:'KW', label:'🇰🇼 الكويت' },
  { code:'BH', label:'🇧🇭 البحرين' },
  { code:'OM', label:'🇴🇲 عُمان' },
  { code:'EG', label:'🇪🇬 مصر' },
  { code:'JO', label:'🇯🇴 الأردن' },
  { code:'LB', label:'🇱🇧 لبنان' },
  { code:'SY', label:'🇸🇾 سوريا' },
  { code:'IQ', label:'🇮🇶 العراق' },
  { code:'YE', label:'🇾🇪 اليمن' },
  { code:'SD', label:'🇸🇩 السودان' },
  { code:'MR', label:'🇲🇷 موريتانيا' },
  { code:'PS', label:'🇵🇸 فلسطين' },
  { code:'OTHER', label:'🌍 دولة أخرى' },
]

export function getCountryLabel(code) {
  return COUNTRIES.find(c => c.code === code)?.label || code || ''
}

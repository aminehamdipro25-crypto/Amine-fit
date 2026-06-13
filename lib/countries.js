export const COUNTRIES = [
  // ── المغرب العربي ──────────────────────────────
  { code:'TN', label:'🇹🇳 تونس',       region:'maghreb' },
  { code:'MA', label:'🇲🇦 المغرب',      region:'maghreb' },
  { code:'DZ', label:'🇩🇿 الجزائر',     region:'maghreb' },
  { code:'LY', label:'🇱🇾 ليبيا',       region:'maghreb' },
  { code:'MR', label:'🇲🇷 موريتانيا',   region:'maghreb' },

  // ── الخليج العربي ─────────────────────────────
  { code:'QA', label:'🇶🇦 قطر',         region:'gulf' },
  { code:'SA', label:'🇸🇦 السعودية',     region:'gulf' },
  { code:'AE', label:'🇦🇪 الإمارات',     region:'gulf' },
  { code:'KW', label:'🇰🇼 الكويت',       region:'gulf' },
  { code:'BH', label:'🇧🇭 البحرين',      region:'gulf' },
  { code:'OM', label:'🇴🇲 عُمان',        region:'gulf' },

  // ── المشرق العربي وشمال أفريقيا ───────────────
  { code:'EG', label:'🇪🇬 مصر',          region:'arab' },
  { code:'JO', label:'🇯🇴 الأردن',        region:'arab' },
  { code:'LB', label:'🇱🇧 لبنان',         region:'arab' },
  { code:'SY', label:'🇸🇾 سوريا',         region:'arab' },
  { code:'IQ', label:'🇮🇶 العراق',        region:'arab' },
  { code:'YE', label:'🇾🇪 اليمن',         region:'arab' },
  { code:'SD', label:'🇸🇩 السودان',       region:'arab' },
  { code:'PS', label:'🇵🇸 فلسطين',        region:'arab' },

  // ── الاتحاد الأوروبي — 27 دولة ────────────────
  { code:'DE', label:'🇩🇪 ألمانيا',       region:'eu' },
  { code:'FR', label:'🇫🇷 فرنسا',         region:'eu' },
  { code:'IT', label:'🇮🇹 إيطاليا',       region:'eu' },
  { code:'ES', label:'🇪🇸 إسبانيا',       region:'eu' },
  { code:'NL', label:'🇳🇱 هولندا',        region:'eu' },
  { code:'BE', label:'🇧🇪 بلجيكا',        region:'eu' },
  { code:'SE', label:'🇸🇪 السويد',        region:'eu' },
  { code:'PL', label:'🇵🇱 بولندا',        region:'eu' },
  { code:'AT', label:'🇦🇹 النمسا',        region:'eu' },
  { code:'PT', label:'🇵🇹 البرتغال',      region:'eu' },
  { code:'GR', label:'🇬🇷 اليونان',       region:'eu' },
  { code:'DK', label:'🇩🇰 الدنمارك',      region:'eu' },
  { code:'FI', label:'🇫🇮 فنلندا',        region:'eu' },
  { code:'IE', label:'🇮🇪 أيرلندا',       region:'eu' },
  { code:'CZ', label:'🇨🇿 التشيك',        region:'eu' },
  { code:'RO', label:'🇷🇴 رومانيا',       region:'eu' },
  { code:'HU', label:'🇭🇺 المجر',         region:'eu' },
  { code:'SK', label:'🇸🇰 سلوفاكيا',      region:'eu' },
  { code:'BG', label:'🇧🇬 بلغاريا',       region:'eu' },
  { code:'HR', label:'🇭🇷 كرواتيا',       region:'eu' },
  { code:'LT', label:'🇱🇹 ليتوانيا',      region:'eu' },
  { code:'LV', label:'🇱🇻 لاتفيا',        region:'eu' },
  { code:'EE', label:'🇪🇪 إستونيا',       region:'eu' },
  { code:'SI', label:'🇸🇮 سلوفينيا',      region:'eu' },
  { code:'LU', label:'🇱🇺 لوكسمبورغ',     region:'eu' },
  { code:'MT', label:'🇲🇹 مالطا',         region:'eu' },
  { code:'CY', label:'🇨🇾 قبرص',          region:'eu' },

  // ── دول أوروبية أخرى ──────────────────────────
  { code:'GB', label:'🇬🇧 المملكة المتحدة', region:'eu_other' },
  { code:'CH', label:'🇨🇭 سويسرا',         region:'eu_other' },
  { code:'NO', label:'🇳🇴 النرويج',         region:'eu_other' },

  // ── أخرى ──────────────────────────────────────
  { code:'OTHER', label:'🌍 دولة أخرى',    region:'other' },
]

// ── القسم المرئي في القائمة المنسدلة ──────────────────────────────────────
export const COUNTRY_GROUPS = [
  {
    label: '🌍 المغرب العربي',
    codes: ['TN','MA','DZ','LY','MR'],
  },
  {
    label: '🌟 الخليج العربي',
    codes: ['QA','SA','AE','KW','BH','OM'],
  },
  {
    label: '🌙 المشرق العربي',
    codes: ['EG','JO','LB','SY','IQ','YE','SD','PS'],
  },
  {
    label: '🇪🇺 الاتحاد الأوروبي',
    codes: ['DE','FR','IT','ES','NL','BE','SE','PL','AT','PT','GR','DK','FI','IE','CZ','RO','HU','SK','BG','HR','LT','LV','EE','SI','LU','MT','CY'],
  },
  {
    label: '🌍 أوروبا (خارج الاتحاد)',
    codes: ['GB','CH','NO'],
  },
  {
    label: '🌐 أخرى',
    codes: ['OTHER'],
  },
]

export function getCountryLabel(code) {
  return COUNTRIES.find(c => c.code === code)?.label || code || ''
}

export function getCountryRegion(code) {
  return COUNTRIES.find(c => c.code === code)?.region || 'other'
}

export const EU_CODES = new Set([
  'DE','FR','IT','ES','NL','BE','SE','PL','AT','PT','GR','DK','FI','IE',
  'CZ','RO','HU','SK','BG','HR','LT','LV','EE','SI','LU','MT','CY',
  'GB','CH','NO',
])

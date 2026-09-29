// Amine-Fit brand mark — the sibling of the Amine Academy monogram. It uses the
// exact same bold bilingual "A / أ" construction (Latin A + Arabic alef with a
// hamza dot), so amine-fit.com and academy.amine-fit.com read as one family.
// The only difference is the tint: the gold/black Amine-Fit identity here vs the
// academy's purple. Single source of truth — change the mark here and it updates
// everywhere the component is used (navbar, footer, login, favicon…).
export default function AmineFitLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="afLogoBg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="afLogoDeep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="13" fill="url(#afLogoBg)" />
      {/* Bold two-tone A / أ monogram — same paths as components/shared/AcademyLogo */}
      <g fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 33 L21.2 11" stroke="#0a0a0a" />
        <path d="M16.3 26 L27.7 26" stroke="#0a0a0a" />
        <path d="M22.8 11 L32 33" stroke="url(#afLogoDeep)" />
      </g>
      <circle cx="32.8" cy="9" r="2.2" fill="#0a0a0a" />
    </svg>
  )
}

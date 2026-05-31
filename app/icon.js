import { ImageResponse } from 'next/og'

export const size     = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#0a0a0a',
        borderRadius: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        gap: 0,
      }}>
        <div style={{
          fontSize: 80, lineHeight: 1,
          color: '#fbbf24',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          letterSpacing: -4,
        }}>
          AF
        </div>
      </div>
    ),
    { ...size }
  )
}

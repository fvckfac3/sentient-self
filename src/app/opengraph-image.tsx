import { ImageResponse } from 'next/og'
import { BrandMark } from './brand-mark'
import { SITE_NAME } from '@/lib/site'

export const alt = `${SITE_NAME} - Understand yourself better`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1224 0%, #1e1b4b 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <BrandMark size={160} />
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 28 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 34, color: '#cbd5e1', marginTop: 12 }}>
          AI journaling that learns your patterns and reflects your growth
        </div>
      </div>
    ),
    size
  )
}

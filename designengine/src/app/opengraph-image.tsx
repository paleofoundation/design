import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Refine Design — AI with design taste.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5efe8',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#306E5E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5efe8',
              fontSize: '32px',
              fontWeight: 700,
            }}
          >
            RD
          </div>
          <span style={{ fontSize: '56px', fontWeight: 700, color: '#306E5E' }}>
            Refine Design
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#306E5E',
            opacity: 0.8,
            maxWidth: '700px',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          AI with design taste.
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '48px',
          }}
        >
          {['#306E5E', '#FF6719', '#F2B245', '#CAC5F9'].map((c) => (
            <div
              key={c}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: c,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

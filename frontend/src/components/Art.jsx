/* Original illustrations drawn as inline SVG: no image files to host, they scale cleanly and follow the theme. */

function Person({ cx, cy, r, fill, ring }) {
  return (
    <g>
      {ring && <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#d4b06a" strokeOpacity=".45" strokeWidth="1.5" />}
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx} cy={cy - r * 0.2} r={r * 0.3} fill="#fff" fillOpacity=".92" />
      <path d={`M${cx - r * 0.62} ${cy + r * 0.75} Q${cx - r * 0.62} ${cy + r * 0.2} ${cx} ${cy + r * 0.2} Q${cx + r * 0.62} ${cy + r * 0.2} ${cx + r * 0.62} ${cy + r * 0.75} Z`} fill="#fff" fillOpacity=".92" />
    </g>
  );
}

/** Sign-in panel: an org chart, a leave-approved notice and a month calendar. */
export function LoginArt() {
  return (
    <svg viewBox="0 0 520 336" className="login-art" role="img"
      aria-label="Illustration of an organisation chart with a calendar and an approved leave notification">
      <g fill="none" stroke="#fff" strokeOpacity=".24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M260 92 V126 H120 V166" /><path d="M260 126 V166" /><path d="M260 126 H400 V166" />
        <path d="M120 214 V247 H70 V280" /><path d="M120 247 H170 V280" />
        <path d="M400 214 V247 H350 V280" /><path d="M400 247 H450 V280" />
      </g>
      <Person cx={260} cy={62} r={30} fill="#d4b06a" ring />
      <Person cx={120} cy={190} r={24} fill="#7f93e8" />
      <Person cx={260} cy={190} r={24} fill="#7cc4b9" />
      <Person cx={400} cy={190} r={24} fill="#bf92d2" />
      <Person cx={70} cy={300} r={20} fill="#e59a7e" />
      <Person cx={170} cy={300} r={20} fill="#7f93e8" />
      <Person cx={350} cy={300} r={20} fill="#d4b06a" />
      <Person cx={450} cy={300} r={20} fill="#7cc4b9" />

      {/* approved notice */}
      <g>
        <rect x="14" y="14" width="168" height="54" rx="12" fill="#fff" fillOpacity=".08" stroke="#fff" strokeOpacity=".2" />
        <circle cx="42" cy="41" r="13" fill="#5fcf9f" fillOpacity=".2" />
        <path d="M35.5 41.5l4.5 4.5 8.5-9" fill="none" stroke="#5fcf9f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="64" y="38" fill="#e8eaf3" fontSize="13" fontWeight="600">Leave approved</text>
        <text x="64" y="55" fill="#9aa3c2" fontSize="11.5">12 to 14 November</text>
      </g>

      {/* month calendar */}
      <g>
        <rect x="372" y="14" width="134" height="104" rx="12" fill="#fff" fillOpacity=".08" stroke="#fff" strokeOpacity=".2" />
        <rect x="372" y="14" width="134" height="26" rx="12" fill="#d4b06a" fillOpacity=".9" />
        <rect x="372" y="28" width="134" height="12" fill="#d4b06a" fillOpacity=".9" />
        {[0, 1, 2].map((row) => [0, 1, 2, 3, 4].map((col) => {
          const hot = row === 1 && col >= 1 && col <= 3;
          return <rect key={`${row}${col}`} x={386 + col * 22} y={52 + row * 20} width="14" height="12" rx="3.5"
            fill={hot ? '#d4b06a' : '#fff'} fillOpacity={hot ? 0.95 : 0.2} />;
        }))}
      </g>
    </svg>
  );
}

/** Dashboard banner: a quiet skyline with a low sun. */
export function HeroArt() {
  const buildings = [[8, 64, 36], [50, 96, 30], [86, 52, 42], [134, 112, 34], [174, 72, 32], [212, 100, 38], [256, 58, 30], [292, 86, 46]];
  return (
    <svg viewBox="0 0 360 160" className="hero-art" aria-hidden="true" focusable="false">
      <circle cx="318" cy="27" r="24" fill="none" stroke="var(--gold)" strokeOpacity=".3" />
      <circle cx="318" cy="27" r="14" fill="var(--gold)" fillOpacity=".92" />
      {buildings.map(([x, h, w], i) => (
        <g key={x}>
          <rect x={x} y={140 - h} width={w} height={h} rx="3" fill="var(--chart)" fillOpacity={i % 2 ? 0.85 : 0.55} />
          {Array.from({ length: Math.floor((h - 12) / 16) }).map((_, r) =>
            Array.from({ length: Math.floor((w - 6) / 11) }).map((__, c) => (
              <rect key={`${r}-${c}`} x={x + 6 + c * 11} y={140 - h + 9 + r * 16} width="5" height="7" rx="1.5" fill="var(--surface)" fillOpacity=".75" />
            )))}
        </g>
      ))}
      <line x1="0" x2="360" y1="140.5" y2="140.5" stroke="var(--line-strong)" />
    </svg>
  );
}

const EMPTY = {
  calendar: (<>
    <rect className="ea-line" x="14" y="16" width="68" height="58" rx="9" />
    <path className="ea-line" d="M14 34h68M33 9v14M63 9v14" />
    <circle className="ea-dot" cx="32" cy="48" r="3" /><circle className="ea-dot" cx="48" cy="48" r="3" /><circle className="ea-dot" cx="64" cy="48" r="3" />
    <circle className="ea-dot" cx="32" cy="62" r="3" /><circle className="ea-dot" cx="48" cy="62" r="3" /><circle className="ea-gold" cx="64" cy="62" r="4.5" />
  </>),
  people: (<>
    <circle className="ea-line" cx="36" cy="32" r="10" /><circle className="ea-line" cx="63" cy="37" r="8" />
    <path className="ea-line" d="M14 74c0-12 9-20 22-20s22 8 22 20M51 74c0-9 5-15 13-15s14 6 14 15" />
    <circle className="ea-gold" cx="80" cy="20" r="4" />
  </>),
  inbox: (<>
    <path className="ea-line" d="M12 46l10-22h52l10 22v22a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6zM12 46h26l4 9h12l4-9h26" />
    <circle className="ea-gold" cx="48" cy="12" r="4.5" />
  </>),
  chart: (<>
    <path className="ea-line" d="M12 74h72" />
    <rect className="ea-line" x="20" y="48" width="12" height="26" rx="3" /><rect className="ea-line" x="42" y="30" width="12" height="44" rx="3" />
    <rect className="ea-line" x="64" y="54" width="12" height="20" rx="3" /><circle className="ea-gold" cx="48" cy="20" r="4.5" />
  </>),
};

export function EmptyArt({ kind = 'inbox' }) {
  return <svg viewBox="0 0 96 84" className="empty-art" aria-hidden="true" focusable="false">{EMPTY[kind] || EMPTY.inbox}</svg>;
}

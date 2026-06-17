function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toDataUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function hashValue(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

type VehicleArtOptions = {
  title: string
  subtitle: string
  bodyColor: string
  accentColor: string
  badgeColor: string
  windowColor: string
  rustColor: string
  seed: string
}

export function buildVehicleImageUrlFromArt(options: VehicleArtOptions) {
  const safeTitle = escapeXml(options.title)
  const safeSubtitle = escapeXml(options.subtitle)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#efeae3" />
          <stop offset="100%" stop-color="#d9d1c8" />
        </linearGradient>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${options.bodyColor}" />
          <stop offset="100%" stop-color="#5f5f5f" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.18" />
        </filter>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)" />
      <rect x="0" y="560" width="1280" height="160" fill="#c8c0b6" />
      <path d="M0 558h1280" stroke="#b7afa6" stroke-width="3" />
      <ellipse cx="285" cy="545" rx="190" ry="20" fill="#000" opacity="0.08" />
      <ellipse cx="760" cy="548" rx="250" ry="24" fill="#000" opacity="0.08" />
      <g filter="url(#shadow)">
        <path d="M170 475c20-72 56-142 118-175 52-27 133-35 223-36h145c87 1 175 11 238 43 54 27 90 79 114 168l22 8c16 6 28 20 28 37v58c0 18-14 32-32 32h-25c-9 57-58 98-118 98s-109-41-118-98H460c-9 57-58 98-118 98s-109-41-118-98h-50c-18 0-32-14-32-32v-33c0-14 8-27 20-34l8-5z" fill="url(#body)" stroke="#222" stroke-width="7" />
        <path d="M282 326c18-40 46-68 92-85 40-15 92-18 150-18h78c64 0 120 5 165 20 48 16 79 44 101 83l34 71H255z" fill="#2b2b2b" opacity="0.88" />
        <path d="M327 318c13-28 32-48 64-59 28-10 67-12 113-12h61c52 0 97 4 132 15 34 11 57 28 72 54l20 43H311z" fill="${options.windowColor}" opacity="0.92" stroke="#101010" stroke-width="5" />
        <path d="M352 312c11-22 27-37 50-45 21-7 50-9 84-9h46c39 0 74 3 100 11 27 8 45 21 58 40l13 23H337z" fill="#dce7f0" opacity="0.35" />
        <circle cx="375" cy="571" r="74" fill="#151515" stroke="#444" stroke-width="8" />
        <circle cx="375" cy="571" r="43" fill="#9d9d9d" stroke="#202020" stroke-width="8" />
        <circle cx="828" cy="571" r="74" fill="#151515" stroke="#444" stroke-width="8" />
        <circle cx="828" cy="571" r="43" fill="#9d9d9d" stroke="#202020" stroke-width="8" />
        <path d="M229 490h824" stroke="${options.accentColor}" stroke-width="16" stroke-linecap="round" />
        <path d="M270 445h225" stroke="#f4f4f4" stroke-width="10" stroke-linecap="round" opacity="0.28" />
        <path d="M585 445h245" stroke="#f4f4f4" stroke-width="10" stroke-linecap="round" opacity="0.22" />
        <path d="M204 520h72" stroke="#121212" stroke-width="14" stroke-linecap="round" />
        <path d="M1000 520h72" stroke="#121212" stroke-width="14" stroke-linecap="round" />
        <rect x="905" y="492" width="66" height="31" rx="4" fill="${options.badgeColor}" />
        <rect x="920" y="498" width="36" height="16" rx="3" fill="#f7f0d7" />
        <circle cx="242" cy="520" r="18" fill="#ffcf66" />
        <circle cx="1034" cy="520" r="18" fill="#ffcf66" />
        <path d="M247 419l27-55 24 1-20 55z" fill="#171717" />
        <path d="M1010 419l28-55 24 1-21 55z" fill="#171717" />
        <path d="M258 455c18-42 50-70 99-85" stroke="#f6e6d7" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round" />
        <path d="M750 472c78-36 146-48 220-35" stroke="#f6e6d7" stroke-opacity="0.12" stroke-width="10" stroke-linecap="round" />
        <path d="M468 505c36 0 75-5 111-17" stroke="#ffffff" stroke-opacity="0.18" stroke-width="9" stroke-linecap="round" />
        <path d="M610 300l9-22" stroke="${options.rustColor}" stroke-width="14" stroke-linecap="round" />
        <path d="M642 294l13-30" stroke="${options.rustColor}" stroke-width="10" stroke-linecap="round" />
        <path d="M390 390l26-15" stroke="${options.rustColor}" stroke-width="8" stroke-linecap="round" />
        <path d="M917 402l22-14" stroke="${options.rustColor}" stroke-width="8" stroke-linecap="round" />
        <path d="M198 492h60" stroke="${options.rustColor}" stroke-width="6" stroke-linecap="round" opacity="0.8" />
        <path d="M1030 492h54" stroke="${options.rustColor}" stroke-width="6" stroke-linecap="round" opacity="0.8" />
      </g>
      <text x="72" y="86" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#2e2a27">${safeTitle}</text>
      <text x="72" y="132" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#5e574f">${safeSubtitle}</text>
      <text x="72" y="680" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#736b61">demo local - ${escapeXml(options.seed)}</text>
    </svg>
  `

  return toDataUrl(svg)
}

export function buildVehicleImageUrl(brand: string, model: string, seed?: string) {
  const basis = `${brand}-${model}-${seed ?? ''}`.trim() || 'vehicle'
  const palette = [
    ['#c7c0b7', '#7a736b', '#a98b68', '#74808a', '#9a6a42'],
    ['#b9c0c6', '#70787d', '#8f9aab', '#6c7b86', '#8f633b'],
    ['#d5cbbf', '#74695f', '#a6875e', '#76818a', '#91643f'],
    ['#cfd1c9', '#6d7269', '#9a8f71', '#6f7f8b', '#9b6d46'],
  ] as const

  const colors = palette[hashValue(basis) % palette.length]

  return buildVehicleImageUrlFromArt({
    title: `${brand} ${model}`.trim(),
    subtitle: 'vehicule de test local',
    bodyColor: colors[0],
    accentColor: colors[1],
    badgeColor: colors[2],
    windowColor: colors[3],
    rustColor: colors[4],
    seed: basis,
  })
}

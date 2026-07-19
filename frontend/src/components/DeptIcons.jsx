// src/components/DeptIcons.jsx
// Icons ndogo za idara sita, zinazotumika kwenye Login/Register side panel.

const common = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function WaterIcon() {
  return (
    <svg {...common}>
      <path d="M12 2s7 7.5 7 12.5A7 7 0 0 1 5 14.5C5 9.5 12 2 12 2Z" />
    </svg>
  );
}

export function ElectricityIcon() {
  return (
    <svg {...common}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

export function RoadsIcon() {
  return (
    <svg {...common}>
      <path d="M4 20 9 4h6l5 16" />
      <path d="M12 4v3M12 11v3M12 18v3" strokeDasharray="2 3" />
    </svg>
  );
}

export function SanitationIcon() {
  return (
    <svg {...common}>
      <path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7Z" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 7h16" />
    </svg>
  );
}

export function HealthIcon() {
  return (
    <svg {...common}>
      <path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />
    </svg>
  );
}

export function EducationIcon() {
  return (
    <svg {...common}>
      <path d="m2 9 10-5 10 5-10 5-10-5Z" />
      <path d="M6 11v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

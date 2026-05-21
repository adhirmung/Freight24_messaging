// Stroke icons — 1.6px stroke, 20x20 viewBox
const Icon = ({ d, size = 18, stroke = 'currentColor', fill = 'none', sw = 1.6, children }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  inbox:    (p) => <Icon {...p}><path d="M3 5h14v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"/><path d="M3 11h4l1 2h4l1-2h4"/></Icon>,
  tasks:    (p) => <Icon {...p}><rect x="3" y="3.5" width="13" height="13" rx="2.5"/><path d="M6.5 10.5 8.5 12.5 13 8"/></Icon>,
  truck:    (p) => <Icon {...p}><path d="M2 5h9v8H2zM11 8h4l3 3v2h-7"/><circle cx="6" cy="15" r="1.6"/><circle cx="14.5" cy="15" r="1.6"/></Icon>,
  bell:     (p) => <Icon {...p}><path d="M5 8a5 5 0 0 1 10 0v3l1.5 2.5H3.5L5 11z"/><path d="M8 16a2 2 0 0 0 4 0"/></Icon>,
  clock:    (p) => <Icon {...p}><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></Icon>,
  shield:   (p) => <Icon {...p}><path d="M10 2 4 4v5c0 4 2.5 7 6 9 3.5-2 6-5 6-9V4z"/></Icon>,
  search:   (p) => <Icon {...p}><circle cx="9" cy="9" r="5"/><path d="m17 17-4.5-4.5"/></Icon>,
  plus:     (p) => <Icon {...p}><path d="M10 4v12M4 10h12"/></Icon>,
  send:     (p) => <Icon {...p}><path d="m3 10 14-6-5 14-2-6z"/></Icon>,
  paper:    (p) => <Icon {...p}><path d="M14 6 7.5 12.5a3 3 0 1 0 4.2 4.2l6.6-6.6a4.8 4.8 0 0 0-6.8-6.8L5 9.5"/></Icon>,
  mic:      (p) => <Icon {...p}><rect x="8" y="3" width="4" height="9" rx="2"/><path d="M5 10a5 5 0 0 0 10 0M10 15v3"/></Icon>,
  smile:    (p) => <Icon {...p}><circle cx="10" cy="10" r="7"/><path d="M7 11.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M7.5 8h.01M12.5 8h.01"/></Icon>,
  user:     (p) => <Icon {...p}><circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c.8-3.2 3.5-5 6.5-5s5.7 1.8 6.5 5"/></Icon>,
  users:    (p) => <Icon {...p}><circle cx="8" cy="7" r="2.8"/><path d="M2.5 17c.6-2.6 2.8-4 5.5-4s4.9 1.4 5.5 4"/><circle cx="15" cy="6" r="2.2"/><path d="M14 11.5c2 .3 3.4 1.6 3.5 3.5"/></Icon>,
  check:    (p) => <Icon {...p}><path d="m4 10.5 4 4L17 5"/></Icon>,
  warn:     (p) => <Icon {...p}><path d="m10 3 8 14H2z"/><path d="M10 8v4M10 14.2v.1"/></Icon>,
  pin:      (p) => <Icon {...p}><path d="m12 3 5 5-3 1-3 3-1 4-7-7 4-1 3-3z"/></Icon>,
  more:     (p) => <Icon {...p}><circle cx="5" cy="10" r="1.2"/><circle cx="10" cy="10" r="1.2"/><circle cx="15" cy="10" r="1.2"/></Icon>,
  arrow:    (p) => <Icon {...p}><path d="M4 10h12M11 5l5 5-5 5"/></Icon>,
  arrowDown:(p) => <Icon {...p}><path d="M5 8l5 5 5-5"/></Icon>,
  lock:     (p) => <Icon {...p}><rect x="4" y="9" width="12" height="8" rx="2"/><path d="M7 9V7a3 3 0 0 1 6 0v2"/></Icon>,
  mail:     (p) => <Icon {...p}><rect x="3" y="5" width="14" height="10" rx="2"/><path d="m3 6 7 5 7-5"/></Icon>,
  spark:    (p) => <Icon {...p}><path d="M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2"/></Icon>,
  pkg:      (p) => <Icon {...p}><path d="m10 3 7 4v6l-7 4-7-4V7z"/><path d="M3 7l7 4 7-4M10 11v8"/></Icon>,
  pin2:     (p) => <Icon {...p}><path d="M10 17s-5-5-5-9a5 5 0 0 1 10 0c0 4-5 9-5 9z"/><circle cx="10" cy="8" r="1.6"/></Icon>,
  copy:     (p) => <Icon {...p}><rect x="7" y="3" width="10" height="12" rx="1.5"/><path d="M13 17H5a1 1 0 0 1-1-1V7"/></Icon>,
  refresh:  (p) => <Icon {...p}><path d="M16 6a7 7 0 1 0 1.6 5"/><path d="M17 3v3h-3"/></Icon>,
  download: (p) => <Icon {...p}><path d="M10 3v9M6 9l4 4 4-4M4 16h12"/></Icon>,
  play:     (p) => <Icon {...p}><path d="M6 4v12l10-6z"/></Icon>,
  eye:      (p) => <Icon {...p}><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.4"/></Icon>,
  doc:      (p) => <Icon {...p}><path d="M5 3h7l3 3v11H5z"/><path d="M12 3v3h3M7 10h6M7 13h6"/></Icon>,
  map:      (p) => <Icon {...p}><path d="m3 5 5-2 4 2 5-2v12l-5 2-4-2-5 2zM8 3v12M12 5v12"/></Icon>,
  link:     (p) => <Icon {...p}><path d="M9 11a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5L10 5"/><path d="M11 9a3.5 3.5 0 0 0-5 0L3.5 11.5a3.5 3.5 0 0 0 5 5L10 15"/></Icon>,
  logout:   (p) => <Icon {...p}><path d="M12 3H4v14h8M9 10h10M16 7l3 3-3 3"/></Icon>,
  filter:   (p) => <Icon {...p}><path d="M3 4h14l-5 7v5l-4-2v-3z"/></Icon>,
  building: (p) => <Icon {...p}><rect x="4" y="3" width="12" height="14" rx="1"/><path d="M7 6h2M11 6h2M7 9h2M11 9h2M7 12h2M11 12h2M9 17v-2h2v2"/></Icon>,
  chart:    (p) => <Icon {...p}><path d="M3 16V8M8 16V4M13 16v-6M18 16V11"/></Icon>,
  gear:     (p) => <Icon {...p}><circle cx="10" cy="10" r="2.4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></Icon>,
  hash:     (p) => <Icon {...p}><path d="M7 3 5 17M15 3l-2 14M3 7h14M3 13h14"/></Icon>,
};

window.Icons = Icons;

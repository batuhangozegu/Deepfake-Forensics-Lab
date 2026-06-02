/* ============================================================
   ICONS — clean stroke icons (feather-style)
   ============================================================ */
const Ic = ({ d, size = 20, sw = 1.8, fill = "none", children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
       strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconShield = (p) => (
  <Ic {...p}><path d="M12 2.5l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5v-5l7-3z" />
    <path d="M9.2 12l2 2 3.6-4" /></Ic>
);
const IconMail = (p) => (
  <Ic {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M4 7l8 5.5L20 7" /></Ic>
);
const IconLock = (p) => (
  <Ic {...p}><rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Ic>
);
const IconEye = (p) => (
  <Ic {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" /></Ic>
);
const IconEyeOff = (p) => (
  <Ic {...p}><path d="M4 4l16 16" />
    <path d="M9.5 9.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" />
    <path d="M6.3 6.5C3.9 8 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1" />
    <path d="M9.8 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.4 3.2" /></Ic>
);
const IconScan = (p) => (
  <Ic {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="2.5" /></Ic>
);
const IconClock = (p) => (
  <Ic {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Ic>
);
const IconLogout = (p) => (
  <Ic {...p}><path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M9 12h11M16.5 8.5L20 12l-3.5 3.5" /></Ic>
);
const IconUpload = (p) => (
  <Ic {...p}><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /></Ic>
);
const IconRefresh = (p) => (
  <Ic {...p}><path d="M4 11a8 8 0 0 1 13.7-5.3L20 8M20 4v4h-4" />
    <path d="M20 13a8 8 0 0 1-13.7 5.3L4 16M4 20v-4h4" /></Ic>
);
const IconSearch = (p) => (
  <Ic {...p}><circle cx="11" cy="11" r="6.5" /><path d="M21 21l-5-5" /></Ic>
);
const IconFilter = (p) => (
  <Ic {...p}><path d="M4 5h16l-6.2 7.4V19l-3.6-2v-4.6L4 5z" /></Ic>
);
const IconFile = (p) => (
  <Ic {...p}><path d="M6 3h8l4 4v12.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5V3z" />
    <path d="M14 3v4h4" /></Ic>
);
const IconFilm = (p) => (
  <Ic {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9h17M3.5 15h17M8.5 4.5v15M15.5 4.5v15" /></Ic>
);
const IconChip = (p) => (
  <Ic {...p}><rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 6.5V4M15 6.5V4M9 20v-2.5M15 20v-2.5M6.5 9H4M6.5 15H4M20 9h-2.5M20 15h-2.5" /></Ic>
);
const IconLink = (p) => (
  <Ic {...p}><path d="M9 12h6" />
    <path d="M10 8.5H8a3.5 3.5 0 0 0 0 7h2M14 8.5h2a3.5 3.5 0 0 1 0 7h-2" /></Ic>
);
const IconChevron = (p) => ( <Ic {...p}><path d="M9 6l6 6-6 6" /></Ic> );
const IconX = (p) => ( <Ic {...p}><path d="M6 6l12 12M18 6L6 18" /></Ic> );
const IconTrash = (p) => (
  <Ic {...p}><path d="M5 7h14M10 7V5h4v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" /></Ic>
);
const IconGrid = (p) => (
  <Ic {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Ic>
);
const IconPlay = (p) => (
  <Ic {...p} fill="currentColor" sw={0}><path d="M8 5.5v13l11-6.5-11-6.5z" /></Ic>
);
const IconDoc = (p) => (
  <Ic {...p}><path d="M6 3h8l4 4v12.5A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5V3z" />
    <path d="M14 3v4h4M9 12h6M9 15.5h6M9 8.5h2" /></Ic>
);
const IconWarn = (p) => (
  <Ic {...p}><path d="M12 4l9 15.5H3L12 4z" /><path d="M12 10v4M12 16.5v.5" /></Ic>
);
const IconCheck = (p) => ( <Ic {...p}><path d="M5 12.5l4.5 4.5L19 7" /></Ic> );
const IconBolt = (p) => (
  <Ic {...p}><path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" /></Ic>
);
const IconUser = (p) => (
  <Ic {...p}><circle cx="12" cy="8" r="3.6" />
    <path d="M5 20a7 7 0 0 1 14 0" /></Ic>
);
const IconUsers = (p) => (
  <Ic {...p}><circle cx="9" cy="8" r="3.2" />
    <path d="M3 19a6 6 0 0 1 12 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 19a6 6 0 0 0-3-5.2" /></Ic>
);
const IconUserCheck = (p) => (
  <Ic {...p}><circle cx="9" cy="8" r="3.4" />
    <path d="M3 19a6 6 0 0 1 12 0" />
    <path d="M16 11.5l2 2 3.5-3.5" /></Ic>
);
const IconPlus = (p) => (
  <Ic {...p}><path d="M12 5v14M5 12h14" /></Ic>
);
const IconEdit = (p) => (
  <Ic {...p}><path d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5z" />
    <path d="M13 7l4 4" /></Ic>
);
const IconCheckCircle = (p) => (
  <Ic {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.2l2.6 2.6L16 9.4" /></Ic>
);
const IconChevronDown = (p) => (
  <Ic {...p}><path d="M6 9l6 6 6-6" /></Ic>
);

Object.assign(window, {
  IconShield, IconMail, IconLock, IconEye, IconEyeOff, IconScan, IconClock,
  IconLogout, IconUpload, IconRefresh, IconSearch, IconFilter, IconFile,
  IconFilm, IconChip, IconLink, IconChevron, IconX, IconTrash, IconGrid,
  IconPlay, IconDoc, IconWarn, IconCheck, IconBolt,
  IconUser, IconUsers, IconUserCheck, IconPlus, IconEdit, IconCheckCircle, IconChevronDown,
});

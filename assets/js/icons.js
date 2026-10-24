/* ==========================================================================
   BIBLIOTECA DE ÍCONES VETORIAIS SVG (ALTO NÍVEL UI/UX)
   Estilo: Traço Fino (1.75px), Minimalista, 100% Livre de Emojis
   ========================================================================== */

const Icons = {
  svg(pathContent, size = 16, className = "") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="${className}">${pathContent}</svg>`;
  },

  dashboard(size = 16) {
    return this.svg(`<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>`, size);
  },

  camera(size = 16) {
    return this.svg(`<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`, size);
  },

  video(size = 16) {
    return this.svg(`<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>`, size);
  },

  calculator(size = 16) {
    return this.svg(`<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>`, size);
  },

  bases(size = 16) {
    return this.svg(`<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`, size);
  },

  map(size = 16) {
    return this.svg(`<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>`, size);
  },

  shieldCheck(size = 16) {
    return this.svg(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>`, size);
  },

  fileText(size = 16) {
    return this.svg(`<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>`, size);
  },

  coins(size = 16) {
    return this.svg(`<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="m7 6 5 5"/>`, size);
  },

  cpu(size = 16) {
    return this.svg(`<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>`, size);
  },

  desktop(size = 16) {
    return this.svg(`<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>`, size);
  },

  tablet(size = 16) {
    return this.svg(`<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>`, size);
  },

  smartphone(size = 16) {
    return this.svg(`<rect width="14" height="20" x="5" y="2" rx="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>`, size);
  },

  installApp(size = 16) {
    return this.svg(`<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 14V7"/><polyline points="9 11 12 14 15 11"/>`, size);
  },

  plus(size = 16) {
    return this.svg(`<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>`, size);
  },

  close(size = 16) {
    return this.svg(`<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>`, size);
  },

  check(size = 16) {
    return this.svg(`<polyline points="20 6 9 17 4 12"/>`, size);
  },

  user(size = 16) {
    return this.svg(`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`, size);
  },

  users(size = 16) {
    return this.svg(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, size);
  },

  userPlus(size = 16) {
    return this.svg(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>`, size);
  },

  download(size = 16) {
    return this.svg(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>`, size);
  },

  layers(size = 16) {
    return this.svg(`<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`, size);
  },

  refresh(size = 16) {
    return this.svg(`<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>`, size);
  },

  sliders(size = 16) {
    return this.svg(`<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>`, size);
  },

  logOut(size = 16) {
    return this.svg(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>`, size);
  },

  lock(size = 16) {
    return this.svg(`<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`, size);
  },

  key(size = 16) {
    return this.svg(`<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>`, size);
  },

  shield(size = 16) {
    return this.svg(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`, size);
  },

  eye(size = 16) {
    return this.svg(`<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`, size);
  },

  eyeOff(size = 16) {
    return this.svg(`<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>`, size);
  },

  box3d(size = 16) {
    return this.svg(`<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`, size);
  },

  sparkles(size = 16) {
    return this.svg(`<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M19 3v4"/><path d="M21 5h-4"/>`, size);
  },

  shirt(size = 16) {
    return this.svg(`<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 1.97 1.67H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10.86h1.17a2 2 0 0 0 1.97-1.67l.58-3.5a2 2 0 0 0-1.34-2.23Z"/>`, size);
  },

  sword(size = 16) {
    return this.svg(`<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/>`, size);
  },

  zap(size = 16) {
    return this.svg(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`, size);
  },

  award(size = 16) {
    return this.svg(`<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`, size);
  },

  maximize(size = 16) {
    return this.svg(`<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>`, size);
  },

  compass(size = 16) {
    return this.svg(`<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`, size);
  },

  arrowRight(size = 16) {
    return this.svg(`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`, size);
  },

  chevronLeft(size = 16) {
    return this.svg(`<polyline points="15 18 9 12 15 6"/>`, size);
  },

  chevronRight(size = 16) {
    return this.svg(`<polyline points="9 18 15 12 9 6"/>`, size);
  },

  panelLeft(size = 16) {
    return this.svg(`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>`, size);
  },

  panelRight(size = 16) {
    return this.svg(`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>`, size);
  },

  panelLeftClose(size = 16) {
    return this.svg(`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 15-3-3 3-3"/>`, size);
  },

  panelRightClose(size = 16) {
    return this.svg(`<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 9 3 3-3 3"/>`, size);
  },

  copy(size = 16) {
    return this.svg(`<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`, size);
  },

  edit(size = 16) {
    return this.svg(`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`, size);
  },

  save(size = 16) {
    return this.svg(`<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`, size);
  },

  clock(size = 16) {
    return this.svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, size);
  },

  alertCircle(size = 16) {
    return this.svg(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`, size);
  },

  link(size = 16) {
    return this.svg(`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`, size);
  },

  search(size = 16) {
    return this.svg(`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`, size);
  },

  heart(size = 16, filled = false) {
    if (filled) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon-heart-filled"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    }
    return this.svg(`<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`, size);
  },

  messageCircle(size = 16) {
    return this.svg(`<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>`, size);
  },

  send(size = 16) {
    return this.svg(`<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`, size);
  },

  trash(size = 14) {
    return this.svg(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`, size);
  }
};

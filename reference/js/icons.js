// ============================================
// SHARED SVG ICON LIBRARY
// Each icon stores the inner SVG content (paths/shapes)
// with viewBox and default attributes.
// Use icon() helper to render with custom size.
// ============================================

var ICONS = {
  brain: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" width="13" height="13"><path d="M4 2.5C2.5 2.5 1.5 3.8 1.5 5.2c0 1 .4 1.7.9 2.2"/><path d="M2.4 7.4c-.5.6-.7 1.5-.3 2.3.4.9 1.2 1.3 2 1.3"/><path d="M4.1 11c-.1.8.3 1.7 1.1 2.2.9.5 1.8.4 2.5 0"/><path d="M7.7 13.2c.5.5 1.3.8 2.1.5.9-.3 1.4-1 1.5-1.8"/><path d="M11.3 11.9c.7-.1 1.4-.6 1.7-1.4.3-.9 0-1.8-.5-2.3"/><path d="M12.5 8.2c.6-.5 1-1.3 1-2.2 0-1.4-1-2.7-2.5-2.7"/><path d="M11 3.3c-.3-1-1.2-1.8-2.5-1.8S6.3 2.3 6 3.3"/><path d="M4 3.3c.3-1 1.2-1.8 2-1.8"/><path d="M3.5 5.5c1.5 0 3 .8 4 2"/><path d="M7.5 7.5c1-1.2 2.5-2 4-2"/><path d="M7.5 7.5v5.7"/></svg>',

  lessons: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M2 2h12v11H9l-1 2-1-2H2z"/><line x1="5" y1="5.5" x2="11" y2="5.5"/><line x1="5" y1="8.5" x2="9" y2="8.5"/></svg>',

  graphs: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="8" cy="13" r="2"/><line x1="5.5" y1="5.5" x2="7" y2="11"/><line x1="10.5" y1="5.5" x2="9" y2="11"/><line x1="6" y1="4" x2="10" y2="4"/></svg>',

  chat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M1 3h14v9H5l-4 3v-3H1z"/></svg>',

  workflows: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>',

  gauge: '<svg viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="11"><path d="M1 11 A7 7 0 0 1 15 11"/><line x1="8" y1="11" x2="10.5" y2="4" stroke-width="2" stroke-linecap="square"/><rect x="6.5" y="9.5" width="3" height="3" fill="currentColor" stroke="none"/></svg>',

  folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1.5 3.5v9h13v-7h-7l-2-2z"/></svg>',

  export: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M8 1.5v9M4.5 7L8 10.5 11.5 7"/><path d="M2.5 11.5v3h11v-3"/></svg>',

  share: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="3" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="12" cy="13" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="4"/><line x1="5.8" y1="9" x2="10.2" y2="12"/></svg>',

  thumbUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22V11l3-8 2 1-1 5h7a2 2 0 0 1 2 2.2l-1.2 7A2 2 0 0 1 16.8 20H7z"/><rect x="1" y="11" width="5" height="11"/></svg>',

  thumbDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2v11l-3 8-2-1 1-5H6a2 2 0 0 1-2-2.2l1.2-7A2 2 0 0 1 7.2 4H17z"/><rect x="18" y="2" width="5" height="11"/></svg>',

  attach: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M8.5 3.5v7a2 2 0 0 1-4 0v-7a3 3 0 0 1 6 0v7.5a4 4 0 0 1-8 0V5"/></svg>',

  computer: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="1.5" y="1.5" width="13" height="9"/><line x1="6" y1="10.5" x2="6" y2="13"/><line x1="10" y1="10.5" x2="10" y2="13"/><line x1="4" y1="13" x2="12" y2="13"/></svg>',

  cloud: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4 13.5H3.5a3 3 0 0 1-.4-5.97 4 4 0 0 1 7.8-1.53A3.5 3.5 0 0 1 13 12.5H4z"/></svg>',

  send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M1.5 8h11M8.5 4L12.5 8 8.5 12"/></svg>',

  chevronDown: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6l4 4 4-4"/></svg>',

  chevronUp: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 10l4-4 4 4"/></svg>',

  chevronLeft: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10 3l-5 5 5 5"/></svg>',

  chevronRight: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M6 3l5 5-5 5"/></svg>',

  stop: '<svg class="stop-icon" viewBox="0 0 12 12" fill="currentColor"><rect x="1" y="1" width="10" height="10" rx="0"/></svg>',

  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="14" y2="14"/></svg>',

  person: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" width="11" height="11" class="inline-icon"><circle cx="8" cy="5" r="3"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>',

  building: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" width="11" height="11" class="inline-icon"><rect x="2" y="4" width="12" height="10"/><rect x="5" y="1" width="6" height="5"/><line x1="8" y1="8" x2="8" y2="10"/></svg>',

  edit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"/></svg>',

  cosimo: '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 2l1.5 3.5L13 7l-3.5 1.5L8 12l-1.5-3.5L3 7l3.5-1.5z"/></svg>',

  trash: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><line x1="3" y1="4" x2="13" y2="4"/><path d="M5.5 4V2.5h5V4"/><path d="M4.5 4v9.5h7V4"/><line x1="7" y1="6.5" x2="7" y2="11"/><line x1="9" y1="6.5" x2="9" y2="11"/></svg>',

  trashRed: '<svg viewBox="0 0 16 16" fill="none" stroke="var(--red)" stroke-width="1.5" width="14" height="14"><line x1="3" y1="4" x2="13" y2="4"/><path d="M5.5 4V2.5h5V4"/><path d="M4.5 4v9.5h7V4"/><line x1="7" y1="6.5" x2="7" y2="11"/><line x1="9" y1="6.5" x2="9" y2="11"/></svg>',

  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>',

  arrowLeft: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="11" height="11"><path d="M15 8H1M5 4l-4 4 4 4"/></svg>',

  arrowRight: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="11" height="11" class="inline-icon"><path d="M1 8h14M11 4l4 4-4 4"/></svg>',

  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5.5" y="1.5" width="8" height="10"/><path d="M2.5 4.5v10h8"/></svg>',

  regen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.75M13.5 8a5.5 5.5 0 0 1-9.5 3.75"/><path d="M12 1v3.25h-3.25M4 15v-3.25h3.25" fill="currentColor" stroke="none"/></svg>',

  dots: '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg>',

  checkmark: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 8.5l4 4 8-9"/></svg>',

  retry: '<svg class="retry-icon" viewBox="0 0 16 16" fill="none"><path d="M13.65 2.35A7.96 7.96 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14 6 6 0 1 1 8 2c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/></svg>',

  // Workflow trigger type icons
  folderWatch: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1.5 3.5v9h13v-7h-7l-2-2z"/><circle cx="11" cy="8.5" r="1.5" stroke-width="1.2"/><circle cx="11" cy="8.5" r="0.5" fill="currentColor" stroke="none"/></svg>',

  schedule: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l3 2"/></svg>',

  chatCommand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="1.5" y="2.5" width="13" height="11" rx="1"/><path d="M4.5 7l2.5 2-2.5 2"/><line x1="8.5" y1="11" x2="11.5" y2="11"/></svg>',

  emailTrigger: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="1.5" y="3" width="13" height="10"/><path d="M1.5 3l6.5 5.5L14.5 3"/></svg>',

  manualTrigger: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M5 2.5v11l8-5.5z"/></svg>',

  webhook: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M4.5 6.5l2-2 2 2 2-2 2 2"/><path d="M4.5 10.5l2-2 2 2 2-2 2 2"/></svg>'
};

// Helper: return an icon SVG string with custom width/height
function icon(name, w, h) {
  var svg = ICONS[name];
  if (!svg) return '';
  if (w != null && h != null) {
    // Replace or insert width/height attributes
    svg = svg.replace(/width="[^"]*"/, 'width="' + (w || 14) + '"');
    svg = svg.replace(/height="[^"]*"/, 'height="' + (h || 14) + '"');
  }
  return svg;
}

// Inject icons into all elements with data-icon attribute
function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach(function(el) {
    var name = el.getAttribute('data-icon');
    var w = el.getAttribute('data-icon-w');
    var h = el.getAttribute('data-icon-h');
    if (ICONS[name]) {
      el.innerHTML = icon(name, w ? parseInt(w) : null, h ? parseInt(h) : null);
    }
  });
}

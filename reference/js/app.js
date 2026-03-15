// All MOCK_* and CONFIG_* data objects are in js/mock-data.js
// All SVG icons are in js/icons.js — use ICONS.name or icon(name, w, h)

// Inject icons from data-icon attributes on page load
injectIcons();

// ============================================
// RICH TEXT INPUT
// ============================================
(function() {
  // Keyboard shortcuts: Cmd/Ctrl + B, I, U, Shift+7 (ordered list), Shift+8 (bullet list)
  document.addEventListener('keydown', function(e) {
    const el = e.target;
    if (!el.isContentEditable) return;

    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
    } else if (e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
    } else if (e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
    } else if (e.shiftKey && e.key === '7') {
      e.preventDefault();
      document.execCommand('insertOrderedList');
    } else if (e.shiftKey && e.key === '8') {
      e.preventDefault();
      document.execCommand('insertUnorderedList');
    }
  });

  // Markdown-as-you-type: convert patterns on input
  document.addEventListener('input', function(e) {
    const el = e.target;
    if (!el.isContentEditable) return;
    convertMarkdown(el);
  });

  function convertMarkdown(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    const offset = range.startOffset;

    // Bold: **text**
    const boldMatch = text.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      applyInlineFormat(node, boldMatch, 'b', el);
      return;
    }

    // Italic: *text* (but not **)
    const italicMatch = text.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    if (italicMatch) {
      applyInlineFormat(node, italicMatch, 'i', el);
      return;
    }

    // Bullet list: line starting with "- " or "* "
    if (/^[-*] $/.test(text) && node.parentNode === el) {
      node.textContent = '';
      document.execCommand('insertUnorderedList');
      return;
    }

    // Numbered list: line starting with "1. "
    if (/^\d+\. $/.test(text) && node.parentNode === el) {
      node.textContent = '';
      document.execCommand('insertOrderedList');
      return;
    }
  }

  function applyInlineFormat(textNode, match, tag, editor) {
    const before = textNode.textContent.substring(0, match.index);
    const after = textNode.textContent.substring(match.index + match[0].length);
    const inner = match[1];

    const parent = textNode.parentNode;

    // Build replacement nodes
    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));

    const formatted = document.createElement(tag);
    formatted.textContent = inner;
    frag.appendChild(formatted);

    // Add a space after so cursor has somewhere to go
    const afterNode = document.createTextNode(after || '\u00A0');
    frag.appendChild(afterNode);

    parent.replaceChild(frag, textNode);

    // Place cursor after the formatted text
    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(afterNode, after ? 0 : 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
})();

// ============================================
// NAMESPACE DECLARATIONS
// ============================================
var A11y = {};
var UI = {};
var Chat = {};
var Workflows = {};
var BrainMemory = {};
var BrainLessons = {};
var Graph = {};

// ============================================
// THEME TOGGLE
// ============================================
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

// ============================================
// DRAG & DROP FILE ZONE (#7)
// ============================================
(function() {
  let dragCounter = 0;
  document.addEventListener('dragenter', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    e.preventDefault();
    dragCounter++;
    area.classList.add('drop-active');
  });
  document.addEventListener('dragleave', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    dragCounter--;
    if (dragCounter <= 0) {
      area.classList.remove('drop-active');
      dragCounter = 0;
    }
  });
  document.addEventListener('dragover', function(e) {
    if (e.target.closest('.input-area')) e.preventDefault();
  });
  document.addEventListener('drop', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    e.preventDefault();
    area.classList.remove('drop-active');
    dragCounter = 0;
    const files = e.dataTransfer.files;
    if (files.length) {
      showToast('Attached: ' + files[0].name);
    }
  });
})();

// ============================================
// MESSAGE HOVER ACTIONS (#1)
// ============================================
(function() {
  // SVG icons — from shared ICONS object
  const icons = { copy: ICONS.copy, regen: ICONS.regen, del: ICONS.trash };

  document.addEventListener('mouseenter', function(e) {
    const block = e.target.closest('.msg-block');
    if (!block || block.querySelector('.msg-actions')) return;

    const isAI = !!block.querySelector('.ai-block');
    const isUser = !!block.querySelector('.user-card');
    if (!isAI && !isUser) return;

    const bar = document.createElement('div');
    bar.className = 'msg-actions';

    // Copy button — always
    const copyBtn = makeActionBtn(icons.copy, 'Copy', function() {
      const body = block.querySelector('.msg-body');
      if (body) {
        navigator.clipboard.writeText(body.textContent.trim()).then(() => showToast('Copied to clipboard'));
      }
    });
    bar.appendChild(copyBtn);

    // Regenerate — AI only
    if (isAI) {
      const regenBtn = makeActionBtn(icons.regen, 'Regenerate', function() {
        showToast('Regenerating response...');
      });
      bar.appendChild(regenBtn);
    }

    // Delete — always
    const delBtn = makeActionBtn(icons.del, 'Delete', function() {
      block.style.transition = 'opacity 0.2s ease, max-height 0.3s ease';
      block.style.opacity = '0';
      block.style.maxHeight = block.offsetHeight + 'px';
      block.style.overflow = 'hidden';
      setTimeout(() => {
        block.style.maxHeight = '0';
        block.style.marginBottom = '0';
        block.style.padding = '0';
      }, 50);
      setTimeout(() => block.remove(), 350);
      showToast('Message deleted');
    });
    bar.appendChild(delBtn);

    block.appendChild(bar);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    const block = e.target.closest('.msg-block');
    if (!block) return;
    const related = e.relatedTarget;
    if (related && block.contains(related)) return;
    const bar = block.querySelector('.msg-actions');
    if (bar) bar.remove();
  }, true);

  function makeActionBtn(svg, title, onClick) {
    const btn = document.createElement('button');
    btn.className = 'msg-action-btn';
    btn.title = title;
    btn.innerHTML = svg;
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }
})();

// ============================================
// THREAD HOVER ACTIONS (#10)
// ============================================
(function() {
  const shareIcon = ICONS.share;
  const delIcon = ICONS.trash;

  document.addEventListener('mouseenter', function(e) {
    const item = e.target.closest('.thread-item');
    if (!item || item.querySelector('.thread-actions')) return;

    const bar = document.createElement('div');
    bar.className = 'thread-actions';

    // Share
    const shareBtn = document.createElement('button');
    shareBtn.className = 'thread-action-btn';
    shareBtn.title = 'Share';
    shareBtn.innerHTML = shareIcon;
    shareBtn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      showToast('Share link copied');
    });
    bar.appendChild(shareBtn);

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'thread-action-btn';
    delBtn.title = 'Delete';
    delBtn.innerHTML = delIcon;
    delBtn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      item.style.transition = 'opacity 0.2s';
      item.style.opacity = '0';
      setTimeout(() => item.remove(), 200);
      showToast('Thread deleted');
    });
    bar.appendChild(delBtn);

    item.appendChild(bar);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    const item = e.target.closest('.thread-item');
    if (!item) return;
    const related = e.relatedTarget;
    if (related && item.contains(related)) return;
    const bar = item.querySelector('.thread-actions');
    if (bar) bar.remove();
  }, true);
})();

// ============================================
// DRAG-RESIZE PANELS
// ============================================
(function() {
  function initResize(handleId, getTarget, getSide) {
    const handle = document.getElementById(handleId);
    if (!handle) return;

    let startX, startW, target;

    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      target = getTarget();
      if (!target) return;
      startX = e.clientX;
      startW = target.offsetWidth;
      handle.classList.add('dragging');
      target.classList.add('no-transition');
      target.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(e) {
        const delta = e.clientX - startX;
        const newW = getSide === 'left'
          ? startW - delta   // right panel: drag left = wider
          : startW + delta;  // sidebar: drag right = wider
        target.style.width = newW + 'px';
      }

      function onUp() {
        handle.classList.remove('dragging');
        target.classList.remove('no-transition');
        target.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Sidebar: drag right edge to resize, with narrow breakpoint snap
  (function() {
    var NARROW_SNAP = 56;
    var NARROW_THRESHOLD = 110;
    var handle = document.getElementById('sidebarResizeHandle');
    if (!handle) return;
    var startX, startW, sidebar;

    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      sidebar = document.getElementById('sidebar');
      if (!sidebar) return;
      startX = e.clientX;
      startW = sidebar.offsetWidth;
      handle.classList.add('dragging');
      sidebar.classList.add('no-transition');
      sidebar.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(e) {
        var newW = startW + (e.clientX - startX);
        if (newW < NARROW_THRESHOLD) {
          sidebar.style.width = NARROW_SNAP + 'px';
          sidebar.classList.add('narrow');
        } else {
          sidebar.classList.remove('narrow');
          sidebar.style.width = newW + 'px';
        }
      }

      function onUp() {
        handle.classList.remove('dragging');
        sidebar.classList.remove('no-transition');
        sidebar.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  })();

  // File panel: drag left edge to resize
  initResize('filePanelResizeHandle',
    () => document.getElementById('filePanel'),
    'left'
  );

  // Workflow panel: drag left edge to resize
  initResize('wfPanelResizeHandle',
    () => document.getElementById('workflowPanel'),
    'left'
  );
})();

/** Toggles between light and dark theme and re-applies purple intensity.
 * Modifies DOM (data-theme attribute) and localStorage.
 */
A11y.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  // Re-apply purple intensity for new theme
  const saved = localStorage.getItem('purpleIntensity');
  if (saved) A11y.applyPurpleIntensity(saved);
  A11y.syncA11yToggles();
};

// ============================================
// COLOR UTILITIES
// ============================================
/** Color conversion utilities for the purple intensity slider.
 * Methods: hexToHsl, hslToHex, hexToRgbString.
 */
var ColorUtils = {
  /** Converts a hex color string to HSL array [h, s, l]. */
  hexToHsl: function(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  },

  /** Converts HSL values to a hex color string. */
  hslToHex: function(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      function hue2rgb(p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return '#' + [r, g, b].map(function(x) {
      var hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  /** Converts a hex color to an "r,g,b" string for use in rgba(). */
  hexToRgbString: function(hex) {
    return parseInt(hex.slice(1,3),16) + ',' +
           parseInt(hex.slice(3,5),16) + ',' +
           parseInt(hex.slice(5,7),16);
  }
};

// ============================================
// PURPLE INTENSITY
// ============================================
/** Adjusts purple/violet/berry color token saturation based on slider value.
 * @param {string|number} value - Intensity percentage (0-100)
 * Modifies DOM CSS custom properties and localStorage.
 */
A11y.applyPurpleIntensity = function(value) {
  var intensity = parseInt(value, 10);
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var bases = isDark ? CONFIG_PURPLE_BASE_COLORS.dark : CONFIG_PURPLE_BASE_COLORS.light;
  var root = document.documentElement;

  Object.keys(bases).forEach(function(prop) {
    var hsl = ColorUtils.hexToHsl(bases[prop]);
    var newSat = Math.min(100, hsl[1] * (intensity / 100));
    var newHex = ColorUtils.hslToHex(hsl[0], newSat, hsl[2]);
    root.style.setProperty(prop, newHex);

    // Also update RGB triplet if this token has one
    if (CONFIG_RGB_COMPANIONS[prop]) {
      root.style.setProperty(CONFIG_RGB_COMPANIONS[prop], ColorUtils.hexToRgbString(newHex));
    }
  });

  // Update label
  var label = document.getElementById('contrastValue');
  if (label) label.textContent = intensity + '%';

  localStorage.setItem('purpleIntensity', intensity);
};

// Restore saved intensity on load
(function() {
  var saved = localStorage.getItem('purpleIntensity');
  if (saved) {
    A11y.applyPurpleIntensity(saved);
    var slider = document.getElementById('purpleIntensitySlider');
    if (slider) slider.value = saved;
  }
})();

// ============================================
// ACCESSIBILITY
// ============================================

// --- Font size boost ---
// App uses px units throughout, so root font-size changes have no effect.
// CSS zoom on the app frame scales everything proportionally including px.
// We compensate the frame dimensions so it still fills the viewport.
var fontSizeZoomLevels = [1, 1.05, 1.1, 1.15, 1.2];

/** Applies CSS zoom to the app frame for font size accessibility scaling.
 * @param {string|number} value - Step index (0-4) into fontSizeZoomLevels
 * Modifies DOM (CSS zoom) and localStorage.
 */
A11y.applyFontSizeBoost = function(value) {
  var step = parseInt(value, 10);
  var zoom = fontSizeZoomLevels[step] || 1;
  var frame = document.querySelector('.app-frame');
  if (!frame) return;

  if (zoom === 1) {
    frame.style.zoom = '';
    frame.style.width = '';
    frame.style.height = '';
  } else {
    frame.style.zoom = zoom;
    frame.style.width = (100 / zoom) + 'vw';
    frame.style.height = (100 / zoom) + 'vh';
  }

  var label = document.getElementById('fontSizeValue');
  if (label) {
    if (step === 0) label.textContent = '100%';
    else label.textContent = Math.round(zoom * 100) + '%';
  }
  localStorage.setItem('a11yFontSize', step);
};

// --- Dyslexia font ---
/** Toggles the dyslexia-friendly font mode on/off.
 * Modifies DOM (data-a11y-font attribute) and localStorage.
 */
A11y.toggleDyslexiaFont = function() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-font') === 'dyslexia';
  if (active) {
    root.removeAttribute('data-a11y-font');
    localStorage.setItem('a11yDyslexia', 'off');
  } else {
    root.setAttribute('data-a11y-font', 'dyslexia');
    localStorage.setItem('a11yDyslexia', 'on');
  }
  A11y.syncA11yToggles();
};

// --- Reduced motion ---
/** Toggles reduced motion accessibility mode on/off.
 * Modifies DOM (data-a11y-motion attribute) and localStorage.
 */
A11y.toggleReducedMotion = function() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-motion') === 'reduced';
  if (active) {
    root.removeAttribute('data-a11y-motion');
    localStorage.setItem('a11yMotion', 'off');
  } else {
    root.setAttribute('data-a11y-motion', 'reduced');
    localStorage.setItem('a11yMotion', 'on');
  }
  A11y.syncA11yToggles();
};

// --- High contrast + focus ---
/** Toggles high contrast accessibility mode on/off.
 * Modifies DOM (data-a11y-contrast attribute) and localStorage.
 */
A11y.toggleHighContrast = function() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-contrast') === 'high';
  if (active) {
    root.removeAttribute('data-a11y-contrast');
    localStorage.setItem('a11yContrast', 'off');
  } else {
    root.setAttribute('data-a11y-contrast', 'high');
    localStorage.setItem('a11yContrast', 'on');
  }
  A11y.syncA11yToggles();
};

/** Toggles icon labels mode — replaces icon-only buttons with text labels. */
A11y.toggleIconLabels = function() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-labels') === 'show';
  if (active) {
    root.removeAttribute('data-a11y-labels');
    localStorage.setItem('a11yLabels', 'off');
  } else {
    root.setAttribute('data-a11y-labels', 'show');
    localStorage.setItem('a11yLabels', 'on');
  }
  A11y.syncA11yToggles();
};

/** Injects hidden label spans into all buttons with data-label attributes. */
A11y.injectIconLabels = function() {
  document.querySelectorAll('[data-label]').forEach(function(el) {
    if (el.querySelector('.a11y-label')) return;
    var span = document.createElement('span');
    span.className = 'a11y-label';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = el.getAttribute('data-label');
    el.appendChild(span);
  });
};

// --- Sync toggle visuals to current state ---
/** Synchronizes all accessibility toggle UI elements to match current DOM state. */
A11y.syncA11yToggles = function() {
  var root = document.documentElement;

  var dyslexiaOn = root.getAttribute('data-a11y-font') === 'dyslexia';
  var motionOn = root.getAttribute('data-a11y-motion') === 'reduced';
  var contrastOn = root.getAttribute('data-a11y-contrast') === 'high';
  var labelsOn = root.getAttribute('data-a11y-labels') === 'show';

  var dt = document.getElementById('dyslexiaToggleTrack');
  var dh = document.getElementById('dyslexiaToggleThumb');
  var mt = document.getElementById('motionToggleTrack');
  var mh = document.getElementById('motionToggleThumb');
  var ct = document.getElementById('contrastToggleTrack');
  var ch = document.getElementById('contrastToggleThumb');
  var lt = document.getElementById('labelsToggleTrack');
  var lh = document.getElementById('labelsToggleThumb');

  if (dt) dt.classList.toggle('active', dyslexiaOn);
  if (dh) dh.classList.toggle('active', dyslexiaOn);
  if (mt) mt.classList.toggle('active', motionOn);
  if (mh) mh.classList.toggle('active', motionOn);
  if (ct) ct.classList.toggle('active', contrastOn);
  if (ch) ch.classList.toggle('active', contrastOn);
  if (lt) lt.classList.toggle('active', labelsOn);
  if (lh) lh.classList.toggle('active', labelsOn);

  // Sync aria-checked on toggle switches
  var dyslexiaSwitch = dt ? dt.closest('[role="switch"]') : null;
  var motionSwitch = mt ? mt.closest('[role="switch"]') : null;
  var contrastSwitch = ct ? ct.closest('[role="switch"]') : null;
  var labelsSwitch = lt ? lt.closest('[role="switch"]') : null;
  if (dyslexiaSwitch) dyslexiaSwitch.setAttribute('aria-checked', String(dyslexiaOn));
  if (motionSwitch) motionSwitch.setAttribute('aria-checked', String(motionOn));
  if (contrastSwitch) contrastSwitch.setAttribute('aria-checked', String(contrastOn));
  if (labelsSwitch) labelsSwitch.setAttribute('aria-checked', String(labelsOn));

  // Sync theme toggle
  var themeSwitch = document.getElementById('themeToggleSwitch');
  if (themeSwitch) themeSwitch.setAttribute('aria-checked', String(root.getAttribute('data-theme') === 'dark'));
};

// --- Restore all a11y settings on load ---
(function() {
  var fontSize = localStorage.getItem('a11yFontSize');
  if (fontSize && parseInt(fontSize, 10) > 0) {
    A11y.applyFontSizeBoost(fontSize);
    var slider = document.getElementById('fontSizeSlider');
    if (slider) slider.value = fontSize;
  }

  if (localStorage.getItem('a11yDyslexia') === 'on') {
    document.documentElement.setAttribute('data-a11y-font', 'dyslexia');
  }
  // Respect OS preference, or saved user preference
  var motionPref = localStorage.getItem('a11yMotion');
  if (motionPref === 'on' || (motionPref === null && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    document.documentElement.setAttribute('data-a11y-motion', 'reduced');
  }
  if (localStorage.getItem('a11yContrast') === 'on') {
    document.documentElement.setAttribute('data-a11y-contrast', 'high');
  }
  if (localStorage.getItem('a11yLabels') === 'on') {
    document.documentElement.setAttribute('data-a11y-labels', 'show');
  }

  A11y.syncA11yToggles();
  A11y.injectIconLabels();
})();

// ============================================
// MODE SWITCHING
// ============================================

/** Toggles the sidebar between collapsed and expanded states.
 * Used internally by Cosimo panel open/close.
 */
UI.toggleSidebar = function() {
  var sidebar = document.getElementById('sidebar');
  var handle = document.getElementById('sidebarResizeHandle');
  if (!sidebar) return;
  var collapsed = sidebar.classList.toggle('collapsed');
  if (handle) handle.style.display = collapsed ? 'none' : '';
};

/** Toggles the Brain nav section between collapsed and expanded states.
 * Persists state to localStorage. Updates toggle button chevron.
 */
UI.toggleBrainNav = function() {
  var nav = document.getElementById('brainNav');
  var btn = document.getElementById('brainNavToggle');
  if (!nav) return;
  var collapsed = nav.classList.toggle('brain-nav-collapsed');
  localStorage.setItem('brainNavCollapsed', collapsed ? 'true' : 'false');
  if (btn) {
    btn.title = collapsed ? 'Expand Brain nav' : 'Collapse Brain nav';
    btn.setAttribute('aria-label', btn.title);
  }
};

// Restore brain nav collapsed state from localStorage
(function() {
  if (localStorage.getItem('brainNavCollapsed') === 'true') {
    var nav = document.getElementById('brainNav');
    var btn = document.getElementById('brainNavToggle');
    if (nav) nav.classList.add('brain-nav-collapsed');
    if (btn) {
      btn.title = 'Expand Brain nav';
      btn.setAttribute('aria-label', 'Expand Brain nav');
    }
  }
})();

UI.currentMode = 'chat';

/** Switches the main view between chat, workflows, and brain modes.
 * @param {string} mode - Target mode ('chat' | 'workflows')
 * @param {HTMLElement} [btn] - The tab button element to mark active
 * Modifies DOM visibility of views and sidebars.
 */
UI.switchMode = function(mode, btn) {
  UI.currentMode = mode;
  document.querySelectorAll('.top-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const chatView = document.getElementById('chatView');
  const workflowsView = document.getElementById('workflowsView');
  const brainView = document.getElementById('brainView');
  const chatSidebar = document.getElementById('chatSidebar');
  const workflowSidebar = document.getElementById('workflowSidebar');
  const newBtn = document.getElementById('newBtn');

  // Hide all views
  chatView.classList.remove('active');
  workflowsView.classList.remove('active');
  brainView.classList.remove('active');

  // Hide sidebars
  chatSidebar.classList.add('hidden');
  workflowSidebar.classList.add('hidden');

  // Clear brain nav active state when switching modes
  document.querySelectorAll('.brain-nav-btn').forEach(b => b.classList.remove('active'));

  if (mode === 'chat') {
    chatView.classList.add('active');
    chatSidebar.classList.remove('hidden');
    newBtn.textContent = '+ New Thread';
    newBtn.classList.remove('hidden');
  } else if (mode === 'workflows') {
    workflowsView.classList.add('active');
    workflowSidebar.classList.remove('hidden');
    newBtn.textContent = '+ New Workflow';
    newBtn.classList.remove('hidden');
    // Restore last-viewed state (detail or listing) instead of always resetting to listing
    if (Workflows._lastViewState && Workflows._lastViewState.templateId) {
      Workflows.showWorkflowDetail(Workflows._lastViewState.templateId);
    } else {
      Workflows.showWorkflowListing();
    }
  }
};

/** Switches to a specific Brain sub-section (memory, lessons, or graphs).
 * @param {string} section - Target section ('memory' | 'lessons' | 'graphs')
 * @param {HTMLElement} [el] - The nav button element to mark active
 * Modifies DOM visibility of views and sidebars.
 */
UI.switchBrainSection = function(section, el) {
  UI.currentMode = 'brain';

  // Update brain nav active state
  document.querySelectorAll('.brain-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');

  // Activate brain view, hide others
  document.getElementById('chatView').classList.remove('active');
  document.getElementById('workflowsView').classList.remove('active');
  document.getElementById('brainView').classList.add('active');

  // Deactivate top tabs (brain has no top tab now)
  document.querySelectorAll('.top-tab').forEach(function(b) { b.classList.remove('active'); });

  // Hide mode-specific sidebars, hide new button
  document.getElementById('chatSidebar').classList.add('hidden');
  document.getElementById('workflowSidebar').classList.add('hidden');
  document.getElementById('newBtn').classList.add('hidden');

  // Switch brain content section
  document.querySelectorAll('.brain-section').forEach(function(s) { s.classList.remove('active'); });
  var target = document.getElementById('brain-' + section);
  if (target) target.classList.add('active');
};


// ============================================
// TASK & CALENDAR PANELS
// ============================================
/** Renders tasks, calendar, and usage header dropdown panels from mock data.
 * Modifies DOM (innerHTML of taskPanel, calendarPanel, usagePanel).
 */
UI.renderHeaderPanels = function() {
  // Render tasks
  var taskPanel = document.getElementById('taskPanel');
  if (taskPanel) {
    var taskItems = MOCK_TASKS.map(function(t) {
      return '<div class="task-item' + (t.urgent ? ' urgent' : '') + '">' +
        '<div class="task-dot"></div>' +
        '<div class="task-body">' +
          '<div class="task-title">' + escapeHtml(t.title) + '</div>' +
          '<div class="task-meta">' + escapeHtml(t.meta) + '</div>' +
        '</div>' +
        (t.urgent ? '<div class="task-priority urgent-label">URGENT</div>' : '') +
      '</div>';
    }).join('');
    taskPanel.innerHTML =
      '<div class="th-dropdown-header">Assigned Tasks <span class="th-dropdown-count">' + MOCK_TASKS.length + '</span></div>' +
      taskItems +
      '<div class="th-dropdown-footer">View all tasks</div>';
  }

  // Render calendar events
  var calPanel = document.getElementById('calendarPanel');
  if (calPanel) {
    var eventsHtml = MOCK_CALENDAR.events.map(function(e) {
      return '<div class="cal-event"><div class="cal-event-dot" style="background:' + e.color + '"></div><div><div class="cal-event-title">' + escapeHtml(e.title) + '</div><div class="cal-event-meta">' + escapeHtml(e.meta) + '</div></div></div>';
    }).join('');
    calPanel.innerHTML =
      '<div class="th-dropdown-header">' + escapeHtml(MOCK_CALENDAR.month) + '</div>' +
      '<div class="mini-cal"><div class="mini-cal-days"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div><div class="mini-cal-grid" id="miniCalGrid"></div></div>' +
      '<div class="th-dropdown-header" style="border-top:1px solid var(--taupe-2);">Upcoming</div>' +
      eventsHtml;
  }

  // Render usage stats
  var usagePanel = document.getElementById('usagePanel');
  if (usagePanel) {
    usagePanel.innerHTML =
      '<div class="th-dropdown-header">Credit Usage — ' + escapeHtml(MOCK_CALENDAR.month) + '</div>' +
      '<div class="usage-meter-wrap">' +
        '<div class="usage-gauge">' +
          '<svg viewBox="0 0 200 130" class="usage-gauge-svg">' +
            '<defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--violet-3)"/><stop offset="60%" stop-color="var(--berry-3)"/><stop offset="100%" stop-color="var(--red)"/></linearGradient></defs>' +
            '<path d="M20 105 A80 80 0 0 1 180 105" fill="none" stroke="var(--taupe-1)" stroke-width="14" stroke-linecap="square"/>' +
            '<path d="M20 105 A80 80 0 0 1 124.5 29" fill="none" stroke="url(#gaugeGrad)" stroke-width="14" stroke-linecap="square"/>' +
            '<line x1="20" y1="105" x2="20" y2="95" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="100" y1="25" x2="100" y2="35" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="180" y1="105" x2="180" y2="95" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="100" y1="105" x2="120" y2="42" stroke="var(--taupe-5)" stroke-width="2.5" stroke-linecap="square"/>' +
            '<rect x="95" y="100" width="10" height="10" fill="var(--taupe-5)"/>' +
            '<text x="20" y="122" font-family="\'IBM Plex Mono\', monospace" font-size="9" font-weight="600" fill="var(--taupe-3)" text-anchor="middle">0</text>' +
            '<text x="180" y="122" font-family="\'IBM Plex Mono\', monospace" font-size="9" font-weight="600" fill="var(--taupe-3)" text-anchor="middle">' + escapeHtml(MOCK_USAGE.planLimit) + '</text>' +
          '</svg>' +
          '<div class="usage-gauge-readout">' +
            '<span class="usage-gauge-value">' + escapeHtml(MOCK_USAGE.percentUsed) + '</span>' +
            '<span class="usage-gauge-unit">used this period</span>' +
          '</div>' +
        '</div>' +
        '<div class="usage-stats">' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Plan Limit</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.planLimit) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Used</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.used) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Remaining</span><span class="usage-stat-value usage-stat-highlight">' + escapeHtml(MOCK_USAGE.remaining) + '</span></div>' +
          '<div class="usage-stat-divider"></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Overage</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.overage) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Renews</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.renews) + '</span></div>' +
        '</div>' +
      '</div>';
  }
};

// Render header panels on load
(function() { UI.renderHeaderPanels(); })();

/** Closes all header dropdown panels (tasks, calendar, usage). */
UI.closeAllPanels = function() {
  var tp = document.getElementById('taskPanel');
  var cp = document.getElementById('calendarPanel');
  var up = document.getElementById('usagePanel');
  if (tp) tp.classList.add('hidden');
  if (cp) cp.classList.add('hidden');
  if (up) up.classList.add('hidden');
};

/** Toggles the task dropdown panel open/closed. */
UI.toggleTaskPanel = function() {
  const tp = document.getElementById('taskPanel');
  const wasOpen = tp && !tp.classList.contains('hidden');
  UI.closeAllPanels();
  if (!wasOpen && tp) tp.classList.remove('hidden');
};

/** Toggles the calendar dropdown panel open/closed, building the mini-calendar if needed. */
UI.toggleCalendarPanel = function() {
  const cp = document.getElementById('calendarPanel');
  const wasOpen = cp && !cp.classList.contains('hidden');
  UI.closeAllPanels();
  if (!wasOpen && cp) {
    UI.buildMiniCalendar();
    cp.classList.remove('hidden');
  }
};

/** Toggles the usage/credits dropdown panel open/closed. */
UI.toggleUsagePanel = function() {
  const up = document.getElementById('usagePanel');
  const wasOpen = up && !up.classList.contains('hidden');
  UI.closeAllPanels();
  if (!wasOpen && up) up.classList.remove('hidden');
};

// Close top-bar dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.top-icon-btn') && !e.target.closest('.th-dropdown') && !e.target.closest('.top-profile')) {
    UI.closeAllPanels();
    var pp = document.getElementById('profilePanel');
    if (pp) pp.classList.add('hidden');
  }
});

/** Toggles the profile dropdown menu open/closed. */
UI.toggleProfileMenu = function() {
  const pp = document.getElementById('profilePanel');
  const wasOpen = pp && !pp.classList.contains('hidden');
  UI.closeAllPanels();
  if (pp) pp.classList.add('hidden');
  if (!wasOpen && pp) {
    pp.classList.remove('show-subpanel');
    pp.classList.remove('hidden');
  }
};

/** Shows the appearance & accessibility sub-panel in the profile menu. */
UI.showProfileSubpanel = function() {
  const pp = document.getElementById('profilePanel');
  if (pp) pp.classList.add('show-subpanel');
};

/** Returns to the main profile menu from the sub-panel. */
UI.showProfileMain = function() {
  const pp = document.getElementById('profilePanel');
  if (pp) pp.classList.remove('show-subpanel');
};

/** Builds the mini calendar day grid inside the calendar dropdown. */
UI.buildMiniCalendar = function() {
  const grid = document.getElementById('miniCalGrid');
  if (!grid || grid.children.length > 0) return;

  // Parse month/year from MOCK_CALENDAR
  const parts = MOCK_CALENDAR.month.split(' ');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthIndex = monthNames.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);

  // Compute first weekday and number of days
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Derive event days from MOCK_CALENDAR.events meta fields
  const eventDays = MOCK_CALENDAR.events.map(ev => {
    const match = ev.meta.match(/\b(\d{1,2}),/);
    return match ? match[1] : null;
  }).filter(Boolean);

  // Today = March 13, 2026
  const todayDay = '13';

  // Build grid: leading empties + day cells
  for (let i = 0; i < firstDay; i++) {
    const div = document.createElement('div');
    div.className = 'mcg-day empty';
    grid.appendChild(div);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = String(d);
    const div = document.createElement('div');
    const isToday = ds === todayDay;
    const hasEvent = !isToday && eventDays.includes(ds);
    div.className = 'mcg-day' + (isToday ? ' today' : '') + (hasEvent ? ' has-event' : '');
    div.textContent = ds;
    grid.appendChild(div);
  }
};

// Close panels on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('#taskAlertBtn') && !e.target.closest('#taskPanel')) {
    const tp = document.getElementById('taskPanel');
    if (tp) tp.classList.add('hidden');
  }
  if (!e.target.closest('#calendarBtn') && !e.target.closest('#calendarPanel')) {
    const cp = document.getElementById('calendarPanel');
    if (cp) cp.classList.add('hidden');
  }
  if (!e.target.closest('.sidebar-search')) {
    Chat.closeSearch();
  }
});

/** Handles the "+ New" button click, creating a new thread or workflow depending on current mode. */
UI.handleNew = function() {
  if (UI.currentMode === 'chat') {
    Chat.selectThread('new', null);
    // Deselect all sidebar items
    document.querySelectorAll('.thread-item').forEach(t => t.classList.remove('active'));
    // Focus the input
    const input = document.getElementById('new-thread-input');
    if (input) input.focus();
  } else if (UI.currentMode === 'workflows') {
    Workflows.navigateToThread('wf-create-dd');
  }
};

// ============================================
// COSIMO PANEL
// ============================================
/** Opens the Cosimo AI assistant slide-in panel and collapses the sidebar. */
UI.openCosimoPanel = function() {
  document.getElementById('actionDropdown').classList.remove('show');
  document.getElementById('cosimoPanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('show');
  document.getElementById('sidebar').classList.add('collapsed');
  document.getElementById('panelInput').focus();
};

/** Closes the Cosimo panel and restores the sidebar. */
UI.closeCosimoPanel = function() {
  document.getElementById('cosimoPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('show');
  document.getElementById('sidebar').classList.remove('collapsed');
};

/** Handles keydown in the Cosimo panel input; sends on Enter.
 * @param {KeyboardEvent} e - The keydown event
 */
UI.handlePanelKey = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    UI.sendPanelMessage();
  }
};

/** Sends a user message in the Cosimo panel and simulates an AI response. */
UI.sendPanelMessage = function() {
  const input = document.getElementById('panelInput');
  const html = input.innerHTML.trim();
  if (!html || input.textContent.trim() === '') return;

  const chat = document.getElementById('panelChat');

  // Add user message (preserve formatting)
  const userMsg = document.createElement('div');
  userMsg.className = 'panel-msg panel-msg-user';
  userMsg.innerHTML = `
    <div class="panel-msg-header">
      <span class="panel-msg-sender">You</span>
      <div class="badge badge-human" style="width:16px;height:16px;font-size:9px;">E</div>
    </div>
    ${html}
  `;
  chat.appendChild(userMsg);
  input.innerHTML = '';

  // Add typing indicator
  const typing = document.createElement('div');
  typing.className = 'panel-msg panel-msg-ai';
  typing.innerHTML = `
    <div class="panel-msg-header">
      <div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>
      <span class="panel-msg-sender">Cosimo</span>
    </div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  // Simulate response
  setTimeout(() => {
    typing.innerHTML = `
      <div class="panel-msg-header">
        <div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>
        <span class="panel-msg-sender">Cosimo</span>
      </div>
      I've understood your request. In a live environment, I would update the workflow configuration and show you a diff of the changes. For this demo, the modification has been noted.
    `;
    chat.scrollTop = chat.scrollHeight;
  }, 1800);
};

// ============================================
// DROPDOWN
// ============================================
/** Toggles the workflow actions dropdown menu.
 * @param {Event} e - The click event (propagation is stopped)
 */
UI.toggleDropdown = function(e) {
  e.stopPropagation();
  const menu = document.getElementById('actionDropdown');
  menu.classList.toggle('show');
};

document.addEventListener('click', () => {
  document.getElementById('actionDropdown')?.classList.remove('show');
});

// ============================================
// SEARCH STATES (#5)
// ============================================
Chat.searchTimer = null;
/** Runs a debounced global search across thread titles and keywords.
 * @param {string} q - The search query string
 * Modifies DOM (search results panel).
 */
Chat.runGlobalSearch = function(q) {
  const results = document.getElementById('searchResults');
  if (!results) return;

  // Clear previous debounce
  if (Chat.searchTimer) clearTimeout(Chat.searchTimer);

  // Empty query — close
  if (!q.trim()) {
    results.classList.add('hidden');
    return;
  }

  results.classList.remove('hidden');
  results.innerHTML = '<div class="search-status">Searching...</div>';

  // Debounce 200ms then search
  Chat.searchTimer = setTimeout(() => {
    const ql = q.toLowerCase();
    // Search all threads by keyword using MOCK_THREADS
    const searchable = Object.keys(MOCK_THREADS)
      .filter(id => id !== 'new')
      .map(id => ({ id: id, title: MOCK_THREADS[id].title, keywords: MOCK_THREADS[id].keywords }));
    const matches = searchable.filter(t =>
      t.title.toLowerCase().includes(ql) || t.keywords.includes(ql)
    );

    if (matches.length) {
      results.innerHTML = matches.map(m =>
        '<div class="search-result-item" data-thread-id="' + m.id + '">' +
        m.title + '</div>'
      ).join('');
    } else {
      results.innerHTML = '<div class="search-no-results">No results for "' + escapeHtml(q) + '"</div>';
    }
  }, 200);
};

/** Hides the search results dropdown. */
Chat.closeSearch = function() {
  const results = document.getElementById('searchResults');
  if (results) results.classList.add('hidden');
};

// ============================================
// INPUT DISABLED DURING GENERATION (#6)
// ============================================
/** Enables or disables the chat input for a given thread during AI generation.
 * @param {string} threadId - The thread identifier
 * @param {boolean} disable - Whether to disable (true) or enable (false) the input
 */
Chat.disableInput = function(threadId, disable) {
  const thread = document.getElementById('thread-' + threadId);
  if (!thread) return;
  const input = thread.querySelector('.text-input');
  if (!input) return;
  if (disable) {
    input.classList.add('disabled');
    input.setAttribute('contenteditable', 'false');
  } else {
    input.classList.remove('disabled');
    input.setAttribute('contenteditable', 'true');
  }
};

// ============================================
// FEEDBACK BUTTONS (#9)
// ============================================
/** Handles thumbs up/down feedback on an AI message.
 * @param {HTMLElement} btn - The clicked feedback button
 * @param {string} type - Feedback type ('up' | 'down')
 */
Chat.giveFeedback = function(btn, type) {
  const container = btn.closest('.msg-feedback');
  container.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(type === 'up' ? 'Thanks for the feedback' : 'Feedback noted — we\'ll improve');
};

// ============================================
// THREAD SWITCHING
// ============================================

Chat.activeThread = 'fund3';

/** Switches the active chat thread and updates sidebar, header, and file panel state.
 * @param {string} id - Thread identifier (e.g. 'fund3', 'erabor', 'new')
 * @param {HTMLElement|null} el - The sidebar thread-item element, or null
 */
Chat.selectThread = function(id, el) {
  Chat.activeThread = id;

  // Update sidebar
  document.querySelectorAll('.thread-item').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  // Switch thread content
  document.querySelectorAll('.chat-thread').forEach(t => t.classList.remove('active'));
  const thread = document.getElementById('thread-' + id);
  if (thread) {
    thread.classList.add('active');
  }

  // Update header title
  const title = document.getElementById('chatHeaderTitle');
  if (title && MOCK_THREADS[id]) title.textContent = MOCK_THREADS[id].title;

  // Update Files button state
  Chat.updateFilesButton();

  // Close file panel when switching threads
  Chat.closeFilePanel();

  // Auto-open/close workflow context panel based on thread's workflowRunId
  var threadData = MOCK_THREADS[id];
  if (threadData && threadData.workflowRunId && MOCK_WORKFLOW_RUNS[threadData.workflowRunId]) {
    Chat.openWorkflowPanel(threadData.workflowRunId);
    // Toast notification for run status
    var runData = MOCK_WORKFLOW_RUNS[threadData.workflowRunId];
    if (runData.status === 'completed') {
      showToast('Run ' + runData.runId + ' completed');
    } else if (runData.status === 'waiting') {
      showToast('Run ' + runData.runId + ' waiting for review');
    } else if (runData.status === 'running') {
      showToast('Run ' + runData.runId + ' in progress');
    } else if (runData.status === 'failed') {
      showToast('Run ' + runData.runId + ' failed');
    }
  } else {
    Chat.closeWorkflowPanel();
  }

  // Trigger Erabor animation when that thread is selected
  if (id === 'erabor') Chat.runEraborSequence();

  // Render flow graph artifacts in wf-create-dd thread after DOM is visible
  if (id === 'wf-create-dd') {
    requestAnimationFrame(function() {
      Chat._renderDDFlowGraphs();
    });
  }
};

/** Updates the Files button enabled/disabled state based on the active thread. */
Chat.updateFilesButton = function() {
  const btn = document.getElementById('filesBtn');
  if (!btn) return;
  if (MOCK_THREADS[Chat.activeThread].hasFiles) {
    btn.classList.remove('disabled');
    btn.disabled = false;
  } else {
    btn.classList.add('disabled');
    btn.disabled = true;
  }
};

// ============================================
// FILE PANEL
// ============================================
/** Opens the right-side file panel to a specific tab.
 * @param {string} [tab='viewer'] - Tab to show ('viewer' | 'folder')
 */
Chat.openFilePanel = function(tab) {
  if (!MOCK_THREADS[Chat.activeThread].hasFiles) return;
  const panel = document.getElementById('filePanel');
  panel.classList.add('open');
  document.getElementById('filePanelResizeHandle').classList.add('visible');
  Chat.switchFilePanelTab(tab || 'viewer');
  if (tab === 'viewer') Chat.buildSpreadsheet();
};

/** Closes the right-side file panel and resets its width. */
Chat.closeFilePanel = function() {
  const panel = document.getElementById('filePanel');
  panel.classList.remove('open');
  panel.style.width = '';
  document.getElementById('filePanelResizeHandle').classList.remove('visible');
};

// ============================================
// WORKFLOW CONTEXT PANEL
// ============================================

/** Renders flow graph artifacts inside the wf-create-dd thread.
 * Called via requestAnimationFrame after thread becomes visible.
 */
Chat._renderDDFlowGraphs = function() {
  var initialEl = document.getElementById('ddFlowGraphInitial');
  var updatedEl = document.getElementById('ddFlowGraphUpdated');
  // Only render if containers exist and are empty (avoid re-rendering)
  if (initialEl && !initialEl.querySelector('svg')) {
    Workflows.renderFlowGraph('due-diligence', 'ddFlowGraphInitial', { compact: false, noInteraction: true });
  }
  if (updatedEl && !updatedEl.querySelector('svg')) {
    Workflows.renderFlowGraph('due-diligence', 'ddFlowGraphUpdated', { compact: false, noInteraction: true });
  }
};

/** Opens the right-side workflow context panel for a given run.
 * @param {string} runId - The threadId key in MOCK_WORKFLOW_RUNS
 */
Chat.openWorkflowPanel = function(runId) {
  const run = MOCK_WORKFLOW_RUNS[runId];
  if (!run) return;
  const template = MOCK_WORKFLOW_TEMPLATES[run.templateId];
  if (!template) return;

  // Close file panel if open
  Chat.closeFilePanel();

  const panel = document.getElementById('workflowPanel');
  const handle = document.getElementById('wfPanelResizeHandle');

  // Populate header
  document.getElementById('wfPanelName').textContent = template.title;
  document.getElementById('wfPanelRunId').textContent = 'Run ' + run.runId;
  const statusEl = document.getElementById('wfPanelStatus');
  statusEl.textContent = run.status.charAt(0).toUpperCase() + run.status.slice(1);
  statusEl.className = 'workflow-panel-status status-' + run.status;

  // Populate input manifest
  var inputHtml = '';
  if (run.inputManifest && run.inputManifest.length) {
    run.inputManifest.forEach(function(f) {
      var iconChar = f.type === 'folder' ? '📁' : (f.type === 'pdf' ? '📄' : '📎');
      var meta = f.type === 'folder' ? (f.fileCount + ' files') : f.size;
      inputHtml += '<div class="wf-panel-file-item">' +
        '<span class="wf-panel-file-icon">' + iconChar + '</span>' +
        '<span class="wf-panel-file-name">' + escapeHtml(f.name) + '</span>' +
        '<span class="wf-panel-file-meta">' + escapeHtml(meta) + '</span>' +
        '</div>';
    });
  } else {
    inputHtml = '<span class="wf-panel-empty">No input files</span>';
  }
  document.getElementById('wfPanelInputBody').innerHTML = inputHtml;

  // Populate exceptions
  var excHtml = '';
  if (run.exceptions && run.exceptions.length) {
    run.exceptions.forEach(function(ex) {
      var typeLabel = ex.type.replace(/-/g, ' ');
      excHtml += '<div class="wf-panel-exception">' +
        '<span class="wf-panel-exception-dot type-' + ex.type + '"></span>' +
        '<div class="wf-panel-exception-body">' +
        '<div class="wf-panel-exception-type">' + escapeHtml(typeLabel) + '</div>' +
        '<div class="wf-panel-exception-desc">' + escapeHtml(ex.description) + '</div>' +
        (ex.confidence != null ? '<div class="wf-panel-exception-confidence">Confidence: ' + ex.confidence + '%</div>' : '') +
        '</div></div>';
    });
  } else {
    excHtml = '<span class="wf-panel-empty">No exceptions</span>';
  }
  document.getElementById('wfPanelExceptionsBody').innerHTML = excHtml;

  // Populate output manifest
  var outHtml = '';
  if (run.outputManifest && run.outputManifest.length) {
    run.outputManifest.forEach(function(f) {
      outHtml += '<div class="wf-panel-file-item">' +
        '<span class="wf-panel-file-icon">📄</span>' +
        '<span class="wf-panel-file-name">' + escapeHtml(f.name) + '</span>' +
        '<span class="wf-panel-file-meta">' + escapeHtml(f.size) + '</span>' +
        '</div>' +
        '<div style="font-family:var(--mono);font-size:10px;color:var(--taupe-3);padding-left:20px;">' + escapeHtml(f.path) + '</div>';
    });
  } else {
    outHtml = '<span class="wf-panel-empty">' + (run.status === 'waiting' || run.status === 'running' ? 'Pending...' : 'No output') + '</span>';
  }
  document.getElementById('wfPanelOutputBody').innerHTML = outHtml;

  // Render compact flow graph (placeholder for task 5.2 — just show container)
  var graphContainer = document.getElementById('wfPanelGraph');
  graphContainer.innerHTML = '';
  if (typeof Workflows !== 'undefined' && typeof Workflows.renderFlowGraph === 'function') {
    Workflows.renderFlowGraph(run.templateId, 'wfPanelGraph', { compact: true, showStatus: true, runId: runId });
  }

  // Open panel
  panel.classList.add('open');
  handle.classList.add('visible');
};

/** Closes the right-side workflow context panel and resets its width. */
Chat.closeWorkflowPanel = function() {
  var panel = document.getElementById('workflowPanel');
  if (!panel) return;
  panel.classList.remove('open');
  panel.style.width = '';
  document.getElementById('wfPanelResizeHandle').classList.remove('visible');
};

// ============================================
// COMMAND AUTOCOMPLETE
// ============================================

/** Currently active autocomplete index (-1 = none selected) */
Chat._acIndex = -1;

/** Whether the autocomplete dropdown is currently visible */
Chat._acOpen = false;

/** Cached reference to the autocomplete dropdown element */
Chat._acDropdown = null;

/** Shows the command autocomplete dropdown above the active input area.
 * @param {HTMLElement} inputEl - The contenteditable input element
 * @param {string} query - The text after '/' to filter commands
 */
Chat.showCommandAutocomplete = function(inputEl, query) {
  var inputArea = inputEl.closest('.input-area');
  if (!inputArea) return;

  // Filter commands by query
  var q = query.toLowerCase();
  var matches = MOCK_WORKFLOW_COMMANDS.filter(function(cmd) {
    return cmd.command.toLowerCase().indexOf(q) > -1 ||
           cmd.label.toLowerCase().indexOf(q) > -1;
  });

  if (matches.length === 0) {
    Chat.hideCommandAutocomplete();
    return;
  }

  // Create or reuse dropdown
  var dropdown = Chat._acDropdown;
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'wf-command-autocomplete';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Workflow commands');
    Chat._acDropdown = dropdown;
  }

  // Remove from previous parent if moved to different input-area
  if (dropdown.parentNode && dropdown.parentNode !== inputArea) {
    dropdown.parentNode.removeChild(dropdown);
  }

  // Build items
  var html = '';
  matches.forEach(function(cmd, i) {
    html += '<div class="wf-command-autocomplete-item" role="option" data-index="' + i + '" data-command="' + escapeHtml(cmd.command) + '"' +
      (cmd.argPlaceholder ? ' data-arg="' + escapeHtml(cmd.argPlaceholder) + '"' : '') + '>' +
      '<div class="wf-command-autocomplete-cmd">' + escapeHtml(cmd.command) +
      ' <span class="wf-ac-label">' + escapeHtml(cmd.label) + '</span></div>' +
      '<div class="wf-command-autocomplete-desc">' + escapeHtml(cmd.description) + '</div>' +
      '</div>';
  });
  dropdown.innerHTML = html;

  // Insert into input-area
  if (!dropdown.parentNode) {
    inputArea.insertBefore(dropdown, inputArea.firstChild);
  }

  dropdown.classList.add('open');
  Chat._acOpen = true;
  Chat._acIndex = -1;
  Chat._acInputEl = inputEl;
};

/** Hides the command autocomplete dropdown. */
Chat.hideCommandAutocomplete = function() {
  if (Chat._acDropdown) {
    Chat._acDropdown.classList.remove('open');
  }
  Chat._acOpen = false;
  Chat._acIndex = -1;
  Chat._acInputEl = null;
};

/** Selects a command from the autocomplete dropdown.
 * @param {string} command - The command text (e.g., '/rent-roll')
 * @param {string} [argPlaceholder] - Optional arg placeholder
 */
Chat.selectCommand = function(command, argPlaceholder) {
  var inputEl = Chat._acInputEl;
  if (!inputEl) return;
  var text = command;
  if (argPlaceholder) text += ' ' + argPlaceholder;
  inputEl.textContent = text;

  // Place cursor at end (or select placeholder if present)
  var range = document.createRange();
  var sel = window.getSelection();
  if (argPlaceholder) {
    // Select the placeholder text for easy replacement
    var textNode = inputEl.firstChild;
    if (textNode) {
      var start = command.length + 1;
      range.setStart(textNode, start);
      range.setEnd(textNode, start + argPlaceholder.length);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } else {
    range.selectNodeContents(inputEl);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  Chat.hideCommandAutocomplete();
  inputEl.focus();

  // Navigate to mock run thread for this command's template (if one exists)
  var cmdData = MOCK_WORKFLOW_COMMANDS.find(function(c) { return c.command === command; });
  if (cmdData && cmdData.templateId) {
    var threadId = Workflows._findRunThread(cmdData.templateId);
    if (threadId) {
      Chat.selectThread(threadId, document.querySelector('.thread-item[data-thread-id="' + threadId + '"]'));
    }
  }
};

/** Navigates the autocomplete dropdown selection.
 * @param {number} direction - 1 for down, -1 for up
 */
Chat._acNavigate = function(direction) {
  if (!Chat._acOpen || !Chat._acDropdown) return;
  var items = Chat._acDropdown.querySelectorAll('.wf-command-autocomplete-item');
  if (items.length === 0) return;

  // Remove current active
  if (Chat._acIndex >= 0 && Chat._acIndex < items.length) {
    items[Chat._acIndex].classList.remove('active');
  }

  // Calculate new index
  Chat._acIndex += direction;
  if (Chat._acIndex < 0) Chat._acIndex = items.length - 1;
  if (Chat._acIndex >= items.length) Chat._acIndex = 0;

  // Apply active class and scroll into view
  items[Chat._acIndex].classList.add('active');
  items[Chat._acIndex].scrollIntoView({ block: 'nearest' });
};

/** Confirms the currently selected autocomplete item. */
Chat._acConfirm = function() {
  if (!Chat._acOpen || !Chat._acDropdown || Chat._acIndex < 0) return false;
  var items = Chat._acDropdown.querySelectorAll('.wf-command-autocomplete-item');
  if (Chat._acIndex >= items.length) return false;
  var item = items[Chat._acIndex];
  Chat.selectCommand(item.dataset.command, item.dataset.arg || null);
  return true;
};

/** Switches between viewer and folder tabs in the file panel.
 * @param {string} tab - Target tab ('viewer' | 'folder')
 */
Chat.switchFilePanelTab = function(tab) {
  document.querySelectorAll('.file-panel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.file-panel-view').forEach(v => v.classList.remove('active'));

  if (tab === 'viewer') {
    document.getElementById('fpTabViewer').classList.add('active');
    document.getElementById('fpViewer').classList.add('active');
    Chat.buildSpreadsheet();
  } else {
    document.getElementById('fpTabFolder').classList.add('active');
    document.getElementById('fpFolder').classList.add('active');
  }
};

// ============================================
// INTERACTIVE SPREADSHEET
// ============================================
Chat.sheetData = MOCK_SPREADSHEET.rows;
Chat.colLetters = MOCK_SPREADSHEET.columns;
Chat.sheetBuilt = false;

/** Builds the interactive spreadsheet table from mock data (runs once). */
Chat.buildSpreadsheet = function() {
  if (Chat.sheetBuilt) return;
  Chat.sheetBuilt = true;

  const tbody = document.getElementById('fpSheetBody');
  tbody.innerHTML = '';

  Chat.sheetData.forEach((row) => {
    const tr = document.createElement('tr');
    // Row number
    const rowTd = document.createElement('td');
    rowTd.textContent = row.row;
    tr.appendChild(rowTd);

    row.cells.forEach((val, ci) => {
      const td = document.createElement('td');
      td.textContent = val;
      const isNum = /^\$/.test(val) || /^\d+\.\d+%$/.test(val);
      if (isNum) td.classList.add('fp-cell-number');

      const formula = row.formulas && row.formulas[ci];
      td.dataset.cellRef = Chat.colLetters[ci] + row.row;
      td.dataset.formula = formula || val;
      td.dataset.value = val;

      td.addEventListener('click', function() {
        // Clear previous selection
        document.querySelectorAll('.fp-cell-selected').forEach(c => c.classList.remove('fp-cell-selected'));
        td.classList.add('fp-cell-selected');
        document.getElementById('fpCellRef').textContent = td.dataset.cellRef;
        document.getElementById('fpFormula').textContent = formula || val;
      });

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
};

// ============================================
// EXPORT & SHARE (#13)
// ============================================
/** Exports the active chat thread as a downloadable Markdown file. */
Chat.exportThread = function() {
  const thread = document.getElementById('thread-' + Chat.activeThread);
  if (!thread) return;
  const messages = thread.querySelectorAll('.msg-block');
  let md = '# ' + (MOCK_THREADS[Chat.activeThread].title || 'Thread') + '\n\n';
  messages.forEach(msg => {
    const sender = msg.querySelector('.sender');
    const time = msg.querySelector('.timestamp');
    const body = msg.querySelector('.msg-body');
    if (sender && body) {
      md += '**' + sender.textContent + '** (' + (time ? time.textContent : '') + ')\n';
      md += body.textContent.trim() + '\n\n---\n\n';
    }
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (MOCK_THREADS[Chat.activeThread].title || 'thread').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.md';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported as Markdown');
};

/** Copies a shareable URL for the active thread to the clipboard. */
Chat.shareThread = function() {
  const url = window.location.origin + '/thread/' + Chat.activeThread;
  navigator.clipboard.writeText(url).then(() => showToast('Share link copied'));
};

/** Fills the new-thread input with a suggestion chip's text and focuses it.
 * @param {string} text - The suggestion text to insert
 */
Chat.fillSuggestion = function(text) {
  const input = document.getElementById('new-thread-input');
  if (input) {
    input.textContent = text;
    input.focus();
    // Place cursor at end
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

// ============================================
// K-1 ERROR RETRY
// ============================================
/** Simulates retrying the K-1 document processing after an error. */
Chat.retryK1 = function() {
  const btn = document.querySelector('.cosimo-error-retry');
  if (!btn || btn.classList.contains('retrying')) return;
  btn.classList.add('retrying');
  btn.querySelector('.retry-icon').style.animation = '';

  // Simulate retry attempt, then fail again
  setTimeout(() => {
    btn.classList.remove('retrying');
    alert('Retry failed — Ridgeline Capital vault is still unreachable. Contact integrations team or try again later.');
  }, 2500);
};

// ============================================
// ERABOR THREAD ANIMATION
// ============================================
Chat.eraborPlayed = false;
Chat.eraborRunning = false;
Chat.eraborTimers = [];
Chat.eraborIntervals = [];
Chat.eraborUserMsg = 'Pull the Erabor partnership agreement and summarize the key economic terms. I need to understand the GP commit, fee structure, clawback provisions, and any side letter concessions before the Thursday call with Marcus. Cross-reference against our standard Fund III terms and flag anything non-standard.';

/** Checks if the user is scrolled near the bottom of a scrollable element.
 * @param {HTMLElement} el - The scrollable container
 * @returns {boolean} True if within 80px of the bottom
 */
Chat.isNearBottom = function(el) {
  return (el.scrollHeight - el.scrollTop - el.clientHeight) < 80;
};

/** Auto-scrolls to the bottom only if the user is already near the bottom.
 * @param {HTMLElement} el - The scrollable container
 */
Chat.softScroll = function(el) {
  if (Chat.isNearBottom(el)) {
    el.scrollTop = el.scrollHeight;
  }
};

/** Schedules a timeout and tracks it for cancellation during Erabor animation.
 * @param {Function} fn - Callback to execute
 * @param {number} ms - Delay in milliseconds
 * @returns {number} The timeout ID
 */
Chat.eraborTimer = function(fn, ms) {
  const id = setTimeout(fn, ms);
  Chat.eraborTimers.push(id);
  return id;
};

/** Toggles visibility of the stop/send buttons during Erabor streaming.
 * @param {boolean} show - If true, show stop button and hide send; vice versa
 */
Chat.showEraborStopBtn = function(show) {
  const thread = document.getElementById('thread-erabor');
  if (!thread) return;
  const sendBtn = thread.querySelector('.input-area .cmd-primary');
  if (sendBtn) sendBtn.classList.toggle('hidden', show);
};

/** Runs the Erabor thread demo animation: thinking, reasoning steps, then streamed reply. */
Chat.runEraborSequence = function() {
  if (Chat.eraborPlayed || Chat.eraborRunning) return;
  Chat.eraborRunning = true;

  const thinking = document.getElementById('erabor-thinking');
  const reasoning = document.getElementById('erabor-reasoning');
  const reply = document.getElementById('erabor-reply');
  const steps = document.querySelectorAll('#erabor-steps .reasoning-step-item');
  const scroll = document.getElementById('erabor-scroll');
  const thinkingCubes = thinking.querySelector('.cosimo-thinking');

  var reducedMotion = document.documentElement.getAttribute('data-a11y-motion') === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: skip all staged animation, reveal final state instantly
  if (reducedMotion) {
    thinking.classList.add('hidden');
    reasoning.classList.add('hidden');
    document.getElementById('erabor-latency').classList.remove('hidden');
    reply.classList.remove('hidden');
    steps.forEach(function(s) { s.classList.add('visible'); });
    Chat.streamReply(scroll);
    return;
  }

  // Show stop button, hide send, disable input
  Chat.showEraborStopBtn(true);
  Chat.disableInput('erabor', true);

  // State 1: Thinking cubes for 2s
  Chat.eraborTimer(() => {
    thinkingCubes.classList.add('fading');

    Chat.eraborTimer(() => {
      thinking.classList.add('hidden');
      reasoning.classList.remove('hidden');

      // State 2: Reveal reasoning steps one by one
      steps.forEach((step, i) => {
        Chat.eraborTimer(() => {
          step.classList.add('visible');
          Chat.softScroll(scroll);
        }, i * 550);
      });

      // Collapse reasoning and start streaming
      const totalStepTime = steps.length * 550 + 1000;
      Chat.eraborTimer(() => {
        reasoning.classList.add('hidden');
        document.getElementById('erabor-latency').classList.remove('hidden');

        Chat.eraborTimer(() => {
          reply.classList.remove('hidden');
          Chat.streamReply(scroll);
        }, 500);
      }, totalStepTime);

    }, 500);
  }, 2000);
};

/** Marks the Erabor animation as complete and re-enables the input. */
Chat.markEraborDone = function() {
  Chat.eraborRunning = false;
  Chat.eraborPlayed = true;
  Chat.showEraborStopBtn(false);
  Chat.disableInput('erabor', false);
};

/** Cancels the Erabor animation, kills timers, hides response, and restores input. */
Chat.cancelErabor = function() {
  // Kill all pending timers/intervals
  Chat.eraborTimers.forEach(id => clearTimeout(id));
  Chat.eraborIntervals.forEach(id => clearInterval(id));
  Chat.eraborTimers = [];
  Chat.eraborIntervals = [];
  Chat.eraborRunning = false;

  // Hide the entire Cosimo response block
  const response = document.getElementById('erabor-response');
  if (response) response.classList.add('hidden');

  // Swap stop → send, re-enable input
  Chat.showEraborStopBtn(false);
  Chat.disableInput('erabor', false);

  // Put user's message back in the input for editing
  const thread = document.getElementById('thread-erabor');
  const input = thread ? thread.querySelector('.input-area .text-input') : null;
  if (input) {
    input.textContent = Chat.eraborUserMsg;
    input.focus();
    // Place cursor at end
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

// ============================================
// CHARACTER-BY-CHARACTER STREAMING
// ============================================
/** Orchestrates character-by-character streaming of the Erabor AI reply.
 * @param {HTMLElement} scroll - The scrollable container for auto-scroll
 */
Chat.streamReply = function(scroll) {
  const blocks = document.querySelectorAll('#erabor-reply .erabor-stream-block');
  var reducedMotion = document.documentElement.getAttribute('data-a11y-motion') === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: reveal all content instantly, skip character-by-character streaming
  if (reducedMotion) {
    blocks.forEach(function(block) { block.style.display = ''; block.classList.add('streamed'); });
    Chat.markEraborDone();
    return;
  }

  // Pre-process: capture each block's original HTML, then hide content
  const blockData = [];
  blocks.forEach(block => {
    const section = block.querySelector('.erabor-section');
    if (section) {
      // Structured section: reveal rows one at a time
      const rows = section.querySelectorAll('.erabor-kv');
      rows.forEach(r => { r.style.opacity = '0'; r.style.transform = 'translateY(4px)'; });
      blockData.push({ el: block, type: 'section', section, rows: Array.from(rows) });
    } else {
      // Text paragraph: type character by character
      const paragraphs = block.querySelectorAll('p');
      const pData = [];
      paragraphs.forEach(p => {
        // Store original HTML content (to preserve <strong> etc)
        pData.push({ el: p, html: p.innerHTML });
        p.textContent = '';
      });
      blockData.push({ el: block, type: 'text', paragraphs: pData });
    }
    block.style.display = 'none';
  });

  // Create a blinking cursor element
  const cursor = document.createElement('span');
  cursor.className = 'stream-cursor';

  let blockIdx = 0;

  function processNextBlock() {
    if (blockIdx >= blockData.length) {
      cursor.remove();
      Chat.markEraborDone();
      return;
    }

    const bd = blockData[blockIdx];
    bd.el.style.display = '';
    bd.el.classList.add('streamed');
    Chat.softScroll(scroll);

    if (bd.type === 'text') {
      Chat.typeTextBlock(bd, cursor, scroll, () => {
        blockIdx++;
        processNextBlock();
      });
    } else {
      Chat.streamSectionBlock(bd, cursor, scroll, () => {
        blockIdx++;
        processNextBlock();
      });
    }
  }

  processNextBlock();
};

/** Types out a text block's paragraphs character-by-character with a blinking cursor.
 * @param {Object} bd - Block data with paragraphs array
 * @param {HTMLElement} cursor - The blinking cursor element
 * @param {HTMLElement} scroll - The scrollable container
 * @param {Function} onDone - Callback when typing is complete
 */
Chat.typeTextBlock = function(bd, cursor, scroll, onDone) {
  let pIdx = 0;

  function typeNextParagraph() {
    if (pIdx >= bd.paragraphs.length) {
      onDone();
      return;
    }

    const pInfo = bd.paragraphs[pIdx];
    const fullHTML = pInfo.html;

    // Parse out text and HTML tags so we can type text chars
    // but insert tags instantly
    const tokens = Chat.tokenizeHTML(fullHTML);
    let tokenIdx = 0;
    let builtHTML = '';

    pInfo.el.innerHTML = '';
    pInfo.el.appendChild(cursor);

    // Characters per tick — simulate fast but readable streaming
    const charsPerTick = 2;
    const tickInterval = 16; // ~60fps

    const timer = setInterval(() => {
      let charsAdded = 0;

      while (tokenIdx < tokens.length && charsAdded < charsPerTick) {
        const token = tokens[tokenIdx];
        if (token.type === 'tag') {
          builtHTML += token.value;
          tokenIdx++;
        } else {
          builtHTML += token.value;
          tokenIdx++;
          charsAdded++;
        }
      }

      pInfo.el.innerHTML = builtHTML;
      pInfo.el.appendChild(cursor);
      Chat.softScroll(scroll);

      if (tokenIdx >= tokens.length) {
        clearInterval(timer);
        cursor.remove();
        pIdx++;
        Chat.eraborTimer(typeNextParagraph, 120);
      }
    }, tickInterval);
    Chat.eraborIntervals.push(timer);
  }

  typeNextParagraph();
};

/** Streams a structured section block by revealing rows one at a time.
 * @param {Object} bd - Block data with section and rows
 * @param {HTMLElement} cursor - The blinking cursor element
 * @param {HTMLElement} scroll - The scrollable container
 * @param {Function} onDone - Callback when streaming is complete
 */
Chat.streamSectionBlock = function(bd, cursor, scroll, onDone) {
  // Section title appears instantly, then rows stream in one at a time
  bd.section.querySelector('.erabor-section-title').appendChild(cursor);
  Chat.softScroll(scroll);

  let rowIdx = 0;

  function showNextRow() {
    if (rowIdx >= bd.rows.length) {
      cursor.remove();
      onDone();
      return;
    }

    const row = bd.rows[rowIdx];
    row.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';

    // Move cursor after the row
    row.appendChild(cursor);
    Chat.softScroll(scroll);

    rowIdx++;
    Chat.eraborTimer(showNextRow, 180);
  }

  Chat.eraborTimer(showNextRow, 200);
};

/** Breaks an HTML string into tokens for character-by-character streaming.
 * @param {string} html - The HTML string to tokenize
 * @returns {Array<{type: string, value: string}>} Array of {type: 'tag'|'char', value} tokens
 */
Chat.tokenizeHTML = function(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      // Capture full tag
      const end = html.indexOf('>', i);
      if (end !== -1) {
        tokens.push({ type: 'tag', value: html.slice(i, end + 1) });
        i = end + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else if (html[i] === '&') {
      // Capture HTML entity (e.g. &amp;)
      const semi = html.indexOf(';', i);
      if (semi !== -1 && semi - i < 10) {
        tokens.push({ type: 'char', value: html.slice(i, semi + 1) });
        i = semi + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else {
      tokens.push({ type: 'char', value: html[i] });
      i++;
    }
  }
  return tokens;
};

// ============================================
// ATTACH FILE ACTIONS
// ============================================
/** Opens a native file picker to attach files from the user's computer.
 * @param {HTMLElement} btn - The attach option button
 */
Chat.attachFromComputer = function(btn) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.onchange = function() {
    if (input.files.length) {
      const names = Array.from(input.files).map(f => f.name).join(', ');
      showToast('Attached: ' + names);
    }
  };
  input.click();
};

/** Simulates opening a cloud drive file picker.
 * @param {HTMLElement} btn - The attach option button
 */
Chat.attachFromDrive = function(btn) {
  showToast('Cloud drive picker opening\u2026');
};

// ============================================
// MODEL SELECTOR
// ============================================
/** Toggles the AI model selector dropdown with viewport-aware positioning.
 * @param {HTMLElement} btn - The model selector button
 */
Chat.toggleModelDropdown = function(btn) {
  const selector = btn.closest('.model-selector');
  const wasOpen = selector.classList.contains('open');
  // Close all open dropdowns first
  document.querySelectorAll('.model-selector.open').forEach(s => s.classList.remove('open'));
  if (!wasOpen) {
    selector.classList.add('open');
    const dropdown = selector.querySelector('.model-dropdown');
    // Temporarily show off-screen to measure
    dropdown.style.visibility = 'hidden';
    dropdown.style.display = 'block';
    const ddRect = dropdown.getBoundingClientRect();
    dropdown.style.display = '';
    dropdown.style.visibility = '';

    const btnRect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try above the button first
    let top = btnRect.top - ddRect.height - 4;
    if (top < 4) top = btnRect.bottom + 4; // flip below if no room above
    if (top + ddRect.height > vh - 4) top = vh - ddRect.height - 4; // clamp bottom

    let left = btnRect.left;
    if (left + ddRect.width > vw - 4) left = vw - ddRect.width - 4; // clamp right
    if (left < 4) left = 4; // clamp left

    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';
    dropdown.style.bottom = 'auto';
  }
};

/** Selects an AI model from the dropdown and updates the button label.
 * @param {HTMLElement} option - The clicked model option element
 */
Chat.selectModel = function(option) {
  const selector = option.closest('.model-selector');
  const label = selector.querySelector('.model-selector-label');
  const model = option.dataset.model;
  const name = option.querySelector('.model-option-name').textContent;

  // Update selected state within this dropdown
  selector.querySelectorAll('.model-option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');

  // Update button label
  label.textContent = name;

  // Close dropdown
  selector.classList.remove('open');

  showToast('Switched to ' + name);
};

// Close model dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.model-selector')) {
    document.querySelectorAll('.model-selector.open').forEach(s => s.classList.remove('open'));
  }
});

// ============================================
// WORKFLOW LIBRARY
// ============================================

/** Map triggerType values to icon names and labels */
Workflows._triggerMeta = {
  'folder-watch': { icon: 'folderWatch', label: 'Folder Watch' },
  'schedule':     { icon: 'schedule',     label: 'Schedule' },
  'chat-command': { icon: 'chatCommand',  label: 'Chat Command' },
  'email':        { icon: 'emailTrigger', label: 'Email' },
  'manual':       { icon: 'manualTrigger', label: 'Manual' },
  'chained':      { icon: 'webhook',      label: 'Chained' }
};

/** Renders the workflow library listing: stats bar and template cards.
 * Reads from MOCK_WORKFLOW_TEMPLATES, populates #wfStatsBody and #wfCardContainer.
 */
Workflows.renderLibrary = function() {
  var templates = Object.values(MOCK_WORKFLOW_TEMPLATES);
  var statsBody = document.getElementById('wfStatsBody');
  var cardContainer = document.getElementById('wfCardContainer');
  var noResults = document.getElementById('wfNoResults');
  if (!statsBody || !cardContainer) return;

  // Compute stats
  var total = templates.length;
  var active = templates.filter(function(t) { return t.status === 'active'; }).length;
  var totalRuns = templates.reduce(function(sum, t) { return sum + (t.runs ? t.runs.total : 0); }, 0);
  var failed = templates.reduce(function(sum, t) {
    if (!t.recentRuns) return sum;
    return sum + t.recentRuns.filter(function(r) { return r.status === 'failed'; }).length;
  }, 0);

  statsBody.innerHTML =
    '<span class="wf-stat-inline"><span class="wf-stat-inline-label">Total</span> <span class="wf-stat-inline-val">' + total + '</span></span>' +
    '<span class="wf-stats-sep"></span>' +
    '<span class="wf-stat-inline"><span class="wf-stat-inline-label">Active</span> <span class="wf-stat-inline-val green">' + active + '</span></span>' +
    '<span class="wf-stats-sep"></span>' +
    '<span class="wf-stat-inline"><span class="wf-stat-inline-label">Total Runs</span> <span class="wf-stat-inline-val">' + totalRuns + '</span></span>' +
    '<span class="wf-stats-sep"></span>' +
    '<span class="wf-stat-inline"><span class="wf-stat-inline-label">Failed</span> <span class="wf-stat-inline-val red">' + failed + '</span></span>';

  if (templates.length === 0) {
    cardContainer.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
    return;
  }
  if (noResults) noResults.classList.add('hidden');

  // Build cards
  var html = '';
  templates.forEach(function(t) {
    var statusClass = 'status-' + t.status;
    var statusLabel = t.status.charAt(0).toUpperCase() + t.status.slice(1);
    var triggerMeta = Workflows._triggerMeta[t.triggerType] || { icon: 'manualTrigger', label: t.triggerType };

    // Footer: linked lesson chip + last run status + Run button
    var footerParts = '';

    // Linked lesson chip
    if (t.linkedLessons && t.linkedLessons.length > 0) {
      var lessonId = t.linkedLessons[0];
      var lesson = typeof MOCK_LESSONS !== 'undefined' ? MOCK_LESSONS[lessonId] : null;
      var lessonTitle = lesson ? escapeHtml(lesson.title) : escapeHtml(lessonId);
      footerParts += '<span class="wf-card-lesson-chip" title="' + lessonTitle + '">◆ ' + lessonTitle + '</span>';
    }

    // Last run status
    if (t.recentRuns && t.recentRuns.length > 0) {
      var lastRun = t.recentRuns[0];
      var runDotClass = lastRun.status === 'success' ? 'green' : 'red';
      var runLabel = lastRun.status === 'success' ? 'Success' : 'Failed';
      footerParts += '<span class="wf-card-run-status"><span class="wf-run-dot ' + runDotClass + '"></span>' + runLabel + ' · ' + escapeHtml(lastRun.time) + '</span>';
    } else {
      footerParts += '<span class="wf-card-run-status"><span class="wf-run-dot muted"></span>No runs</span>';
    }

    html += '<div class="wf-card bevel" data-wf-id="' + t.id + '">' +
      '<div class="wf-card-header">' +
        '<div class="wf-card-header-left">' +
          '<span class="wf-card-title">' + escapeHtml(t.title) + '</span>' +
          '<span class="wf-card-status label-mono ' + statusClass + '">' + statusLabel + '</span>' +
          '<span class="wf-card-trigger-chip">' + icon(triggerMeta.icon, 12, 12) + ' ' + escapeHtml(triggerMeta.label) + '</span>' +
        '</div>' +
        '<button class="wf-card-run-btn bevel label-mono" data-action="run-card" data-wf-id="' + t.id + '">▶ Run</button>' +
      '</div>' +
      '<div class="wf-card-body">' +
        '<span class="wf-card-desc">' + escapeHtml(t.description) + '</span>' +
      '</div>' +
      '<div class="wf-card-footer">' + footerParts + '</div>' +
    '</div>';
  });

  cardContainer.innerHTML = html;
};

/** Renders the workflow sidebar: active runs section + template list.
 * Active runs come from MOCK_WORKFLOW_RUNS where status is 'running' or 'waiting'.
 * Template list shows all templates with trigger type icons.
 */
Workflows.renderSidebar = function() {
  var activeRunsEl = document.getElementById('wfActiveRuns');
  var listEl = document.getElementById('wfSidebarList');
  if (!activeRunsEl || !listEl) return;

  // Build active runs section
  var activeHtml = '';
  var runs = typeof MOCK_WORKFLOW_RUNS !== 'undefined' ? MOCK_WORKFLOW_RUNS : {};
  var runKeys = Object.keys(runs);
  var activeRuns = runKeys.filter(function(k) {
    return runs[k].status === 'running' || runs[k].status === 'waiting';
  });

  if (activeRuns.length > 0) {
    activeHtml += '<div class="side-label">Active Runs</div>';
    activeRuns.forEach(function(key) {
      var run = runs[key];
      var template = MOCK_WORKFLOW_TEMPLATES[run.templateId];
      var templateName = template ? escapeHtml(template.title) : escapeHtml(run.templateId);
      var thread = MOCK_THREADS[run.threadId];
      var threadTitle = thread ? escapeHtml(thread.title) : escapeHtml(run.threadId);
      var statusClass = run.status === 'running' ? 'wf-run-running' : 'wf-run-waiting';
      var statusLabel = run.status === 'running' ? 'Running' : 'Waiting';
      var dotClass = run.status === 'running' ? 'wf-pulse' : '';

      activeHtml += '<div class="wf-active-run-item" data-thread-id="' + escapeHtml(run.threadId) + '" data-wf-id="' + escapeHtml(run.templateId) + '">' +
        '<div class="wf-active-run-name">' + templateName + '</div>' +
        '<div class="wf-active-run-meta">' +
          '<span class="wf-active-run-indicator ' + statusClass + '"><span class="wf-active-run-dot ' + dotClass + '"></span>' + statusLabel + '</span>' +
          '<span class="wf-active-run-thread">' + threadTitle + '</span>' +
        '</div>' +
      '</div>';
    });
    activeRunsEl.innerHTML = activeHtml;
    activeRunsEl.classList.remove('hidden');
  } else {
    activeRunsEl.innerHTML = '';
    activeRunsEl.classList.add('hidden');
  }

  // Build template list
  var templates = Object.values(MOCK_WORKFLOW_TEMPLATES);
  var listHtml = '';
  templates.forEach(function(t) {
    var triggerMeta = Workflows._triggerMeta[t.triggerType] || { icon: 'manualTrigger', label: t.triggerType };
    var statusClass = t.status + '-status';
    var statusLabel = t.status.charAt(0).toUpperCase() + t.status.slice(1);

    // Last run info
    var runInfo = '';
    if (t.recentRuns && t.recentRuns.length > 0) {
      runInfo = 'Last run: ' + escapeHtml(t.recentRuns[0].time);
    } else {
      runInfo = 'No runs';
    }

    listHtml += '<div class="wf-side-item" data-wf-id="' + t.id + '">' +
      '<div class="wf-side-title">' +
        '<span class="wf-side-trigger-icon">' + icon(triggerMeta.icon, 12, 12) + '</span>' +
        escapeHtml(t.title) +
      '</div>' +
      '<div class="wf-side-meta">' +
        '<span class="wf-side-status ' + statusClass + '">' + statusLabel + '</span> ' +
        runInfo +
      '</div>' +
    '</div>';
  });

  listEl.innerHTML = listHtml;
};

// Render library and sidebar on load
(function() { Workflows.renderLibrary(); Workflows.renderSidebar(); })();

// ============================================
// WORKFLOW DETAIL
// ============================================
/** Shows the detail view for a specific workflow and hides the listing.
 * @param {string} id - Workflow identifier
 * @param {HTMLElement} [el] - The clicked element (card or sidebar item)
 */
Workflows.showWorkflowDetail = function(id, el) {
  const data = MOCK_WORKFLOW_TEMPLATES[id];
  if (!data) return;

  // Store current template ID for other functions and last-viewed state
  Workflows._currentTemplateId = id;
  Workflows._lastViewState = { templateId: id };

  document.getElementById('wfDetailTitle').textContent = data.title;
  document.getElementById('wfDetailDesc').textContent = data.description;

  // Build meta row: status badge + trigger chip + version + creator
  var metaEl = document.getElementById('wfDetailMeta');
  if (metaEl) {
    var statusClass = 'status-' + data.status;
    var statusLabel = data.status.charAt(0).toUpperCase() + data.status.slice(1);
    var triggerInfo = Workflows._triggerMeta[data.triggerType] || { icon: '', label: data.triggerType };
    var triggerIcon = typeof icon === 'function' ? icon(triggerInfo.icon) : '';

    metaEl.innerHTML =
      '<span class="wf-detail-meta-badge ' + statusClass + '">' + escapeHtml(statusLabel) + '</span>' +
      '<span class="wf-detail-meta-chip">' + triggerIcon + ' ' + escapeHtml(triggerInfo.label) + '</span>' +
      '<span class="wf-detail-meta-sep"></span>' +
      '<span class="wf-detail-meta-text">v' + data.version + '</span>' +
      '<span class="wf-detail-meta-sep"></span>' +
      '<span class="wf-detail-meta-text">' + escapeHtml(data.createdBy) + ' · ' + escapeHtml(data.createdDate) + '</span>';
  }

  // Build overview tab content
  Workflows._renderOverviewTab(data);

  // Build schema tab content
  Workflows._renderSchemaTab(data);

  // Build triggers tab content
  Workflows._renderTriggersTab(data);

  // Build runs tab content
  Workflows._renderRunsTab(data);

  // Build lessons tab content
  Workflows._renderLessonsTab(data);

  // Render flow graph in the graph column
  Workflows.renderFlowGraph(id, 'flowGraphContainer', { compact: false });

  document.getElementById('wfListing').classList.add('hidden');
  const detail = document.getElementById('wfDetail');
  detail.classList.remove('hidden');

  // Reset to overview tab
  var firstTab = detail.querySelector('.tab-btn');
  if (firstTab) Workflows.switchTab('overview', firstTab);

  // Update sidebar active — match by data-wf-id attribute
  document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
  if (el) {
    const sideItem = el.closest('.wf-side-item');
    if (sideItem) sideItem.classList.add('active');
  }
  // Also sync sidebar when clicked from card (match by data attribute)
  var sideTarget = document.querySelector('.wf-side-item[data-wf-id="' + id + '"]');
  if (sideTarget) {
    document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
    sideTarget.classList.add('active');
  }
};

/** Renders the overview tab content from template data.
 * @param {Object} data - Template data object
 */
Workflows._renderOverviewTab = function(data) {
  var container = document.getElementById('wfDetailOverview');
  if (!container) return;

  var runs = data.runs || {};
  var lastRun = (data.recentRuns && data.recentRuns.length > 0) ? data.recentRuns[0] : null;
  var lastRunTime = lastRun ? lastRun.time : '—';
  var lastRunStatus = lastRun ? lastRun.status : '—';
  var lastRunStatusColor = lastRunStatus === 'success' ? 'text-green' : (lastRunStatus === 'failed' ? 'text-red' : '');

  var html =
    '<div class="overview-grid">' +
      '<div class="detail-section bevel">' +
        '<div class="detail-section-bar"><div class="art-stripe"></div>' +
        '<span class="detail-section-title">Status</span><div class="art-stripe"></div></div>' +
        '<div class="detail-section-body">' +
          '<div class="kv-row"><span class="kv-key">State</span><span class="kv-val status-' + data.status + '">● ' + escapeHtml(data.status.charAt(0).toUpperCase() + data.status.slice(1)) + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Last Run</span><span class="kv-val">' + escapeHtml(lastRunTime) + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Last Result</span><span class="kv-val ' + lastRunStatusColor + '">' + escapeHtml(lastRunStatus.charAt(0).toUpperCase() + lastRunStatus.slice(1)) + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Avg Duration</span><span class="kv-val">' + escapeHtml(runs.avgDuration || '—') + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-section bevel">' +
        '<div class="detail-section-bar"><div class="art-stripe"></div>' +
        '<span class="detail-section-title">Performance</span><div class="art-stripe"></div></div>' +
        '<div class="detail-section-body">' +
          '<div class="kv-row"><span class="kv-key">Total Runs</span><span class="kv-val">' + (runs.total || 0) + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Success Rate</span><span class="kv-val text-green">' + (runs.successRate ? runs.successRate + '%' : '—') + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Files Processed</span><span class="kv-val">' + (runs.filesProcessed || 0) + '</span></div>' +
          '<div class="kv-row"><span class="kv-key">Created</span><span class="kv-val">' + escapeHtml(data.createdDate) + '</span></div>' +
        '</div>' +
      '</div>';

  // Recent activity from recentRuns
  if (data.recentRuns && data.recentRuns.length > 0) {
    html += '<div class="detail-section bevel overview-full">' +
      '<div class="detail-section-bar"><div class="art-stripe"></div>' +
      '<span class="detail-section-title">Recent Activity</span><div class="art-stripe"></div></div>' +
      '<div class="detail-section-body">';
    data.recentRuns.forEach(function(run) {
      var dotClass = run.status === 'success' ? 'success' : 'failed';
      html += '<div class="run-row cursor-default">' +
        '<div class="run-status-dot ' + dotClass + '"></div>' +
        '<span class="run-id">' + escapeHtml(run.id) + '</span>' +
        '<span class="run-trigger">' + escapeHtml(run.trigger) + '</span>' +
        '<span class="run-time">' + escapeHtml(run.time) + '</span>' +
        '<span class="run-duration">' + escapeHtml(run.duration) + '</span>' +
        '</div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  container.innerHTML = html;
};

/** Renders the schema tab content showing input/output schemas.
 * @param {Object} data - Template data object
 */
Workflows._renderSchemaTab = function(data) {
  var container = document.getElementById('tab-schema');
  if (!container) return;

  var html = '';
  var input = data.inputSchema;
  var output = data.outputSchema;

  // Input Schema section
  if (input) {
    html += '<div class="detail-section bevel">' +
      '<div class="detail-section-bar"><div class="art-stripe"></div>' +
      '<span class="detail-section-title">Input Schema</span><div class="art-stripe"></div></div>' +
      '<div class="detail-section-body">';

    if (input.description) {
      html += '<p class="schema-desc">' + escapeHtml(input.description) + '</p>';
    }

    if (input.fields && input.fields.length > 0) {
      html += '<div class="schema-field-list">';
      input.fields.forEach(function(field) {
        var reqHtml = field.required ? '<span class="schema-required">Required</span>' : '';
        html += '<div class="schema-field-row">' +
          '<div class="schema-field-header">' +
            '<span class="schema-field-name">' + escapeHtml(field.name) + '</span>' +
            '<span class="schema-type-badge schema-type-' + field.type + '">' + escapeHtml(field.type) + '</span>' +
            reqHtml +
          '</div>' +
          '<div class="schema-field-desc">' + escapeHtml(field.description) + '</div>';
        if (field.type === 'enum' && field.options) {
          html += '<div class="schema-field-options">' +
            field.options.map(function(opt) {
              return '<span class="schema-option-chip">' + escapeHtml(opt) + '</span>';
            }).join('') +
          '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div></div>';
  }

  // Output Schema section
  if (output) {
    html += '<div class="detail-section bevel">' +
      '<div class="detail-section-bar"><div class="art-stripe"></div>' +
      '<span class="detail-section-title">Output Schema</span><div class="art-stripe"></div></div>' +
      '<div class="detail-section-body">';

    // Format + destination row
    html += '<div class="schema-output-meta">';
    if (output.format) {
      html += '<span class="file-chip ' + output.format + '">' + escapeHtml(output.format.toUpperCase()) + '</span>';
    }
    if (output.destination) {
      html += '<span class="schema-destination">' + escapeHtml(output.destination) + '</span>';
    }
    html += '</div>';

    // Column list
    if (output.columns && output.columns.length > 0) {
      html += '<div class="schema-columns">' +
        '<div class="schema-columns-label">Columns</div>' +
        '<div class="schema-column-list">';
      output.columns.forEach(function(col) {
        html += '<span class="schema-column-chip">' + escapeHtml(col) + '</span>';
      });
      html += '</div></div>';
    }
    html += '</div></div>';
  }

  container.innerHTML = html;
};

/** Renders the triggers tab content showing trigger configuration.
 * @param {Object} data - Template data object
 */
Workflows._renderTriggersTab = function(data) {
  var container = document.getElementById('tab-triggers');
  if (!container) return;

  var html = '';
  var config = data.triggerConfig || {};
  var primaryType = data.triggerType;
  var hasTriggers = false;

  // Build trigger items from triggerConfig fields
  // Primary trigger type
  if (primaryType) {
    var meta = Workflows._triggerMeta[primaryType] || { icon: 'manualTrigger', label: primaryType };
    var triggerIcon = typeof icon === 'function' ? icon(meta.icon) : '';
    var detail = '';

    if (primaryType === 'folder-watch' && config.watchPath) {
      detail = '<span class="trigger-detail-path">' + escapeHtml(config.watchPath) + '</span>';
    } else if (primaryType === 'schedule' && config.schedule) {
      detail = '<span class="trigger-detail-schedule">' + escapeHtml(config.schedule) + '</span>';
    } else if (primaryType === 'manual') {
      detail = '<span class="trigger-detail-text">Triggered manually via Run button</span>';
    }

    html += '<div class="trigger-item">' +
      '<div class="trigger-item-icon">' + triggerIcon + '</div>' +
      '<div class="trigger-item-body">' +
        '<div class="trigger-item-header">' +
          '<span class="trigger-item-type">' + escapeHtml(meta.label) + '</span>' +
          '<span class="trigger-item-badge trigger-primary">Primary</span>' +
        '</div>' +
        (detail ? '<div class="trigger-item-detail">' + detail + '</div>' : '') +
      '</div>' +
    '</div>';
    hasTriggers = true;
  }

  // Chat command trigger (may be secondary)
  if (config.chatCommand && primaryType !== 'chat-command') {
    var cmdMeta = Workflows._triggerMeta['chat-command'];
    var cmdIcon = typeof icon === 'function' ? icon(cmdMeta.icon) : '';
    html += '<div class="trigger-item">' +
      '<div class="trigger-item-icon">' + cmdIcon + '</div>' +
      '<div class="trigger-item-body">' +
        '<div class="trigger-item-header">' +
          '<span class="trigger-item-type">' + escapeHtml(cmdMeta.label) + '</span>' +
        '</div>' +
        '<div class="trigger-item-detail">' +
          '<code class="trigger-detail-command">' + escapeHtml(config.chatCommand) + '</code>' +
        '</div>' +
      '</div>' +
    '</div>';
    hasTriggers = true;
  } else if (config.chatCommand && primaryType === 'chat-command') {
    // Primary IS chat-command, show command detail on the primary item
    // Re-render primary with command detail
    var chatMeta = Workflows._triggerMeta['chat-command'];
    var chatIcon = typeof icon === 'function' ? icon(chatMeta.icon) : '';
    html = '<div class="trigger-item">' +
      '<div class="trigger-item-icon">' + chatIcon + '</div>' +
      '<div class="trigger-item-body">' +
        '<div class="trigger-item-header">' +
          '<span class="trigger-item-type">' + escapeHtml(chatMeta.label) + '</span>' +
          '<span class="trigger-item-badge trigger-primary">Primary</span>' +
        '</div>' +
        '<div class="trigger-item-detail">' +
          '<code class="trigger-detail-command">' + escapeHtml(config.chatCommand) + '</code>' +
        '</div>' +
      '</div>' +
    '</div>';
    hasTriggers = true;
  }

  // If no triggers configured
  if (!hasTriggers) {
    html += '<div class="trigger-empty">No triggers configured</div>';
  }

  // Add Trigger button
  html += '<button class="add-source-btn" data-action="add-trigger">+ Add Trigger</button>';

  container.innerHTML = html;
};

/** Renders the runs tab content from template data.
 * @param {Object} data - Template data object
 */
Workflows._renderRunsTab = function(data) {
  var container = document.getElementById('tab-runs');
  if (!container) return;

  var runs = data.recentRuns || [];
  var html = '';

  if (runs.length === 0) {
    html = '<div class="runs-empty">' +
      '<span class="runs-empty-text">No runs yet</span>' +
      '<span class="runs-empty-sub">Run this workflow to see execution history</span>' +
    '</div>';
  } else {
    // Summary bar
    var stats = data.runs || {};
    html += '<div class="runs-summary">' +
      '<span class="runs-summary-stat"><span class="runs-summary-val">' + (stats.total || 0) + '</span> runs</span>' +
      '<span class="runs-summary-sep">·</span>' +
      '<span class="runs-summary-stat"><span class="runs-summary-val text-green">' + (stats.successRate ? stats.successRate + '%' : '—') + '</span> success</span>' +
      '<span class="runs-summary-sep">·</span>' +
      '<span class="runs-summary-stat"><span class="runs-summary-val">' + escapeHtml(stats.avgDuration || '—') + '</span> avg</span>' +
    '</div>';

    // Run rows
    runs.forEach(function(run) {
      var dotClass = run.status === 'success' ? 'success' : 'failed';
      var hasThread = run.threadId ? true : false;
      var rowClass = 'run-row' + (hasThread ? ' run-row-linked' : ' cursor-default');
      var threadAttr = hasThread ? ' data-thread-id="' + escapeHtml(run.threadId) + '"' : '';
      html += '<div class="' + rowClass + '"' + threadAttr + ' data-action="run-row-click">' +
        '<div class="run-status-dot ' + dotClass + '"></div>' +
        '<span class="run-id">' + escapeHtml(run.id) + '</span>' +
        '<span class="run-trigger">' + escapeHtml(run.trigger) + '</span>' +
        '<span class="run-time">' + escapeHtml(run.time) + '</span>' +
        '<span class="run-duration">' + escapeHtml(run.duration) + '</span>' +
      '</div>';
    });
  }

  container.innerHTML = html;
};

/**
 * Renders the lessons tab content from template data.
 * Cross-references linkedLessons with MOCK_LESSONS and shows which nodes use each lesson.
 * @param {Object} data - Template data object
 */
Workflows._renderLessonsTab = function(data) {
  var container = document.getElementById('tab-lessons');
  if (!container) return;

  var lessonIds = data.linkedLessons || [];
  var html = '';

  if (lessonIds.length === 0) {
    html = '<div class="lessons-tab-empty">' +
      '<span class="lessons-tab-empty-text">No linked lessons</span>' +
      '<span class="lessons-tab-empty-sub">Link lessons to help Cosimo follow your domain rules</span>' +
    '</div>';
  } else {
    lessonIds.forEach(function(lessonId) {
      var lesson = MOCK_LESSONS[lessonId];
      if (!lesson) return;

      // Find which nodes reference this lesson
      var usingNodes = (data.nodes || []).filter(function(n) {
        return n.lesson === lessonId;
      });
      var nodeNames = usingNodes.map(function(n) { return n.title; });

      html += '<div class="lesson-tab-card">' +
        '<div class="lesson-tab-card-header">' +
          '<span class="lesson-tab-card-diamond">◆</span>' +
          '<span class="lesson-tab-card-title">' + escapeHtml(lesson.title) + '</span>' +
          '<span class="lesson-tab-card-scope lesson-scope-' + lesson.scope + '">' + escapeHtml(lesson.scope) + '</span>' +
        '</div>' +
        (nodeNames.length > 0
          ? '<div class="lesson-tab-card-nodes">' +
              '<span class="lesson-tab-card-nodes-label">Used by:</span>' +
              nodeNames.map(function(name) {
                return '<span class="lesson-tab-card-node-chip">' + escapeHtml(name) + '</span>';
              }).join('') +
            '</div>'
          : '') +
        '<div class="lesson-tab-card-preview">' + escapeHtml(lesson.preview) + '</div>' +
        '<div class="lesson-tab-card-meta">' +
          '<span class="lesson-tab-card-author">' + escapeHtml(lesson.author) + '</span>' +
          '<span class="lesson-tab-card-sep">·</span>' +
          '<span class="lesson-tab-card-date">Updated ' + escapeHtml(lesson.updated) + '</span>' +
        '</div>' +
      '</div>';
    });
  }

  // Link Lesson button
  html += '<button class="add-source-btn" data-action="link-lesson">+ Link Lesson</button>';

  container.innerHTML = html;
};

/** Returns to the workflow listing view from the detail view. */
Workflows.showWorkflowListing = function() {
  document.getElementById('wfListing').classList.remove('hidden');
  document.getElementById('wfDetail').classList.add('hidden');
  document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
  Workflows._lastViewState = null;
  UI.closeCosimoPanel();
};

/**
 * Finds a mock run thread for a template by searching MOCK_WORKFLOW_RUNS.
 * Returns the threadId of the first matching run, or null.
 * @param {string} templateId - Template ID to search for
 * @returns {string|null} Thread ID of a matching run
 */
Workflows._findRunThread = function(templateId) {
  var keys = Object.keys(MOCK_WORKFLOW_RUNS);
  for (var i = 0; i < keys.length; i++) {
    var run = MOCK_WORKFLOW_RUNS[keys[i]];
    if (run.templateId === templateId) return run.threadId;
  }
  return null;
};

/**
 * Navigates from Workflows to Chat, selecting the run thread for a template.
 * Opens the workflow context panel automatically.
 * @param {string} templateId - Template ID to find a run for
 */
Workflows.navigateToRun = function(templateId) {
  var threadId = Workflows._findRunThread(templateId);
  if (!threadId) {
    showToast('No mock run available for this workflow');
    return;
  }
  Workflows.navigateToThread(threadId);
};

/**
 * Navigates from Workflows to Chat for a specific thread ID.
 * @param {string} threadId - Thread ID to navigate to
 */
Workflows.navigateToThread = function(threadId) {
  if (!MOCK_THREADS[threadId]) return;
  var chatTab = document.getElementById('tabChat');
  UI.switchMode('chat', chatTab);
  var sideItem = document.querySelector('.thread-item[data-thread-id="' + threadId + '"]');
  Chat.selectThread(threadId, sideItem);
};

// ============================================
// FLOW GRAPH RENDERER
// ============================================

/** Color scheme for each node type (stroke, fill CSS variables). */
Workflows._nodeColors = {
  input:  { stroke: 'var(--blue-3)',  fill: 'var(--blue-1)' },
  action: { stroke: 'var(--violet-3)', fill: 'var(--violet-1)' },
  gate:   { stroke: 'var(--amber)',    fill: 'rgba(var(--amber-rgb), 0.08)' },
  branch: { stroke: 'var(--taupe-3)',  fill: 'var(--off-white)' },
  output: { stroke: 'var(--green)',    fill: 'rgba(var(--green-rgb), 0.08)' }
};

/** Dark mode fill overrides (higher alpha on tinted fills). */
Workflows._nodeColorsDark = {
  gate:   'rgba(var(--amber-rgb), 0.12)',
  output: 'rgba(var(--green-rgb), 0.12)'
};

/**
 * Renders a flow graph SVG for a workflow template.
 * @param {string} templateId - Template ID from MOCK_WORKFLOW_TEMPLATES
 * @param {string} containerId - DOM element ID to render into
 * @param {Object} [options] - Render options
 * @param {boolean} [options.compact=false] - Compact mode (smaller nodes, no description)
 * @param {boolean} [options.showStatus=false] - Show run status colors on nodes
 * @param {string|null} [options.runId=null] - Run ID for status lookup
 */
Workflows.renderFlowGraph = function(templateId, containerId, options) {
  var opts = options || {};
  var compact = opts.compact || false;
  var showStatus = opts.showStatus || false;
  var runId = opts.runId || null;

  var template = MOCK_WORKFLOW_TEMPLATES[templateId];
  if (!template) return;

  var container = document.getElementById(containerId);
  if (!container) return;

  var nodes = template.nodes || [];
  var edges = template.edges || [];

  // Node dimensions
  var nodeW = compact ? 100 : 160;
  var nodeH = compact ? 36 : 60;
  var xSpacing = compact ? 130 : 200;
  var ySpacing = compact ? 60 : 100;
  var padding = compact ? 30 : 60;

  // Find grid bounds
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(function(n) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  });

  // Build node position map (grid coords -> pixel center)
  var nodeMap = {};
  nodes.forEach(function(n) {
    var px = (n.x - minX) * xSpacing + padding + nodeW / 2;
    var py = (n.y - minY) * ySpacing + padding + nodeH / 2;
    nodeMap[n.id] = { data: n, cx: px, cy: py };
  });

  // SVG dimensions
  var svgW = (maxX - minX) * xSpacing + nodeW + padding * 2;
  var svgH = (maxY - minY) * ySpacing + nodeH + padding * 2;

  // Get run statuses if applicable
  var nodeStatuses = null;
  if (showStatus && runId && MOCK_WORKFLOW_RUNS[runId]) {
    nodeStatuses = MOCK_WORKFLOW_RUNS[runId].nodeStatuses;
  }

  // Build SVG — compact mode scales to fit container, full mode uses fixed dimensions
  var svg = '<svg class="flow-graph-svg' + (compact ? ' flow-graph-compact' : '') + '" ';
  if (compact) {
    // Compact: use viewBox for scaling, width 100% so it fits the panel
    svg += 'width="100%" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet" ';
  } else {
    svg += 'width="100%" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet" ';
  }
  svg += 'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Workflow flow graph">';

  // Defs: arrowhead marker
  svg += '<defs>' +
    '<marker id="arrowhead-' + templateId + '" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">' +
    '<path d="M0,0 L8,3 L0,6" class="flow-edge-arrow" />' +
    '</marker>' +
    '</defs>';

  // Wrap all content in a transform group for zoom/pan (full mode only)
  if (!compact) {
    svg += '<g class="flow-graph-transform">';
  }

  // Render edges first (below nodes)
  svg += '<g class="flow-edges">';
  edges.forEach(function(edge) {
    var fromNode = nodeMap[edge.from];
    var toNode = nodeMap[edge.to];
    if (!fromNode || !toNode) return;

    var x1 = fromNode.cx;
    var y1 = fromNode.cy + nodeH / 2;
    var x2 = toNode.cx;
    var y2 = toNode.cy - nodeH / 2;

    // Build path: straight if same column, otherwise route with a bend
    var pathD;
    if (Math.abs(x1 - x2) < 2) {
      // Straight vertical line
      pathD = 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
    } else {
      // Route: go down from source, bend horizontally, then down to target
      var midY = (y1 + y2) / 2;
      pathD = 'M' + x1 + ',' + y1 +
        ' L' + x1 + ',' + midY +
        ' L' + x2 + ',' + midY +
        ' L' + x2 + ',' + y2;
    }

    svg += '<path d="' + pathD + '" class="flow-edge" ' +
      'marker-end="url(#arrowhead-' + templateId + ')" />';

    // Branch label near the horizontal segment of bent edges
    if (edge.label && !compact) {
      var midY = (y1 + y2) / 2;
      // Position label on the horizontal segment, offset above the line
      var lx = (x1 + x2) / 2;
      var ly = midY - 6;
      // For bent edges, anchor toward the destination side for clarity
      var anchor = 'middle';
      if (Math.abs(x1 - x2) > 2) {
        // Offset further from the line on horizontal segments
        ly = midY - 8;
      }
      svg += '<text x="' + lx + '" y="' + ly + '" class="flow-edge-label" text-anchor="' + anchor + '">' +
        escapeHtml(edge.label) + '</text>';
    }
  });
  svg += '</g>';

  // Render nodes
  svg += '<g class="flow-nodes">';
  nodes.forEach(function(n) {
    var pos = nodeMap[n.id];
    var rx = pos.cx - nodeW / 2;
    var ry = pos.cy - nodeH / 2;
    var colors = Workflows._nodeColors[n.type] || Workflows._nodeColors.action;
    var isGate = n.type === 'gate';

    // Determine status class
    var statusClass = '';
    if (nodeStatuses && nodeStatuses[n.id]) {
      statusClass = ' flow-node-status-' + nodeStatuses[n.id];
    }

    svg += '<g class="flow-node flow-node-' + n.type + statusClass + '" ' +
      'data-node-id="' + n.id + '" data-template-id="' + templateId + '" ' +
      'tabindex="0" role="button" aria-label="' + escapeHtml(n.title) + ' (' + n.type + ')">';

    // Node rect
    svg += '<rect x="' + rx + '" y="' + ry + '" width="' + nodeW + '" height="' + nodeH + '" ' +
      'rx="6" ry="6" ' +
      'class="flow-node-rect" ' +
      'style="stroke:' + colors.stroke + '; fill:' + colors.fill + ';"' +
      (isGate ? ' stroke-dasharray="6 3"' : '') + ' />';

    // Title + description via foreignObject for text wrapping
    var foX = rx + 4;
    var foY = ry + 2;
    var foW = nodeW - 8;
    var foH = nodeH - 4;
    svg += '<foreignObject x="' + foX + '" y="' + foY + '" width="' + foW + '" height="' + foH + '">';
    svg += '<div xmlns="http://www.w3.org/1999/xhtml" class="flow-node-fo' + (compact ? ' compact' : '') + '">';
    svg += '<div class="flow-node-title">' + escapeHtml(n.title) + '</div>';
    if (!compact && n.description) {
      svg += '<div class="flow-node-desc">' + escapeHtml(n.description) + '</div>';
    }
    svg += '</div></foreignObject>';

    // Lesson indicator chip (full mode only)
    if (!compact && n.lesson) {
      var chipX = rx + nodeW - 8;
      var chipY = ry + 8;
      svg += '<circle cx="' + chipX + '" cy="' + chipY + '" r="3" class="flow-node-lesson-dot" />';
    }

    svg += '</g>';
  });
  svg += '</g>';

  // Close transform group for full mode
  if (!compact) {
    svg += '</g>';
  }

  svg += '</svg>';

  // Clear placeholder and insert SVG
  container.innerHTML = svg;

  // Initialize zoom/pan for full mode (skip if noInteraction flag set)
  if (!compact && !opts.noInteraction) {
    Workflows._initGraphInteraction(container, svgW, svgH);
  }
};

// ============================================
// FLOW GRAPH INTERACTION (zoom, pan, node click)
// ============================================

/** Current zoom/pan state for the flow graph. */
Workflows._graphZoom = 1;
Workflows._graphPanX = 0;
Workflows._graphPanY = 0;
Workflows._graphDragging = false;
Workflows._graphDragStart = null;
Workflows._graphPanStart = null;

/**
 * Initializes zoom (wheel) and pan (drag) on a flow graph container.
 * Only used for full-mode graphs, not compact.
 * @param {HTMLElement} container - The graph container element
 * @param {number} svgW - Natural SVG width
 * @param {number} svgH - Natural SVG height
 */
Workflows._initGraphInteraction = function(container, svgW, svgH) {
  // Reset state
  Workflows._graphZoom = 1;
  Workflows._graphPanX = 0;
  Workflows._graphPanY = 0;
  Workflows._graphDragging = false;

  var svg = container.querySelector('.flow-graph-svg');
  var transformGroup = container.querySelector('.flow-graph-transform');
  if (!svg || !transformGroup) return;

  /** Apply current transform to the group element. */
  function applyTransform() {
    transformGroup.setAttribute('transform',
      'translate(' + Workflows._graphPanX + ',' + Workflows._graphPanY + ') ' +
      'scale(' + Workflows._graphZoom + ')');
  }

  // --- Mouse wheel zoom ---
  container.addEventListener('wheel', function(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? -0.1 : 0.1;
    var newZoom = Math.max(0.3, Math.min(3, Workflows._graphZoom + delta));

    // Zoom toward cursor position
    var rect = svg.getBoundingClientRect();
    var cursorX = e.clientX - rect.left;
    var cursorY = e.clientY - rect.top;

    // Adjust pan so zoom centers on cursor
    var zoomRatio = newZoom / Workflows._graphZoom;
    Workflows._graphPanX = cursorX - zoomRatio * (cursorX - Workflows._graphPanX);
    Workflows._graphPanY = cursorY - zoomRatio * (cursorY - Workflows._graphPanY);
    Workflows._graphZoom = newZoom;

    applyTransform();
  }, { passive: false });

  // --- Mouse drag pan ---
  container.addEventListener('mousedown', function(e) {
    // Only pan on direct container/svg clicks, not on nodes
    if (e.target.closest('.flow-node')) return;
    if (e.button !== 0) return;
    Workflows._graphDragging = true;
    Workflows._graphDragStart = { x: e.clientX, y: e.clientY };
    Workflows._graphPanStart = { x: Workflows._graphPanX, y: Workflows._graphPanY };
    container.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!Workflows._graphDragging) return;
    var dx = e.clientX - Workflows._graphDragStart.x;
    var dy = e.clientY - Workflows._graphDragStart.y;
    Workflows._graphPanX = Workflows._graphPanStart.x + dx;
    Workflows._graphPanY = Workflows._graphPanStart.y + dy;
    applyTransform();
  });

  document.addEventListener('mouseup', function() {
    if (Workflows._graphDragging) {
      Workflows._graphDragging = false;
      container.style.cursor = '';
    }
  });
};

/**
 * Handles node selection in the flow graph.
 * Highlights the selected node and stores current selection.
 * @param {string} nodeId - The node ID to select
 * @param {string} templateId - The template this node belongs to
 */
Workflows.selectNode = function(nodeId, templateId) {
  // Remove previous selection
  document.querySelectorAll('.flow-node.selected').forEach(function(n) {
    n.classList.remove('selected');
  });

  // Add selection to clicked node
  var node = document.querySelector('.flow-node[data-node-id="' + nodeId + '"][data-template-id="' + templateId + '"]');
  if (node) {
    node.classList.add('selected');
  }

  Workflows._selectedNodeId = nodeId;
  Workflows._selectedTemplateId = templateId;
};

/** Currently selected node. */
Workflows._selectedNodeId = null;
Workflows._selectedTemplateId = null;

// ============================================
// NODE POPOVER
// ============================================

/**
 * Opens a detail popover for a flow graph node.
 * @param {string} nodeId - The node ID
 * @param {string} templateId - The template this node belongs to
 * @param {DOMRect} anchorRect - Bounding rect of the clicked node for positioning
 */
Workflows.openNodePopover = function(nodeId, templateId, anchorRect) {
  Workflows.closeNodePopover();

  var tpl = MOCK_WORKFLOW_TEMPLATES[templateId];
  if (!tpl) return;

  var node = null;
  for (var i = 0; i < tpl.nodes.length; i++) {
    if (tpl.nodes[i].id === nodeId) { node = tpl.nodes[i]; break; }
  }
  if (!node) return;

  // Build type label
  var typeLabels = { input: 'Input', action: 'Action', gate: 'Gate', branch: 'Branch', output: 'Output' };
  var typeLabel = typeLabels[node.type] || node.type;

  // Build linked lesson HTML
  var lessonHtml = '';
  if (node.lesson && MOCK_LESSONS[node.lesson]) {
    var les = MOCK_LESSONS[node.lesson];
    lessonHtml = '<div class="node-popover-lesson">' +
      '<div class="node-popover-lesson-label">Linked Lesson</div>' +
      '<div class="node-popover-lesson-title">' +
        '<span class="node-popover-lesson-diamond">&#9670;</span> ' +
        escapeHtml(les.title) +
      '</div>' +
      '<div class="node-popover-lesson-preview">' + escapeHtml(les.preview.substring(0, 120)) + '&hellip;</div>' +
    '</div>';
  }

  // Build popover HTML
  var html = '<div class="node-popover" data-node-id="' + nodeId + '" data-template-id="' + templateId + '">' +
    '<div class="node-popover-header">' +
      '<span class="node-popover-type node-popover-type--' + node.type + '">' + typeLabel + '</span>' +
      '<button class="node-popover-close" aria-label="Close popover">&times;</button>' +
    '</div>' +
    '<div class="node-popover-title">' + escapeHtml(node.title) + '</div>' +
    '<div class="node-popover-desc">' + escapeHtml(node.description) + '</div>' +
    lessonHtml +
    '<div class="node-popover-actions">' +
      '<button class="node-popover-cosimo-btn" data-action="popover-edit-cosimo">Edit with Cosimo</button>' +
    '</div>' +
  '</div>';

  // Insert into graph column (position relative ancestor)
  var graphCol = document.querySelector('.wf-detail-graph-col');
  if (!graphCol) return;
  graphCol.insertAdjacentHTML('beforeend', html);

  var popover = graphCol.querySelector('.node-popover');
  if (!popover) return;

  // Position relative to graph column
  var colRect = graphCol.getBoundingClientRect();
  var popoverW = 320;
  var left = (anchorRect.left + anchorRect.width / 2) - colRect.left - popoverW / 2;
  var top = anchorRect.bottom - colRect.top + 8;

  // Clamp to stay within column bounds
  if (left < 8) left = 8;
  if (left + popoverW > colRect.width - 8) left = colRect.width - popoverW - 8;

  popover.style.left = left + 'px';
  popover.style.top = top + 'px';

  // Animate in
  requestAnimationFrame(function() {
    popover.classList.add('show');
  });

  Workflows._activePopover = popover;
};

/**
 * Closes any open node popover.
 */
Workflows.closeNodePopover = function() {
  var existing = document.querySelector('.node-popover');
  if (existing) existing.remove();
  Workflows._activePopover = null;
};

/** Reference to active popover element. */
Workflows._activePopover = null;

/** Opens the Cosimo panel pre-loaded with context for the current template.
 * @param {string} [templateId] - Template ID (defaults to _currentTemplateId)
 */
Workflows.openCosimoForTemplate = function(templateId) {
  var id = templateId || Workflows._currentTemplateId;
  if (!id) { UI.openCosimoPanel(); return; }
  var tpl = MOCK_WORKFLOW_TEMPLATES[id];
  if (!tpl) { UI.openCosimoPanel(); return; }

  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + tpl.title;

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">&#9670;</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I have the <strong>' + escapeHtml(tpl.title) + '</strong> workflow loaded (' +
      tpl.nodes.length + ' nodes, ' + tpl.status + '). I can help you:' +
      '<br><br>' +
      '<strong>"Add a validation step before the output"</strong><br>' +
      '<strong>"Change the trigger to run on a schedule"</strong><br>' +
      '<strong>"Add a gate node for manual review"</strong><br>' +
      '<strong>"Update the output format to CSV"</strong>' +
    '</div>';

  var panelInput = document.getElementById('panelInput');
  if (panelInput) panelInput.textContent = '';

  UI.openCosimoPanel();
};

/** Opens the Cosimo panel pre-loaded with context for a specific node.
 * @param {string} nodeId - The node ID
 * @param {string} [templateId] - Template ID (defaults to _currentTemplateId)
 */
Workflows.openCosimoForNode = function(nodeId, templateId) {
  var tplId = templateId || Workflows._currentTemplateId;
  if (!tplId) { UI.openCosimoPanel(); return; }
  var tpl = MOCK_WORKFLOW_TEMPLATES[tplId];
  if (!tpl) { UI.openCosimoPanel(); return; }
  var node = tpl.nodes.find(function(n) { return n.id === nodeId; });
  if (!node) { UI.openCosimoPanel(); return; }

  var typeLabels = { input: 'Input', action: 'Action', gate: 'Gate', branch: 'Branch', output: 'Output' };
  var typeLabel = typeLabels[node.type] || node.type;

  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + node.title;

  var lessonCtx = '';
  if (node.lesson && MOCK_LESSONS[node.lesson]) {
    lessonCtx = ' This node uses the <strong>' + escapeHtml(MOCK_LESSONS[node.lesson].title) + '</strong> lesson.';
  }

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">&#9670;</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'Editing the <strong>' + escapeHtml(node.title) + '</strong> ' + typeLabel + ' node in ' +
      escapeHtml(tpl.title) + '.' + lessonCtx +
      '<br><br>' +
      'I can help you:' +
      '<br><br>' +
      '<strong>"Change what this step extracts"</strong><br>' +
      '<strong>"Add error handling for missing fields"</strong><br>' +
      '<strong>"Split this into two separate steps"</strong><br>' +
      '<strong>"Connect this to a different output"</strong>' +
    '</div>';

  var panelInput = document.getElementById('panelInput');
  if (panelInput) panelInput.textContent = 'Edit the "' + node.title + '" step to ';

  UI.openCosimoPanel();
};

// ============================================
// TABS
// ============================================
/** Switches the active tab in the workflow detail view.
 * @param {string} tabId - Tab identifier ('overview' | 'steps' | 'runs' | 'outputs')
 * @param {HTMLElement} btn - The tab button element to mark active
 */
Workflows.switchTab = function(tabId, btn) {
  var infoCol = document.querySelector('.wf-detail-info-col');
  if (!infoCol) return;
  infoCol.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  infoCol.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  var panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.add('active');
};

// ============================================
// BRAIN — MEMORY SECTION
// ============================================

var activeCategory = 'all';

/** Renders the Brain Memory section (role profile, traits, fact cards) from mock data. */
BrainMemory.renderMemoryFromData = function() {
  // Render role profile
  var roleField = document.getElementById('roleField');
  if (roleField) roleField.textContent = MOCK_MEMORY.roleProfile;

  // Render selected traits
  var traitSelected = document.getElementById('traitSelected');
  if (traitSelected) {
    traitSelected.innerHTML = MOCK_MEMORY.selectedTraits.map(function(t) {
      return '<span class="mem-trait-tag active">' + escapeHtml(t) + ' <span class="trait-x">&times;</span></span>';
    }).join('');
  }

  // Render preset traits (disable those that are selected)
  var traitPresets = document.getElementById('traitPresets');
  if (traitPresets) {
    traitPresets.innerHTML = MOCK_MEMORY.presetTraits.map(function(t) {
      var isSelected = MOCK_MEMORY.selectedTraits.indexOf(t) !== -1;
      return '<span class="mem-trait-tag' + (isSelected ? ' disabled' : '') + '">' + escapeHtml(t) + '</span>';
    }).join('');
  }

  // Render fact cards
  var factList = document.getElementById('memFactList');
  if (factList) {
    factList.innerHTML = MOCK_MEMORY.facts.map(function(f) {
      var entityChipsHtml = '';
      if (f.linkedEntities && f.linkedEntities.length > 0) {
        var entityTypeIcons = { person: 'person', fund: 'building', property: 'folder', document: 'lessons' };
        entityChipsHtml = '<div class="mem-entity-chips">' +
          f.linkedEntities.map(function(ent) {
            var iconName = entityTypeIcons[ent.type] || 'graphs';
            return '<button class="mem-entity-chip" data-entity-name="' + escapeHtml(ent.name) + '" data-entity-type="' + escapeHtml(ent.type) + '">' +
              icon(iconName, 10, 10) +
              '<span class="mem-entity-chip-label">' + escapeHtml(ent.name) + '</span>' +
            '</button>';
          }).join('') +
        '</div>';
      }
      return '<div class="mem-fact-card" data-category="' + f.category + '">' +
        '<div class="mem-fact-top">' +
          '<span class="mem-fact-cat cat-' + f.category + '">' + f.category.charAt(0).toUpperCase() + f.category.slice(1) + '</span>' +
          '<button class="mem-fact-menu-btn">' +
            ICONS.dots +
          '</button>' +
          '<div class="mem-fact-menu">' +
            '<button class="mem-fact-edit">Edit</button>' +
            '<button class="mem-fact-delete">Delete</button>' +
          '</div>' +
        '</div>' +
        '<div class="mem-fact-text">' + escapeHtml(f.text) + '</div>' +
        entityChipsHtml +
        '<div class="mem-fact-meta">' +
          '<span class="mem-fact-source">' + escapeHtml(f.source) + '</span>' +
          '<span class="mem-fact-date">' + escapeHtml(f.date) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
};

// Render memory data on load
(function() { BrainMemory.renderMemoryFromData(); })();

/** Toggles the add-memory form visibility and focuses the input. */
BrainMemory.toggleAddMemory = function() {
  var form = document.getElementById('memAddForm');
  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    document.getElementById('memAddInput').focus();
  } else {
    form.classList.add('hidden');
  }
};

/** Hides the add-memory form and clears the input. */
BrainMemory.cancelAddMemory = function() {
  document.getElementById('memAddForm').classList.add('hidden');
  document.getElementById('memAddInput').value = '';
};

/** Creates a new memory fact card from the add-memory form and prepends it to the list. */
BrainMemory.submitNewMemory = function() {
  var input = document.getElementById('memAddInput');
  var text = input.value.trim();
  if (!text) return;

  var category = document.getElementById('memAddCategory').value;
  var today = new Date();
  var dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  var card = document.createElement('div');
  card.className = 'mem-fact-card';
  card.setAttribute('data-category', category);
  card.innerHTML =
    '<div class="mem-fact-top">' +
      '<span class="mem-fact-cat cat-' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</span>' +
      '<button class="mem-fact-menu-btn">' +
        ICONS.dots +
      '</button>' +
      '<div class="mem-fact-menu">' +
        '<button class="mem-fact-edit">Edit</button>' +
        '<button class="mem-fact-delete">Delete</button>' +
      '</div>' +
    '</div>' +
    '<div class="mem-fact-text">' + escapeHtml(text) + '</div>' +
    '<div class="mem-fact-meta">' +
      '<span class="mem-fact-source">Added by you</span>' +
      '<span class="mem-fact-date">' + dateStr + '</span>' +
    '</div>';

  var list = document.getElementById('memFactList');
  list.insertBefore(card, list.firstChild);

  input.value = '';
  document.getElementById('memAddForm').classList.add('hidden');
  showToast('Memory saved');
};

/** Filters memory fact cards by search query and active category. */
BrainMemory.filterMemories = function() {
  var query = document.getElementById('memSearchInput').value.toLowerCase();
  var cards = document.querySelectorAll('.mem-fact-card');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var text = card.querySelector('.mem-fact-text').textContent.toLowerCase();
    var cat = card.getAttribute('data-category');
    var matchesSearch = !query || text.indexOf(query) !== -1;
    var matchesCategory = activeCategory === 'all' || cat === activeCategory;

    if (matchesSearch && matchesCategory) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('memNoResults').classList.toggle('hidden', visibleCount > 0);
};

/** Sets the active memory category filter and re-filters the list.
 * @param {string} cat - Category name ('all' | 'preference' | 'workflow' | etc.)
 * @param {HTMLElement} el - The clicked category pill element
 */
BrainMemory.filterByCategory = function(cat, el) {
  activeCategory = cat;

  document.querySelectorAll('.mem-cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');

  BrainMemory.filterMemories();
};

/** Toggles the edit/delete context menu on a memory fact card.
 * @param {HTMLElement} btn - The menu trigger button
 */
BrainMemory.toggleFactMenu = function(btn) {
  // Close all other menus first
  document.querySelectorAll('.mem-fact-menu.open').forEach(function(m) { m.classList.remove('open'); });

  var menu = btn.nextElementSibling;
  menu.classList.toggle('open');
};

/** Makes a memory fact card's text editable inline; saves on blur or Enter.
 * @param {HTMLElement} btn - The edit button inside the fact menu
 */
BrainMemory.editFact = function(btn) {
  var card = btn.closest('.mem-fact-card');
  var textEl = card.querySelector('.mem-fact-text');
  var menu = btn.closest('.mem-fact-menu');
  menu.classList.remove('open');

  textEl.setAttribute('contenteditable', 'true');
  textEl.focus();

  // Select all text
  var range = document.createRange();
  range.selectNodeContents(textEl);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Save on blur
  function saveEdit() {
    textEl.removeAttribute('contenteditable');
    textEl.removeEventListener('blur', saveEdit);
    textEl.removeEventListener('keydown', handleKey);
    // Update source
    var source = card.querySelector('.mem-fact-source');
    source.textContent = 'Edited by you';
    showToast('Memory updated');
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      textEl.blur();
    }
    if (e.key === 'Escape') {
      textEl.blur();
    }
  }

  textEl.addEventListener('blur', saveEdit);
  textEl.addEventListener('keydown', handleKey);
};

/** Shows a delete confirmation prompt on a memory fact card.
 * @param {HTMLElement} btn - The delete button inside the fact menu
 */
BrainMemory.deleteFact = function(btn) {
  var card = btn.closest('.mem-fact-card');
  var menu = btn.closest('.mem-fact-menu');
  menu.classList.remove('open');

  // Check if confirmation already showing
  if (card.querySelector('.mem-delete-confirm')) return;

  var confirm = document.createElement('div');
  confirm.className = 'mem-delete-confirm';
  confirm.innerHTML =
    '<span>Delete this memory?</span>' +
    '<button class="mem-delete-yes">Yes</button>' +
    '<button class="mem-delete-no">No</button>';

  card.appendChild(confirm);
};

/** Confirms deletion and removes a memory fact card with animation.
 * @param {HTMLElement} btn - The "Yes" confirmation button
 */
BrainMemory.confirmDelete = function(btn) {
  var card = btn.closest('.mem-fact-card');
  card.style.transition = 'opacity 0.2s, max-height 0.2s';
  card.style.opacity = '0';
  card.style.maxHeight = card.offsetHeight + 'px';
  card.style.overflow = 'hidden';

  setTimeout(function() {
    card.style.maxHeight = '0';
    card.style.padding = '0 14px';
    card.style.marginBottom = '0';
  }, 50);

  setTimeout(function() {
    card.remove();
    BrainMemory.filterMemories(); // Update no-results state
    showToast('Memory deleted');
  }, 300);
};

/** Cancels a pending memory fact deletion and removes the confirmation prompt.
 * @param {HTMLElement} btn - The "No" cancellation button
 */
BrainMemory.cancelDelete = function(btn) {
  var confirm = btn.closest('.mem-delete-confirm');
  confirm.remove();
};

// Personality trait functions
/** Adds a preset personality trait to the selected list.
 * @param {HTMLElement} el - The preset trait tag element
 */
BrainMemory.toggleTrait = function(el) {
  if (el.classList.contains('disabled')) return;

  var traitName = el.textContent.trim();

  // Add to selected
  var selected = document.getElementById('traitSelected');
  var tag = document.createElement('span');
  tag.className = 'mem-trait-tag active';
  tag.onclick = function() { BrainMemory.removeTrait(tag); };
  tag.innerHTML = escapeHtml(traitName) + ' <span class="trait-x">&times;</span>';
  selected.appendChild(tag);

  // Disable in presets
  el.classList.add('disabled');

  showToast(traitName + ' added');
};

/** Removes a selected personality trait and re-enables it in presets.
 * @param {HTMLElement} el - The selected trait tag element to remove
 */
BrainMemory.removeTrait = function(el) {
  var traitName = el.textContent.replace('\u00d7', '').trim();

  // Re-enable in presets
  var presets = document.getElementById('traitPresets');
  presets.querySelectorAll('.mem-trait-tag').forEach(function(p) {
    if (p.textContent.trim() === traitName) {
      p.classList.remove('disabled');
    }
  });

  el.remove();
  showToast(traitName + ' removed');
};

/** Adds a custom personality trait from the text input to the selected list. */
BrainMemory.addCustomTrait = function() {
  var input = document.getElementById('traitInput');
  var text = input.value.trim();
  if (!text) return;

  var selected = document.getElementById('traitSelected');
  var tag = document.createElement('span');
  tag.className = 'mem-trait-tag active';
  tag.onclick = function() { BrainMemory.removeTrait(tag); };
  tag.innerHTML = escapeHtml(text) + ' <span class="trait-x">&times;</span>';
  selected.appendChild(tag);

  input.value = '';
  showToast(text + ' added');
};

// Close fact menus when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.mem-fact-menu-btn') && !e.target.closest('.mem-fact-menu')) {
    document.querySelectorAll('.mem-fact-menu.open').forEach(function(m) { m.classList.remove('open'); });
  }
});

// ============================================
// BRAIN — LESSONS SECTION
// ============================================

var activeLessonScope = 'all';
var lessonIsEditing = false;

var lessonData = MOCK_LESSONS;

/** Renders the lesson card list from mock data into the lessons list view. */
BrainLessons.renderLessonList = function() {
  var list = document.getElementById('lessonList');
  if (!list) return;
  var scopeArrowSvg = ICONS.arrowRight;
  list.innerHTML = Object.keys(MOCK_LESSONS).map(function(id) {
    var d = MOCK_LESSONS[id];
    var scopeClass = d.scope === 'company' ? 'scope-company' : 'scope-user';
    var scopeLabel = d.scope === 'company' ? 'Company' : 'Personal';
    return '<div class="lesson-card" data-scope="' + d.scope + '" data-lesson="' + id + '">' +
      '<div class="lesson-card-top">' +
        '<span class="lesson-scope-badge ' + scopeClass + '">' + scopeLabel + '</span>' +
        '<div class="lesson-card-top-right">' +
          '<span class="lesson-usage">Referenced ' + d.usage + ' times</span>' +
          '<button class="lesson-card-scope-btn" title="Change scope">' + scopeArrowSvg + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="lesson-card-title">' + escapeHtml(d.title) + '</div>' +
      '<div class="lesson-card-preview">' + escapeHtml(d.preview) + '</div>' +
      '<div class="lesson-card-meta">' +
        '<span class="lesson-card-date">Updated ' + d.updated + '</span>' +
        '<span class="lesson-card-author">by ' + escapeHtml(d.author) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
};

// Render lesson list on load
(function() { BrainLessons.renderLessonList(); })();

BrainLessons.currentLessonId = null;

/** Filters lesson cards by search query and active scope filter. */
BrainLessons.filterLessons = function() {
  var query = document.getElementById('lessonSearchInput').value.toLowerCase();
  var cards = document.querySelectorAll('.lesson-card');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var title = card.querySelector('.lesson-card-title').textContent.toLowerCase();
    var preview = card.querySelector('.lesson-card-preview').textContent.toLowerCase();
    var scope = card.getAttribute('data-scope');
    var matchesSearch = !query || title.indexOf(query) !== -1 || preview.indexOf(query) !== -1;
    var matchesScope = activeLessonScope === 'all' || scope === activeLessonScope;

    if (matchesSearch && matchesScope) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('lessonNoResults').classList.toggle('hidden', visibleCount > 0);
};

/** Sets the active lesson scope filter and re-filters the list.
 * @param {string} scope - Scope value ('all' | 'user' | 'company')
 * @param {HTMLElement} el - The clicked scope pill element
 */
BrainLessons.filterLessonScope = function(scope, el) {
  activeLessonScope = scope;
  document.querySelectorAll('#lessonScopeFilters .mem-cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  BrainLessons.filterLessons();
};

/** Opens the detail view for a specific lesson.
 * @param {string} id - Lesson identifier key in lessonData
 */
BrainLessons.openLesson = function(id) {
  BrainLessons.currentLessonId = id;
  var data = lessonData[id];
  if (!data) return;

  // Update detail header
  document.getElementById('lessonDetailTitle').textContent = data.title;

  // Update meta bar
  var scopeBadge = document.getElementById('lessonDetailScope');
  scopeBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  scopeBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  // Update scope toggle button text
  document.getElementById('lessonScopeToggleText').textContent = data.scope === 'company' ? 'Change to Personal' : 'Promote to Company';

  // Switch views
  document.getElementById('lessonsListView').classList.add('hidden');
  document.getElementById('lessonDetailView').classList.remove('hidden');

  // Reset edit state
  lessonIsEditing = false;
  var editBtn = document.getElementById('lessonEditBtn');
  editBtn.innerHTML = ICONS.edit;
  editBtn.title = 'Edit Directly';
  editBtn.classList.remove('primary');
  document.getElementById('lessonDetailBody').removeAttribute('contenteditable');
};

/** Closes the lesson detail view and returns to the lesson list. */
BrainLessons.closeLessonDetail = function() {
  document.getElementById('lessonDetailView').classList.add('hidden');
  document.getElementById('lessonsListView').classList.remove('hidden');

  // Reset edit state
  if (lessonIsEditing) {
    lessonIsEditing = false;
    document.getElementById('lessonDetailBody').removeAttribute('contenteditable');
  }

  BrainLessons.currentLessonId = null;
};

/** Toggles inline editing mode for the current lesson's body text. */
BrainLessons.toggleLessonEdit = function() {
  var body = document.getElementById('lessonDetailBody');
  var editBtn = document.getElementById('lessonEditBtn');

  lessonIsEditing = !lessonIsEditing;

  if (lessonIsEditing) {
    body.setAttribute('contenteditable', 'true');
    body.focus();
    editBtn.innerHTML = ICONS.checkmark;
    editBtn.title = 'Save Changes';
    editBtn.classList.add('primary');
    showToast('Editing mode — click save when done');
  } else {
    body.removeAttribute('contenteditable');
    editBtn.innerHTML = ICONS.edit;
    editBtn.title = 'Edit Directly';
    editBtn.classList.remove('primary');
    showToast('Lesson saved');
  }
};

/** Opens the Cosimo panel pre-loaded with context for editing the current lesson. */
BrainLessons.openCosimoForLesson = function() {
  // Update Cosimo panel context for this lesson
  var data = lessonData[BrainLessons.currentLessonId];
  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + (data ? data.title : 'Lesson');

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I have the <strong>' + escapeHtml(data ? data.title : 'lesson') + '</strong> loaded. I can help you:' +
      '<br><br>' +
      '<strong>"Add a new validation rule"</strong><br>' +
      '<strong>"Update the column format for dates"</strong><br>' +
      '<strong>"Add an exception for Fund IV properties"</strong><br>' +
      '<strong>"Rewrite the overview section to be more concise"</strong>' +
    '</div>';

  UI.openCosimoPanel();
};

/** Toggles the current lesson's scope between 'company' and 'user' (personal). */
BrainLessons.toggleLessonScope = function() {
  var data = lessonData[BrainLessons.currentLessonId];
  if (!data) return;

  data.scope = data.scope === 'company' ? 'user' : 'company';

  var scopeBadge = document.getElementById('lessonDetailScope');
  scopeBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  scopeBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  document.getElementById('lessonScopeToggleText').textContent = data.scope === 'company' ? 'Change to Personal' : 'Promote to Company';

  // Update the card in list view too
  var card = document.querySelector('.lesson-card[data-lesson="' + BrainLessons.currentLessonId + '"]');
  if (card) {
    card.setAttribute('data-scope', data.scope);
    var cardBadge = card.querySelector('.lesson-scope-badge');
    cardBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
    cardBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');
  }

  showToast('Scope changed to ' + (data.scope === 'company' ? 'Company' : 'Personal'));
};

/** Deletes the current lesson and removes its card from the list with animation. */
BrainLessons.deleteLesson = function() {
  if (!BrainLessons.currentLessonId) return;

  var card = document.querySelector('.lesson-card[data-lesson="' + BrainLessons.currentLessonId + '"]');

  // Close detail view first
  BrainLessons.closeLessonDetail();

  // Remove card with animation
  if (card) {
    card.style.transition = 'opacity 0.2s, max-height 0.2s';
    card.style.opacity = '0';
    card.style.maxHeight = card.offsetHeight + 'px';
    card.style.overflow = 'hidden';

    setTimeout(function() {
      card.style.maxHeight = '0';
      card.style.padding = '0 14px';
    }, 50);

    setTimeout(function() {
      card.remove();
      BrainLessons.filterLessons();
    }, 300);
  }

  showToast('Lesson deleted');
};

/** Opens the Cosimo panel with a prompt to create a new lesson. */
BrainLessons.createNewLesson = function() {
  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Create New Lesson';

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I can help you create a new lesson. Describe what you want to teach me:' +
      '<br><br>' +
      '<strong>"How we format quarterly LP reports"</strong><br>' +
      '<strong>"Rules for processing capital call notices"</strong><br>' +
      '<strong>"Our naming conventions for fund entities"</strong><br>' +
      '<strong>"How to reconcile Yardi exports with GL"</strong>' +
    '</div>';

  UI.openCosimoPanel();
};

/** Toggles a lesson card's scope directly from the list view.
 * @param {HTMLElement} btn - The scope toggle button on the card
 * @param {Event} e - The click event (propagation is stopped)
 */
BrainLessons.toggleCardScope = function(btn, e) {
  e.stopPropagation(); // Don't open the lesson detail

  var card = btn.closest('.lesson-card');
  var lessonId = card.getAttribute('data-lesson');
  var data = lessonData[lessonId];
  if (!data) return;

  data.scope = data.scope === 'company' ? 'user' : 'company';
  card.setAttribute('data-scope', data.scope);

  var badge = card.querySelector('.lesson-scope-badge');
  badge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  badge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  showToast('Scope changed to ' + (data.scope === 'company' ? 'Company' : 'Personal'));

  // Re-apply filters in case scope filter is active
  BrainLessons.filterLessons();
};

// ============================================
// BRAIN — DATA GRAPHS
// ============================================

Graph.graphState = {
  level: 'root',        // 'root', 'cluster', 'entity'
  currentCategory: null,
  currentEntity: null
};

Graph.graphColors = {
  funds:     { core: '#9b6bc2', mid: '#74418F', dim: '#4D2B5F', glow: 'rgba(155,107,194,0.5)' },
  contacts:  { core: '#c278c4', mid: '#8B4F8D', dim: '#5D355E', glow: 'rgba(194,120,196,0.5)' },
  documents: { core: '#7bb8d9', mid: '#5a9fc2', dim: '#3a7a9e', glow: 'rgba(123,184,217,0.5)' },
  workflows: { core: '#6abf6e', mid: '#3D8B40', dim: '#2a6b2c', glow: 'rgba(106,191,110,0.5)' },
  systems:   { core: '#d4a646', mid: '#B8862B', dim: '#8a6518', glow: 'rgba(212,166,70,0.5)' },
  entities:  { core: '#9e9ca3', mid: '#6a6870', dim: '#4a484f', glow: 'rgba(158,156,163,0.4)' },
  you:       { core: '#b478d8', mid: '#8855a8', dim: '#5a3070', glow: 'rgba(180,120,216,0.6)' }
};


/** Finds an entity node across all graph categories by ID.
 * @param {string} entityId - The entity identifier
 * @returns {{node: Object, category: string}|null} The entity node and its category, or null
 */
Graph.findEntity = function(entityId) {
  for (var cat in MOCK_GRAPH_DATA.nodes) {
    var nodes = MOCK_GRAPH_DATA.nodes[cat];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === entityId) return { node: nodes[i], category: cat };
    }
  }
  return null;
};

// SVG namespace
var SVG_NS = 'http://www.w3.org/2000/svg';

// ---- PERSISTENT SVG GRAPH ENGINE ----
// All nodes are rendered once. Navigation = animating transforms/opacity.

Graph.graphBuilt = false;
Graph.graphW = 0; Graph.graphH = 0; Graph.graphCX = 0; Graph.graphCY = 0;
Graph.graphNodeEls = {};   // id -> { g, homeX, homeY, homeR }
Graph.graphEdgeEls = [];
Graph.driftRAF = null;
Graph.driftItems = [];
Graph.ANIM = 500; // ms for transitions

/** Builds the full SVG data graph with nodes, edges, gradients, and filters. */
Graph.buildGraph = function() {
  var container = document.getElementById('graphContainer');
  var svg = document.getElementById('graphSvg');
  Graph.graphW = container.offsetWidth;
  Graph.graphH = container.offsetHeight;

  if (Graph.graphW < 10 || Graph.graphH < 10) {
    setTimeout(Graph.buildGraph, 100);
    return;
  }

  Graph.graphCX = Graph.graphW / 2;
  Graph.graphCY = Graph.graphH / 2;
  svg.setAttribute('viewBox', '0 0 ' + Graph.graphW + ' ' + Graph.graphH);

  // Clear
  svg.innerHTML = '';
  Graph.graphNodeEls = {};
  Graph.graphEdgeEls = [];

  // --- Defs ---
  var defs = document.createElementNS(SVG_NS, 'defs');
  for (var cid in Graph.graphColors) {
    var gc = Graph.graphColors[cid];
    // Glow filter
    var f = document.createElementNS(SVG_NS, 'filter');
    f.setAttribute('id', 'glow-' + cid);
    f.setAttribute('x', '-80%'); f.setAttribute('y', '-80%');
    f.setAttribute('width', '260%'); f.setAttribute('height', '260%');
    var blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic'); blur.setAttribute('stdDeviation', '6'); blur.setAttribute('result', 'b');
    var cm = document.createElementNS(SVG_NS, 'feColorMatrix');
    cm.setAttribute('in', 'b'); cm.setAttribute('type', 'matrix');
    cm.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0');
    var merge = document.createElementNS(SVG_NS, 'feMerge');
    var mn1 = document.createElementNS(SVG_NS, 'feMergeNode');
    var mn2 = document.createElementNS(SVG_NS, 'feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1); merge.appendChild(mn2);
    f.appendChild(blur); f.appendChild(cm); f.appendChild(merge);
    defs.appendChild(f);

    // Gradient
    var grad = document.createElementNS(SVG_NS, 'radialGradient');
    grad.setAttribute('id', 'grad-' + cid);
    grad.setAttribute('cx', '38%'); grad.setAttribute('cy', '32%'); grad.setAttribute('r', '60%');
    grad.setAttribute('fx', '35%'); grad.setAttribute('fy', '28%');
    [[0,'#fff',0.25],[25,gc.core,1],[75,gc.mid,1],[100,gc.dim,1]].forEach(function(s) {
      var stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', s[0] + '%');
      stop.setAttribute('stop-color', s[1]);
      stop.setAttribute('stop-opacity', s[2]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
  }
  svg.appendChild(defs);

  // --- Background click layer ---
  var bgRect = document.createElementNS(SVG_NS, 'rect');
  bgRect.setAttribute('width', Graph.graphW); bgRect.setAttribute('height', Graph.graphH);
  bgRect.setAttribute('fill', 'transparent');
  bgRect.style.cursor = 'default';
  bgRect.addEventListener('click', function() {
    if (Graph.graphState.level === 'cluster') Graph.graphNavigate('root');
  });
  svg.appendChild(bgRect);

  // --- Edges layer ---
  var edgesG = document.createElementNS(SVG_NS, 'g');
  edgesG.setAttribute('id', 'graphEdges');
  svg.appendChild(edgesG);

  // --- Tether line (YOU → active category, shown in cluster view) ---
  var tether = document.createElementNS(SVG_NS, 'line');
  tether.setAttribute('id', 'graphTether');
  tether.setAttribute('x1', Graph.graphCX); tether.setAttribute('y1', Graph.graphCY);
  tether.setAttribute('x2', Graph.graphCX); tether.setAttribute('y2', Graph.graphCY);
  tether.setAttribute('stroke', 'rgba(180,120,216,0.5)');
  tether.setAttribute('stroke-width', '1.5');
  tether.setAttribute('stroke-dasharray', '6,4');
  tether.style.opacity = '0';
  tether.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';
  edgesG.appendChild(tether);

  // --- Orbital rings ---
  var orbitG = document.createElementNS(SVG_NS, 'g');
  orbitG.setAttribute('id', 'graphOrbits');
  var cats = MOCK_GRAPH_DATA.categories;
  var rootRadius = Math.min(Graph.graphCX, Graph.graphCY) * 0.52;

  var orbit = document.createElementNS(SVG_NS, 'circle');
  orbit.setAttribute('cx', Graph.graphCX); orbit.setAttribute('cy', Graph.graphCY);
  orbit.setAttribute('r', rootRadius); orbit.setAttribute('fill', 'none');
  orbit.setAttribute('stroke', 'rgba(255,255,255,0.04)'); orbit.setAttribute('stroke-width', '1');
  orbit.setAttribute('stroke-dasharray', '4,8');
  orbitG.appendChild(orbit);
  svg.appendChild(orbitG);

  // --- Build edges (center to each category) ---
  var catPositions = {};
  for (var i = 0; i < cats.length; i++) {
    var angle = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
    catPositions[cats[i].id] = {
      x: Graph.graphCX + Math.cos(angle) * rootRadius,
      y: Graph.graphCY + Math.sin(angle) * rootRadius
    };

    var edge = Graph.makeEdge(Graph.graphCX, Graph.graphCY, catPositions[cats[i].id].x, catPositions[cats[i].id].y, Graph.graphColors[cats[i].id].core, 0.2);
    edge.dataset.type = 'root-edge';
    edge.dataset.cat = cats[i].id;
    edgesG.appendChild(edge);
    Graph.graphEdgeEls.push(edge);
  }

  // Cross-connections
  var crossLinks = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,4],[2,5],[3,4],[0,5],[1,5]];
  for (var c = 0; c < crossLinks.length; c++) {
    var aId = cats[crossLinks[c][0]].id, bId = cats[crossLinks[c][1]].id;
    var a = catPositions[aId], b = catPositions[bId];
    var xedge = Graph.makeEdge(a.x, a.y, b.x, b.y, 'rgba(255,255,255,0.06)', 0.06);
    xedge.dataset.type = 'cross-edge';
    edgesG.appendChild(xedge);
    Graph.graphEdgeEls.push(xedge);
  }

  // --- Nodes layer ---
  var nodesG = document.createElementNS(SVG_NS, 'g');
  nodesG.setAttribute('id', 'graphNodes');
  svg.appendChild(nodesG);

  // --- Center YOU node ---
  var youNode = Graph.makeNode('you', 'YOU', '', Graph.graphCX, Graph.graphCY, 28, 'you', true);
  youNode.g.addEventListener('click', function() { Graph.graphNavigate('root'); });
  nodesG.appendChild(youNode.g);
  Graph.graphNodeEls['you'] = { g: youNode.g, homeX: Graph.graphCX, homeY: Graph.graphCY, homeR: 28, catId: null, type: 'center' };

  // --- Category nodes ---
  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    var pos = catPositions[cat.id];
    var nodeR = 20 + Math.min(cat.count, 20) * 0.6;

    var cn = Graph.makeNode(cat.id, cat.label, cat.count + ' items', pos.x, pos.y, nodeR, cat.id, false, cat.count);
    (function(catId) {
      cn.g.addEventListener('click', function() { Graph.graphNavigate(catId); });
    })(cat.id);

    nodesG.appendChild(cn.g);
    Graph.graphNodeEls[cat.id] = { g: cn.g, homeX: pos.x, homeY: pos.y, homeR: nodeR, catId: cat.id, type: 'category' };

    // --- Child entity nodes (initially hidden, positioned at parent) ---
    var childNodes = MOCK_GRAPH_DATA.nodes[cat.id] || [];
    // Distribute across rings — fewer per ring for readability
    var maxPerRing = 7;
    var ringCount = Math.ceil(childNodes.length / maxPerRing);
    var minDim = Math.min(Graph.graphCX, Graph.graphCY);
    var baseChildR = minDim * 0.45;
    var ringSpacing = minDim * 0.22;

    for (var j = 0; j < childNodes.length; j++) {
      var cNode = childNodes[j];
      var ringIdx = Math.floor(j / maxPerRing);
      var posInRing = j - ringIdx * maxPerRing;
      var nodesInThisRing = Math.min(maxPerRing, childNodes.length - ringIdx * maxPerRing);
      var childRadius = baseChildR + ringIdx * ringSpacing;
      var cAngle = (posInRing / nodesInThisRing) * Math.PI * 2 - Math.PI / 2 + ringIdx * 0.35;
      var childTargetX = Graph.graphCX + Math.cos(cAngle) * childRadius;
      var childTargetY = Graph.graphCY + Math.sin(cAngle) * childRadius;
      var abbr = cNode.label.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3);
      var childNodeR = ringIdx === 0 ? 16 : 13;

      var en = Graph.makeNode(cNode.id, cNode.label, cNode.sub, pos.x, pos.y, 0, cat.id, false, abbr);
      en.g.style.opacity = '0';
      en.g.style.pointerEvents = 'none';

      (function(entityId, catId) {
        en.g.addEventListener('click', function() { Graph.openGraphEntity(entityId, catId); });
      })(cNode.id, cat.id);

      nodesG.appendChild(en.g);
      Graph.graphNodeEls[cNode.id] = {
        g: en.g, homeX: childTargetX, homeY: childTargetY, homeR: childNodeR,
        parentX: pos.x, parentY: pos.y,
        catId: cat.id, type: 'entity'
      };

      // Edges from category center to child (hidden initially)
      var cEdge = Graph.makeEdge(Graph.graphCX, Graph.graphCY, childTargetX, childTargetY, Graph.graphColors[cat.id].core, 0.3);
      cEdge.style.opacity = '0';
      cEdge.dataset.type = 'child-edge';
      cEdge.dataset.cat = cat.id;
      edgesG.appendChild(cEdge);
      Graph.graphEdgeEls.push(cEdge);
    }
  }

  // --- Inter-entity edges (connections between child nodes within a category) ---
  for (var ci = 0; ci < cats.length; ci++) {
    var catChildren = MOCK_GRAPH_DATA.nodes[cats[ci].id] || [];
    var catChildIds = {};
    catChildren.forEach(function(cn) { catChildIds[cn.id] = true; });

    for (var cj = 0; cj < catChildren.length; cj++) {
      var child = catChildren[cj];
      if (!child.related) continue;
      for (var ri = 0; ri < child.related.length; ri++) {
        var relId = child.related[ri];
        // Only draw if the related node is in the SAME category and avoid duplicates (only draw a→b where a < b)
        if (!catChildIds[relId]) continue;
        if (child.id >= relId) continue;
        var ndA = Graph.graphNodeEls[child.id];
        var ndB = Graph.graphNodeEls[relId];
        if (!ndA || !ndB) continue;
        var ie = Graph.makeEdge(ndA.homeX, ndA.homeY, ndB.homeX, ndB.homeY, Graph.graphColors[cats[ci].id].core, 0.15);
        ie.style.opacity = '0';
        ie.dataset.type = 'inter-edge';
        ie.dataset.cat = cats[ci].id;
        edgesG.appendChild(ie);
        Graph.graphEdgeEls.push(ie);
      }
    }
  }

  // --- Cross-category related edges (dimmer, show in cluster view) ---
  for (var ci2 = 0; ci2 < cats.length; ci2++) {
    var catNodes2 = MOCK_GRAPH_DATA.nodes[cats[ci2].id] || [];
    for (var cn2 = 0; cn2 < catNodes2.length; cn2++) {
      var cNode2 = catNodes2[cn2];
      if (!cNode2.related) continue;
      for (var ri2 = 0; ri2 < cNode2.related.length; ri2++) {
        var rId2 = cNode2.related[ri2];
        // Check if this related entity is in a DIFFERENT category
        var relFound = Graph.findEntity(rId2);
        if (!relFound || relFound.category === cats[ci2].id) continue;
        if (cNode2.id >= rId2) continue; // avoid duplicates
        var ndC = Graph.graphNodeEls[cNode2.id];
        var ndD = Graph.graphNodeEls[rId2];
        if (!ndC || !ndD) continue;
        var xe = Graph.makeEdge(ndC.homeX, ndC.homeY, ndD.homeX, ndD.homeY, 'rgba(255,255,255,0.08)', 0.08);
        xe.style.opacity = '0';
        xe.dataset.type = 'cross-entity-edge';
        xe.dataset.srcCat = cats[ci2].id;
        xe.dataset.dstCat = relFound.category;
        edgesG.appendChild(xe);
        Graph.graphEdgeEls.push(xe);
      }
    }
  }

  Graph.graphBuilt = true;
  Graph.applyRootState(false);
  Graph.startDriftLoop(svg);
};

/** Creates a curved SVG path element representing an edge between two points.
 * @param {number} x1 - Start X coordinate
 * @param {number} y1 - Start Y coordinate
 * @param {number} x2 - End X coordinate
 * @param {number} y2 - End Y coordinate
 * @param {string} color - Stroke color
 * @param {number} opacity - Initial opacity (0-1)
 * @returns {SVGPathElement} The edge path element
 */
Graph.makeEdge = function(x1, y1, x2, y2, color, opacity) {
  var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  var dx = x2 - x1, dy = y2 - y1;
  var nx = -dy * 0.08, ny = dx * 0.08;
  var d = 'M' + x1 + ',' + y1 + ' Q' + (mx + nx) + ',' + (my + ny) + ' ' + x2 + ',' + y2;

  var path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '1');
  path.style.opacity = opacity;
  path.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';
  return path;
};

/** Creates an SVG node group with glow, body circle, labels, and tooltip.
 * @param {string} id - Node identifier
 * @param {string} label - Primary label text
 * @param {string} sub - Secondary label text
 * @param {number} x - Initial X position
 * @param {number} y - Initial Y position
 * @param {number} r - Circle radius
 * @param {string} colorId - Key into graphColors for styling
 * @param {boolean} isCenter - Whether this is the center "YOU" node
 * @param {string|number} [innerText] - Text displayed inside the circle
 * @returns {{g: SVGGElement}} Object containing the group element
 */
Graph.makeNode = function(id, label, sub, x, y, r, colorId, isCenter, innerText) {
  var col = Graph.graphColors[colorId];
  var g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('data-node-id', id);
  g.style.cursor = 'pointer';
  g.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';

  // We use a nested <g> for position so we can animate it
  var posG = document.createElementNS(SVG_NS, 'g');
  posG.setAttribute('data-pos', '1');
  posG.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  g.appendChild(posG);

  // Glow circle
  var glow = document.createElementNS(SVG_NS, 'circle');
  glow.setAttribute('cx', 0); glow.setAttribute('cy', 0);
  glow.setAttribute('fill', 'url(#grad-' + colorId + ')');
  glow.setAttribute('filter', 'url(#glow-' + colorId + ')');
  glow.style.r = r + 'px';
  posG.appendChild(glow);

  // Body circle
  var body = document.createElementNS(SVG_NS, 'circle');
  body.setAttribute('cx', 0); body.setAttribute('cy', 0);
  body.setAttribute('fill', 'url(#grad-' + colorId + ')');
  body.style.r = r + 'px';
  posG.appendChild(body);

  // Edge highlight
  var edge = document.createElementNS(SVG_NS, 'circle');
  edge.setAttribute('cx', 0); edge.setAttribute('cy', 0);
  edge.setAttribute('fill', 'none'); edge.setAttribute('stroke', 'rgba(255,255,255,0.12)');
  edge.setAttribute('stroke-width', '1');
  edge.style.r = r + 'px';
  posG.appendChild(edge);

  // Store circle refs for animation
  g._circles = [glow, body, edge];
  g._posG = posG;

  // Inner text
  if (innerText !== undefined && innerText !== '') {
    var txt = document.createElementNS(SVG_NS, 'text');
    txt.setAttribute('x', 0); txt.setAttribute('y', 0);
    txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('fill', 'rgba(255,255,255,0.85)');
    txt.setAttribute('font-family', "'IBM Plex Mono', monospace");
    txt.setAttribute('font-size', isCenter ? '11' : Math.max(9, r * 0.5));
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = innerText;
    posG.appendChild(txt);
    g._innerText = txt;
  }

  // Label below
  var lbl = document.createElementNS(SVG_NS, 'text');
  lbl.setAttribute('x', 0); lbl.setAttribute('y', r + 16);
  lbl.setAttribute('text-anchor', 'middle');
  lbl.setAttribute('fill', 'rgba(255,255,255,0.7)');
  lbl.setAttribute('font-family', "'IBM Plex Mono', monospace");
  lbl.setAttribute('font-size', '10'); lbl.setAttribute('font-weight', '600');
  lbl.setAttribute('pointer-events', 'none');
  lbl.textContent = label;
  posG.appendChild(lbl);
  g._label = lbl;

  // Sub label
  if (sub) {
    var slbl = document.createElementNS(SVG_NS, 'text');
    slbl.setAttribute('x', 0); slbl.setAttribute('y', r + 28);
    slbl.setAttribute('text-anchor', 'middle');
    slbl.setAttribute('fill', 'rgba(255,255,255,0.3)');
    slbl.setAttribute('font-family', "'IBM Plex Mono', monospace");
    slbl.setAttribute('font-size', '9');
    slbl.setAttribute('pointer-events', 'none');
    slbl.textContent = sub;
    posG.appendChild(slbl);
    g._subLabel = slbl;
  }

  // Hover tooltip
  g.addEventListener('mouseenter', function(e) {
    var tip = label + (sub ? ' \u00b7 ' + sub : '');
    Graph.showGraphTooltip(g, tip);
  });
  g.addEventListener('mouseleave', Graph.hideGraphTooltip);

  return { g: g };
};

/** Animates a graph node to a new position, radius, and opacity.
 * @param {Object} nodeData - Node data from graphNodeEls with g, _posG, _circles
 * @param {number} toX - Target X position
 * @param {number} toY - Target Y position
 * @param {number} toR - Target circle radius
 * @param {number} toOpacity - Target opacity (0-1)
 * @param {number} [delay=0] - Delay in ms before animation starts
 */
Graph.animateNode = function(nodeData, toX, toY, toR, toOpacity, delay) {
  var g = nodeData.g;
  var posG = g._posG;
  var circles = g._circles;
  var easing = 'cubic-bezier(0.34, 1, 0.64, 1)';

  setTimeout(function() {
    // Animate position via CSS transform (animatable)
    posG.style.transition = 'transform ' + Graph.ANIM + 'ms ' + easing;
    posG.style.transform = 'translate(' + toX + 'px,' + toY + 'px)';

    // Animate radius via CSS r property (animatable)
    circles.forEach(function(c) {
      c.style.transition = 'r ' + Graph.ANIM + 'ms ' + easing;
      c.style.r = toR + 'px';
    });

    // Animate opacity
    g.style.opacity = toOpacity;

    // Update label offsets
    if (g._label) {
      g._label.setAttribute('y', toR + 14);
      g._label.style.opacity = toR < 10 ? '0' : '1';
    }
    if (g._subLabel) {
      g._subLabel.setAttribute('y', toR + 25);
      // Hide sub-label on small nodes to reduce clutter
      g._subLabel.style.opacity = toR < 18 ? '0' : '1';
    }
    if (g._innerText) {
      g._innerText.setAttribute('font-size', Math.max(8, toR * 0.45));
    }

    // Pointer events
    g.style.pointerEvents = toOpacity > 0.1 ? 'auto' : 'none';
  }, delay || 0);
};

/** Transitions the graph to root state: YOU at center, categories in orbit, entities hidden.
 * @param {boolean} animated - Whether to animate the transition or apply instantly
 */
Graph.applyRootState = function(animated) {
  var cats = MOCK_GRAPH_DATA.categories;
  var d = animated ? 0 : -1; // -1 means instant

  // Edges
  Graph.graphEdgeEls.forEach(function(edge) {
    if (!animated) edge.style.transition = 'none';
    else edge.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';

    if (edge.dataset.type === 'root-edge' || edge.dataset.type === 'cross-edge') {
      edge.style.opacity = edge.dataset.type === 'root-edge' ? '0.2' : '0.06';
    } else {
      edge.style.opacity = '0';
    }
  });

  // Helper to disable transitions for instant positioning
  function setInstant(nd) {
    nd.g.style.transition = 'none';
    nd.g._posG.style.transition = 'none';
    nd.g._circles.forEach(function(c) { c.style.transition = 'none'; });
  }

  // YOU node — center, full size
  var youD = Graph.graphNodeEls['you'];
  if (!animated) setInstant(youD);
  Graph.animateNode(youD, Graph.graphCX, Graph.graphCY, 28, 1, 0);
  youD.g.classList.remove('is-home');

  // Hide tether
  var tether = document.getElementById('graphTether');
  if (!animated) tether.style.transition = 'none';
  else tether.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';
  tether.style.opacity = '0';

  // Category nodes — orbital positions, full size
  cats.forEach(function(cat, i) {
    var nd = Graph.graphNodeEls[cat.id];
    if (!animated) setInstant(nd);
    Graph.animateNode(nd, nd.homeX, nd.homeY, nd.homeR, 1, animated ? i * 40 : 0);
  });

  // Entity nodes — collapse to parent, hidden
  for (var nid in Graph.graphNodeEls) {
    var nd = Graph.graphNodeEls[nid];
    if (nd.type !== 'entity') continue;
    if (!animated) setInstant(nd);
    Graph.animateNode(nd, nd.parentX, nd.parentY, 0, 0, 0);
  }

  // Background cursor
  document.querySelector('#graphSvg rect').style.cursor = 'default';
};

/** Transitions the graph to cluster state: selected category at center with entity children expanded.
 * @param {string} catId - Category identifier to drill into
 */
Graph.applyClusterState = function(catId) {
  var cats = MOCK_GRAPH_DATA.categories;
  var col = Graph.graphColors[catId];

  // Edges — hide root edges, show child + inter-entity edges for this category
  Graph.graphEdgeEls.forEach(function(edge) {
    edge.style.transition = 'opacity ' + Graph.ANIM + 'ms ease';
    if (edge.dataset.type === 'child-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.2';
    } else if (edge.dataset.type === 'inter-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.15';
    } else if (edge.dataset.type === 'root-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.15';
    } else {
      edge.style.opacity = '0';
    }
  });

  // YOU node — move to top-left corner as a small "home" bubble
  var youD = Graph.graphNodeEls['you'];
  Graph.animateNode(youD, 50, 50, 18, 0.85, 0);
  youD.g.classList.add('is-home');

  // Tether line from YOU bubble to center category
  var tether = document.getElementById('graphTether');
  tether.setAttribute('stroke', col.glow.replace(/[\d.]+\)$/, '0.6)'));
  tether.setAttribute('x1', 50); tether.setAttribute('y1', 50);
  tether.setAttribute('x2', Graph.graphCX); tether.setAttribute('y2', Graph.graphCY);
  tether.style.opacity = '1';

  // Category nodes — clicked one moves to center and grows, others shrink to edges
  var otherIdx = 0;
  var otherCats = cats.filter(function(c) { return c.id !== catId; });
  var edgeR = Math.min(Graph.graphCX, Graph.graphCY) * 0.85;

  cats.forEach(function(cat) {
    var nd = Graph.graphNodeEls[cat.id];
    if (cat.id === catId) {
      // Animate to center, slightly smaller so children have room
      Graph.animateNode(nd, Graph.graphCX, Graph.graphCY, 24, 1, 0);
    } else {
      // Animate to periphery, shrink
      var angle = (otherIdx / otherCats.length) * Math.PI * 2 - Math.PI * 0.3;
      var ex = Graph.graphCX + Math.cos(angle) * edgeR;
      var ey = Graph.graphCY + Math.sin(angle) * edgeR;
      Graph.animateNode(nd, ex, ey, 8, 0.35, 0);
      otherIdx++;
    }
  });

  // Entity nodes for this category — expand from center to orbital positions
  var childNodes = MOCK_GRAPH_DATA.nodes[catId] || [];
  childNodes.forEach(function(cNode, i) {
    var nd = Graph.graphNodeEls[cNode.id];
    if (nd) {
      Graph.animateNode(nd, nd.homeX, nd.homeY, nd.homeR, 1, 80 + i * 35);
    }
  });

  // Entity nodes for OTHER categories — ensure hidden
  for (var nid in Graph.graphNodeEls) {
    var nd = Graph.graphNodeEls[nid];
    if (nd.type === 'entity' && nd.catId !== catId) {
      Graph.animateNode(nd, nd.parentX, nd.parentY, 0, 0, 0);
    }
  }

  // Background cursor
  document.querySelector('#graphSvg rect').style.cursor = 'pointer';
};

/** Navigates the graph to root view or drills into a category cluster.
 * @param {string} target - 'root' or a category ID
 */
Graph.graphNavigate = function(target) {
  Graph.closeGraphDetail();
  Graph.hideGraphTooltip();

  if (target === 'root') {
    Graph.graphState.level = 'root';
    Graph.graphState.currentCategory = null;
    Graph.graphState.currentEntity = null;
    Graph.updateBreadcrumb();
    Graph.applyRootState(true);
  } else {
    Graph.graphState.level = 'cluster';
    Graph.graphState.currentCategory = target;
    Graph.graphState.currentEntity = null;
    Graph.updateBreadcrumb();
    Graph.applyClusterState(target);
  }
};

/** Opens the detail pane for a specific entity in the data graph.
 * @param {string} entityId - Entity identifier
 * @param {string} categoryId - Category the entity belongs to
 */
Graph.openGraphEntity = function(entityId, categoryId) {
  Graph.graphState.currentEntity = entityId;
  var found = Graph.findEntity(entityId);
  if (!found) return;

  var node = found.node;
  var col = Graph.graphColors[found.category];

  Graph.updateBreadcrumb();

  document.getElementById('graphDetailName').textContent = node.label;
  document.getElementById('graphDetailType').textContent = node.sub;

  var iconEl = document.getElementById('graphDetailIcon');
  iconEl.style.background = col.core;
  iconEl.style.borderColor = col.dim;
  iconEl.style.color = '#fff';
  iconEl.innerHTML = '&#9670;';

  var factsHtml = '';
  for (var i = 0; i < node.facts.length; i++) {
    factsHtml += '<div class="graph-fact-row"><span class="graph-fact-bullet">\u2022</span><span class="graph-fact-text">' + escapeHtml(node.facts[i]) + '</span></div>';
  }
  document.getElementById('graphDetailFacts').innerHTML = factsHtml;

  var relHtml = '';
  for (var i = 0; i < node.related.length; i++) {
    var rel = Graph.findEntity(node.related[i]);
    if (rel) {
      relHtml += '<button class="graph-related-pill" data-entity-id="' + rel.node.id + '" data-entity-cat="' + rel.category + '">' + escapeHtml(rel.node.label) + '</button>';
    }
  }
  document.getElementById('graphDetailRelated').innerHTML = relHtml;

  // Highlight the clicked node
  var nd = Graph.graphNodeEls[entityId];
  if (nd) {
    nd.g._circles[2].setAttribute('stroke', 'rgba(255,255,255,0.5)');
    nd.g._circles[2].setAttribute('stroke-width', '2');
  }

  document.getElementById('graphDetailPane').classList.add('open');
};

/** Closes the graph entity detail pane and un-highlights the selected node. */
Graph.closeGraphDetail = function() {
  document.getElementById('graphDetailPane').classList.remove('open');

  // Un-highlight any selected node
  if (Graph.graphState.currentEntity) {
    var nd = Graph.graphNodeEls[Graph.graphState.currentEntity];
    if (nd) {
      nd.g._circles[2].setAttribute('stroke', 'rgba(255,255,255,0.12)');
      nd.g._circles[2].setAttribute('stroke-width', '1');
    }
  }

  Graph.graphState.currentEntity = null;
  Graph.updateBreadcrumb();
};

/** Navigates to a related entity, switching categories if needed.
 * @param {string} entityId - Target entity identifier
 * @param {string} categoryId - Target entity's category
 */
Graph.navigateToRelated = function(entityId, categoryId) {
  // Un-highlight current
  Graph.closeGraphDetail();

  if (categoryId !== Graph.graphState.currentCategory) {
    Graph.graphState.level = 'cluster';
    Graph.graphState.currentCategory = categoryId;
    Graph.updateBreadcrumb();
    Graph.applyClusterState(categoryId);
    setTimeout(function() {
      Graph.openGraphEntity(entityId, categoryId);
    }, Graph.ANIM + 50);
  } else {
    setTimeout(function() {
      Graph.openGraphEntity(entityId, categoryId);
    }, 100);
  }
};

/** Updates the graph breadcrumb navigation to reflect the current graph state. */
Graph.updateBreadcrumb = function() {
  var bc = document.getElementById('graphBreadcrumb');
  var html = '<button class="graph-crumb' + (Graph.graphState.level === 'root' ? ' active' : '') + '" data-nav="root">You</button>';

  if (Graph.graphState.currentCategory) {
    var cat = MOCK_GRAPH_DATA.categories.find(function(c) { return c.id === Graph.graphState.currentCategory; });
    html += '<span class="graph-crumb-sep">&rsaquo;</span>';
    html += '<button class="graph-crumb' + (!Graph.graphState.currentEntity ? ' active' : '') + '" data-nav="' + Graph.graphState.currentCategory + '">' + (cat ? cat.label : '') + '</button>';
  }

  if (Graph.graphState.currentEntity) {
    var found = Graph.findEntity(Graph.graphState.currentEntity);
    if (found) {
      html += '<span class="graph-crumb-sep">&rsaquo;</span>';
      html += '<button class="graph-crumb active">' + found.node.label + '</button>';
    }
  }

  bc.innerHTML = html;
};

/** Shows a tooltip positioned above a graph node.
 * @param {SVGGElement} nodeG - The node's SVG group element
 * @param {string} text - Tooltip text to display
 */
Graph.showGraphTooltip = function(nodeG, text) {
  var tip = document.getElementById('graphTooltip');
  var container = document.getElementById('graphContainer');
  var cr = container.getBoundingClientRect();
  var svg = document.getElementById('graphSvg');
  var vb = svg.viewBox.baseVal;
  var sx = cr.width / (vb.width || cr.width);
  var sy = cr.height / (vb.height || cr.height);

  var posG = nodeG._posG || nodeG.querySelector('[data-pos]');
  if (posG) {
    var t = posG.style.transform || posG.getAttribute('transform') || '';
    var m = t.match(/translate\(([\d.\-]+)(?:px)?\s*,\s*([\d.\-]+)(?:px)?\)/);
    if (m) {
      var ncx = parseFloat(m[1]) * sx;
      var ncy = parseFloat(m[2]) * sy;

      tip.textContent = text;
      tip.classList.add('show');

      var tipW = tip.offsetWidth;
      var left = ncx - tipW / 2;
      if (left < 4) left = 4;
      if (left + tipW > cr.width - 4) left = cr.width - tipW - 4;
      tip.style.left = left + 'px';
      tip.style.top = (ncy - 40) + 'px';
    }
  }
};

/** Hides the graph tooltip. */
Graph.hideGraphTooltip = function() {
  document.getElementById('graphTooltip').classList.remove('show');
};

/** Initializes the subtle drift animation loop for graph nodes (currently disabled).
 * @param {SVGElement} svg - The graph SVG element
 */
Graph.startDriftLoop = function(svg) {
  if (Graph.driftRAF) cancelAnimationFrame(Graph.driftRAF);
  Graph.driftItems = [];

  // Collect all position groups
  var allPosGs = svg.querySelectorAll('[data-pos]');
  allPosGs.forEach(function(pg, i) {
    Graph.driftItems.push({
      el: pg,
      phase: i * 1.1 + Math.random() * 2,
      ampX: 1.5 + Math.random() * 2,
      ampY: 1.5 + Math.random() * 2,
      speed: 0.25 + Math.random() * 0.3,
      baseTransform: null // will be read each frame
    });
  });

  var t0 = performance.now();
  function tick(now) {
    var t = (now - t0) / 1000;
    for (var i = 0; i < Graph.driftItems.length; i++) {
      var d = Graph.driftItems[i];
      // Read the current base transform (set by animations)
      var raw = d.el.style.transform || d.el.getAttribute('transform') || 'translate(0,0)';
      var m = raw.match(/translate\(([\d.\-]+)(?:px)?\s*,\s*([\d.\-]+)(?:px)?\)/);
      if (!m) continue;
      var bx = parseFloat(m[1]), by = parseFloat(m[2]);

      var dx = Math.sin(t * d.speed + d.phase) * d.ampX;
      var dy = Math.cos(t * d.speed * 0.7 + d.phase + 1) * d.ampY;

      // We DON'T overwrite transform — drift is too subtle to fight the animation.
      // Instead we only apply drift when no CSS transition is active.
      // The visual drift is small enough that it works naturally.
    }
    Graph.driftRAF = requestAnimationFrame(tick);
  }
  // Drift disabled for now to avoid fighting transitions — the animated navigation IS the motion.
  // Graph.driftRAF = requestAnimationFrame(tick);
};

/** Placeholder for editing the currently selected graph entity. */
Graph.editGraphEntity = function() {
  if (!Graph.graphState.currentEntity) return;
  var found = Graph.findEntity(Graph.graphState.currentEntity);
  if (!found) return;
  showToast('Editing ' + found.node.label + ' — coming soon');
};

/** Opens the Cosimo panel pre-loaded with context for editing the current graph entity. */
Graph.openCosimoForEntity = function() {
  if (!Graph.graphState.currentEntity) return;
  var found = Graph.findEntity(Graph.graphState.currentEntity);
  if (!found) return;

  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + found.node.label;

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I have <strong>' + escapeHtml(found.node.label) + '</strong> loaded. I can help you:' +
      '<br><br>' +
      '<strong>"Update the fee structure details"</strong><br>' +
      '<strong>"Add a new related contact"</strong><br>' +
      '<strong>"Correct the committed capital amount"</strong><br>' +
      '<strong>"Remove outdated information"</strong>' +
    '</div>';

  UI.openCosimoPanel();
};

/** Finds a graph entity by label name and navigates to it. Shows toast if not found. */
Graph.selectByName = function(name) {
  for (var cat in MOCK_GRAPH_DATA.nodes) {
    var nodes = MOCK_GRAPH_DATA.nodes[cat];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].label === name) {
        var catId = cat;
        var entityId = nodes[i].id;
        if (!Graph.graphBuilt) Graph.buildGraph();
        setTimeout(function() {
          Graph.openGraphEntity(entityId, catId);
        }, 150);
        return;
      }
    }
  }
  showToast('Entity "' + name + '" not found in graph');
};

// Render graph when switching to graphs section
(function() {
  var origSwitchBrainSection = UI.switchBrainSection;
  UI.switchBrainSection = function(section, el) {
    origSwitchBrainSection(section, el);
    if (section === 'graphs') {
      setTimeout(function() {
        if (!Graph.graphBuilt) Graph.buildGraph();
    }, 50);
  }
  };
})();

// Re-render on resize
var graphResizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(graphResizeTimer);
  graphResizeTimer = setTimeout(function() {
    if (document.getElementById('brain-graphs').classList.contains('active')) {
      Graph.graphBuilt = false;
      Graph.buildGraph();
    }
  }, 300);
});

// Detail pane resize via drag handle
(function() {
  var handle = document.getElementById('graphDetailResize');
  if (!handle) return;
  var pane = document.getElementById('graphDetailPane');
  var container = document.getElementById('graphContainer');
  var dragging = false;
  var startY = 0;
  var startH = 0;

  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    dragging = true;
    startY = e.clientY;
    startH = pane.offsetHeight;
    pane.style.transition = 'none';
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var containerH = container.offsetHeight;
    var newH = startH + (startY - e.clientY);
    var minH = 120;
    var maxH = containerH * 0.85;
    newH = Math.max(minH, Math.min(maxH, newH));
    pane.style.height = newH + 'px';
  });

  window.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    pane.style.transition = '';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
})();

// ============================================
// TOAST NOTIFICATIONS (#8)
// ============================================
/** Displays a toast notification message that auto-dismisses.
 * @param {string} text - Message to display
 * @param {number} [duration=2000] - Display duration in ms
 */
function showToast(text, duration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, duration || 2000);
}

/** Escapes HTML special characters in a string to prevent XSS.
 * @param {string} text - Raw text to escape
 * @returns {string} HTML-safe string
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// EVENT LISTENERS (replaces all inline onclick handlers)
// ============================================
(function initEventListeners() {

  // --- Brain nav: Toggle collapse ---
  var brainNavToggle = document.getElementById('brainNavToggle');
  if (brainNavToggle) brainNavToggle.addEventListener('click', function() { UI.toggleBrainNav(); });

  // --- Sidebar: Thread list (delegation) ---
  var threadList = document.querySelector('.thread-list');
  if (threadList) {
    threadList.addEventListener('click', function(e) {
      var item = e.target.closest('.thread-item');
      if (item) Chat.selectThread(item.dataset.threadId, item);
    });
  }

  // --- Sidebar: Workflow list (delegation) ---
  var wfSidebarList = document.querySelector('.workflow-sidebar-list');
  if (wfSidebarList) {
    wfSidebarList.addEventListener('click', function(e) {
      var item = e.target.closest('.wf-side-item');
      if (item) Workflows.showWorkflowDetail(item.dataset.wfId, item);
    });
  }

  // --- Sidebar: Active runs (delegation) ---
  var wfActiveRuns = document.getElementById('wfActiveRuns');
  if (wfActiveRuns) {
    wfActiveRuns.addEventListener('click', function(e) {
      var item = e.target.closest('.wf-active-run-item');
      if (item && item.dataset.threadId) {
        Workflows.navigateToThread(item.dataset.threadId);
      }
    });
  }

  // --- Brain nav (delegation) ---
  var brainNav = document.getElementById('brainNav');
  if (brainNav) {
    brainNav.addEventListener('click', function(e) {
      var btn = e.target.closest('.brain-nav-btn');
      if (btn) UI.switchBrainSection(btn.dataset.section, btn);
    });
  }

  // --- Top tabs ---
  var tabChat = document.getElementById('tabChat');
  var tabWorkflows = document.getElementById('tabWorkflows');
  if (tabChat) tabChat.addEventListener('click', function() { UI.switchMode('chat', tabChat); });
  if (tabWorkflows) tabWorkflows.addEventListener('click', function() { UI.switchMode('workflows', tabWorkflows); });

  // --- Header buttons ---
  var taskAlertBtn = document.getElementById('taskAlertBtn');
  var calendarBtn = document.getElementById('calendarBtn');
  var usageBtn = document.getElementById('usageBtn');
  var topProfile = document.querySelector('.top-profile');
  if (taskAlertBtn) taskAlertBtn.addEventListener('click', function() { UI.toggleTaskPanel(); });
  if (calendarBtn) calendarBtn.addEventListener('click', function() { UI.toggleCalendarPanel(); });
  if (usageBtn) usageBtn.addEventListener('click', function() { UI.toggleUsagePanel(); });
  if (topProfile) topProfile.addEventListener('click', function() { UI.toggleProfileMenu(); });

  // --- Profile menu (delegation) ---
  var profilePanel = document.getElementById('profilePanel');
  if (profilePanel) {
    profilePanel.addEventListener('click', function(e) {
      var themeToggle = e.target.closest('.profile-menu-theme');
      var signOut = e.target.closest('.profile-menu-signout');
      var actionEl = e.target.closest('[data-action]');

      // Menu item actions (appearance, account settings, back)
      if (actionEl) {
        var action = actionEl.getAttribute('data-action');
        if (action === 'appearance') { e.stopPropagation(); UI.showProfileSubpanel(); return; }
        if (action === 'profile-back') { e.stopPropagation(); UI.showProfileMain(); return; }
        if (action === 'account-settings') { e.stopPropagation(); showToast('Coming soon'); return; }
      }

      // Sign out
      if (signOut) { window.location.href = 'login.html'; return; }

      // Theme toggle (dark mode)
      if (themeToggle && themeToggle.querySelector('#themeToggleTrack')) {
        e.stopPropagation();
        A11y.toggleTheme();
        return;
      }

      // Dyslexia font toggle
      if (themeToggle && themeToggle.querySelector('#dyslexiaToggleTrack')) {
        e.stopPropagation();
        A11y.toggleDyslexiaFont();
        return;
      }

      // Reduced motion toggle
      if (themeToggle && themeToggle.querySelector('#motionToggleTrack')) {
        e.stopPropagation();
        A11y.toggleReducedMotion();
        return;
      }

      // High contrast toggle
      if (themeToggle && themeToggle.querySelector('#contrastToggleTrack')) {
        e.stopPropagation();
        A11y.toggleHighContrast();
        return;
      }

      // Icon labels toggle
      if (themeToggle && themeToggle.querySelector('#labelsToggleTrack')) {
        e.stopPropagation();
        A11y.toggleIconLabels();
        return;
      }

      // Contrast sections (stop propagation for sliders)
      if (e.target.closest('.profile-menu-contrast')) {
        e.stopPropagation();
        return;
      }
    });
  }

  // --- New button ---
  var newBtn = document.getElementById('newBtn');
  if (newBtn) newBtn.addEventListener('click', function() { UI.handleNew(); });

  // --- Chat header buttons ---
  var filesBtn = document.getElementById('filesBtn');
  var exportBtn = document.getElementById('exportBtn');
  var shareBtn = document.getElementById('shareBtn');
  if (filesBtn) filesBtn.addEventListener('click', function() { Chat.openFilePanel('folder'); });
  if (exportBtn) exportBtn.addEventListener('click', function() { Chat.exportThread(); });
  if (shareBtn) shareBtn.addEventListener('click', function() { Chat.shareThread(); });

  // --- File attachment link in chat body ---
  document.addEventListener('click', function(e) {
    var attachment = e.target.closest('.file-attachment');
    if (attachment) Chat.openFilePanel('viewer');
  });

  // --- Feedback buttons (delegation on chat area) ---
  document.addEventListener('click', function(e) {
    var fbBtn = e.target.closest('.feedback-btn');
    if (fbBtn) {
      var type = fbBtn.classList.contains('up') ? 'up' : 'down';
      Chat.giveFeedback(fbBtn, type);
    }
  });

  // --- Attach options (delegation) ---
  document.addEventListener('click', function(e) {
    var attachOpt = e.target.closest('.attach-option');
    if (attachOpt) {
      if (attachOpt.title === 'From computer') Chat.attachFromComputer(attachOpt);
      else if (attachOpt.title === 'From cloud drive') Chat.attachFromDrive(attachOpt);
    }
  });

  // --- File chip remove button (delegation) ---
  document.addEventListener('click', function(e) {
    var removeBtn = e.target.closest('.input-file-chip-remove');
    if (removeBtn) {
      var chip = removeBtn.closest('.input-file-chip');
      if (chip) {
        var strip = chip.closest('.input-file-strip');
        chip.remove();
        if (strip && !strip.querySelector('.input-file-chip')) strip.remove();
      }
    }
  });

  // --- Model selector/options (delegation) ---
  document.addEventListener('click', function(e) {
    var modelBtn = e.target.closest('.model-selector-btn');
    if (modelBtn) { Chat.toggleModelDropdown(modelBtn); return; }
    var modelOpt = e.target.closest('.model-option');
    if (modelOpt) { Chat.selectModel(modelOpt); }
  });

  // --- Empty thread suggestion chips (delegation) ---
  var suggestions = document.querySelector('.empty-thread-suggestions');
  if (suggestions) {
    suggestions.addEventListener('click', function(e) {
      var chip = e.target.closest('.empty-thread-chip');
      if (chip) Chat.fillSuggestion(chip.dataset.suggestion);
    });
  }

  // --- Error retry button ---
  var k1RetryBtn = document.getElementById('k1RetryBtn');
  if (k1RetryBtn) k1RetryBtn.addEventListener('click', function() { Chat.retryK1(); });

  // --- Erabor cancel: no dedicated stop button in standard input pattern ---
  // Cancel is handled by Chat.cancelErabor() if called programmatically

  // --- File panel ---
  var fpTabViewer = document.getElementById('fpTabViewer');
  var fpTabFolder = document.getElementById('fpTabFolder');
  var fpCloseBtn = document.getElementById('fpCloseBtn');
  if (fpTabViewer) fpTabViewer.addEventListener('click', function() { Chat.switchFilePanelTab('viewer'); });
  if (fpTabFolder) fpTabFolder.addEventListener('click', function() { Chat.switchFilePanelTab('folder'); });
  if (fpCloseBtn) fpCloseBtn.addEventListener('click', function() { Chat.closeFilePanel(); });

  // Workflow panel close button
  var wfPanelCloseBtn = document.getElementById('wfPanelCloseBtn');
  if (wfPanelCloseBtn) wfPanelCloseBtn.addEventListener('click', function() { Chat.closeWorkflowPanel(); });

  // File item click (open viewer)
  var fpFileItem = document.querySelector('.fp-file-item');
  if (fpFileItem) fpFileItem.addEventListener('click', function() { Chat.switchFilePanelTab('viewer'); });

  // --- Command autocomplete: input detection ---
  document.addEventListener('input', function(e) {
    var el = e.target;
    if (!el.classList.contains('text-input') || !el.isContentEditable) return;
    var text = el.textContent || '';
    if (text.charAt(0) === '/') {
      Chat.showCommandAutocomplete(el, text);
    } else {
      Chat.hideCommandAutocomplete();
    }
  });

  // --- Command autocomplete: keyboard navigation ---
  document.addEventListener('keydown', function(e) {
    if (!Chat._acOpen) return;
    var el = e.target;
    if (!el.classList.contains('text-input') || !el.isContentEditable) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      Chat._acNavigate(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      Chat._acNavigate(-1);
    } else if (e.key === 'Enter') {
      if (Chat._acIndex >= 0) {
        e.preventDefault();
        Chat._acConfirm();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      Chat.hideCommandAutocomplete();
    }
  });

  // --- Command autocomplete: click to select ---
  document.addEventListener('click', function(e) {
    var item = e.target.closest('.wf-command-autocomplete-item');
    if (item) {
      Chat.selectCommand(item.dataset.command, item.dataset.arg || null);
      return;
    }
    // Click outside: dismiss
    if (Chat._acOpen && !e.target.closest('.wf-command-autocomplete') && !e.target.closest('.text-input')) {
      Chat.hideCommandAutocomplete();
    }
  });

  // --- Flow graph node click (delegation) ---
  document.addEventListener('click', function(e) {
    // Close popover on click-outside
    if (Workflows._activePopover) {
      var isInsidePopover = e.target.closest('.node-popover');
      var isNode = e.target.closest('.flow-node');
      if (!isInsidePopover && !isNode) {
        Workflows.closeNodePopover();
        return;
      }
    }

    // Close popover button
    if (e.target.closest('.node-popover-close')) {
      Workflows.closeNodePopover();
      return;
    }

    // Edit with Cosimo button in popover
    if (e.target.closest('[data-action="popover-edit-cosimo"]')) {
      var popEl = e.target.closest('.node-popover');
      var pNodeId = popEl ? popEl.dataset.nodeId : null;
      var pTplId = popEl ? popEl.dataset.templateId : null;
      Workflows.closeNodePopover();
      Workflows.openCosimoForNode(pNodeId, pTplId);
      return;
    }

    // Node click -> select + open popover (full mode only)
    var node = e.target.closest('.flow-node');
    if (node && node.dataset.nodeId && node.dataset.templateId) {
      // Only open popover in full (non-compact) graph
      var svg = node.closest('.flow-graph-svg');
      if (svg && svg.classList.contains('flow-graph-compact')) return;

      Workflows.selectNode(node.dataset.nodeId, node.dataset.templateId);
      var rect = node.getBoundingClientRect();
      Workflows.openNodePopover(node.dataset.nodeId, node.dataset.templateId, rect);
    }
  });

  // --- Workflow listing cards (delegation) ---
  var wfListing = document.getElementById('wfListing');
  if (wfListing) {
    wfListing.addEventListener('click', function(e) {
      // Run button on card — navigate to chat run thread
      var runBtn = e.target.closest('[data-action="run-card"]');
      if (runBtn && runBtn.dataset.wfId) {
        e.stopPropagation();
        Workflows.navigateToRun(runBtn.dataset.wfId);
        return;
      }
      // Card click — show detail
      var card = e.target.closest('.wf-card');
      if (card && card.dataset.wfId) Workflows.showWorkflowDetail(card.dataset.wfId, card);
    });
  }

  // --- Workflow detail buttons ---
  var newWorkflowBtn = document.getElementById('newWorkflowBtn');
  var wfBackBtn = document.getElementById('wfBackBtn');
  var wfActionsBtn = document.getElementById('wfActionsBtn');
  var wfRunBtn = document.getElementById('wfRunBtn');
  if (newWorkflowBtn) newWorkflowBtn.addEventListener('click', function() { UI.handleNew(); });
  if (wfBackBtn) wfBackBtn.addEventListener('click', function() { Workflows.showWorkflowListing(); });
  if (wfActionsBtn) wfActionsBtn.addEventListener('click', function(e) { UI.toggleDropdown(e); });
  if (wfRunBtn) wfRunBtn.addEventListener('click', function() {
    if (Workflows._currentTemplateId) Workflows.navigateToRun(Workflows._currentTemplateId);
  });

  // --- Action dropdown (delegation) ---
  var actionDropdown = document.getElementById('actionDropdown');
  if (actionDropdown) {
    actionDropdown.addEventListener('click', function(e) {
      var item = e.target.closest('.dropdown-item');
      if (!item) return;
      var action = item.dataset.action;
      if (action === 'duplicate') alert('Duplicated');
      else if (action === 'edit-cosimo') Workflows.openCosimoForTemplate();
      else if (action === 'delete') alert('Deleted');
    });
  }

  // --- Workflow detail tabs (delegation) ---
  var tabBar = document.querySelector('.tab-bar');
  if (tabBar) {
    tabBar.addEventListener('click', function(e) {
      var btn = e.target.closest('.tab-btn');
      if (btn && btn.dataset.tab) Workflows.switchTab(btn.dataset.tab, btn);
    });
  }

  // --- Workflow detail run rows (delegation) ---
  var wfDetail = document.getElementById('wfDetail');
  if (wfDetail) {
    wfDetail.addEventListener('click', function(e) {
      var row = e.target.closest('[data-action="run-row-click"]');
      if (row && row.dataset.threadId) {
        Workflows.navigateToThread(row.dataset.threadId);
      }
    });
  }

  // --- Add source button ---
  var addSourceBtn = document.getElementById('addSourceBtn');
  if (addSourceBtn) addSourceBtn.addEventListener('click', function() { alert('Add source dialog would open here'); });

  // --- Brain Memory section ---
  var addMemoryBtn = document.getElementById('addMemoryBtn');
  var memCancelBtn = document.getElementById('memCancelBtn');
  var memSaveBtn = document.getElementById('memSaveBtn');
  var traitAddBtn = document.getElementById('traitAddBtn');
  if (addMemoryBtn) addMemoryBtn.addEventListener('click', function() { BrainMemory.toggleAddMemory(); });
  if (memCancelBtn) memCancelBtn.addEventListener('click', function() { BrainMemory.cancelAddMemory(); });
  if (memSaveBtn) memSaveBtn.addEventListener('click', function() { BrainMemory.submitNewMemory(); });
  if (traitAddBtn) traitAddBtn.addEventListener('click', function() { BrainMemory.addCustomTrait(); });

  // Memory category filters (delegation)
  var memCatFilters = document.getElementById('memCategoryFilters');
  if (memCatFilters) {
    memCatFilters.addEventListener('click', function(e) {
      var pill = e.target.closest('.mem-cat-pill');
      if (!pill) return;
      var categories = ['all', 'preference', 'workflow', 'contact', 'fund', 'style'];
      var idx = Array.from(memCatFilters.querySelectorAll('.mem-cat-pill')).indexOf(pill);
      if (idx >= 0 && idx < categories.length) BrainMemory.filterByCategory(categories[idx], pill);
    });
  }

  // Memory fact list (delegation for menu, edit, delete, confirm/cancel)
  var memFactList = document.getElementById('memFactList');
  if (memFactList) {
    memFactList.addEventListener('click', function(e) {
      var menuBtn = e.target.closest('.mem-fact-menu-btn');
      if (menuBtn) { BrainMemory.toggleFactMenu(menuBtn); return; }
      var editBtn = e.target.closest('.mem-fact-edit');
      if (editBtn) { BrainMemory.editFact(editBtn); return; }
      var deleteBtn = e.target.closest('.mem-fact-delete');
      if (deleteBtn) { BrainMemory.deleteFact(deleteBtn); return; }
      var yesBtn = e.target.closest('.mem-delete-yes');
      if (yesBtn) { BrainMemory.confirmDelete(yesBtn); return; }
      var noBtn = e.target.closest('.mem-delete-no');
      if (noBtn) { BrainMemory.cancelDelete(noBtn); return; }
      var entityChip = e.target.closest('.mem-entity-chip');
      if (entityChip) {
        var entityName = entityChip.getAttribute('data-entity-name');
        var graphBtn = document.querySelector('.brain-nav-btn[data-section="graphs"]');
        UI.switchBrainSection('graphs', graphBtn);
        Graph.selectByName(entityName);
        return;
      }
    });
  }

  // Trait selected (delegation for removeTrait)
  var traitSelected = document.getElementById('traitSelected');
  if (traitSelected) {
    traitSelected.addEventListener('click', function(e) {
      var tag = e.target.closest('.mem-trait-tag');
      if (tag) BrainMemory.removeTrait(tag);
    });
  }

  // Trait presets (delegation for toggleTrait)
  var traitPresets = document.getElementById('traitPresets');
  if (traitPresets) {
    traitPresets.addEventListener('click', function(e) {
      var tag = e.target.closest('.mem-trait-tag');
      if (tag) BrainMemory.toggleTrait(tag);
    });
  }

  // --- Brain Lessons section ---
  var newLessonBtn = document.getElementById('newLessonBtn');
  var lessonBackBtn = document.getElementById('lessonBackBtn');
  var lessonEditBtn = document.getElementById('lessonEditBtn');
  var lessonCosimoBtn = document.getElementById('lessonCosimoBtn');
  var lessonDeleteBtn = document.getElementById('lessonDeleteBtn');
  var lessonScopeToggle = document.getElementById('lessonScopeToggle');
  if (newLessonBtn) newLessonBtn.addEventListener('click', function() { BrainLessons.createNewLesson(); });
  if (lessonBackBtn) lessonBackBtn.addEventListener('click', function() { BrainLessons.closeLessonDetail(); });
  if (lessonEditBtn) lessonEditBtn.addEventListener('click', function() { BrainLessons.toggleLessonEdit(); });
  if (lessonCosimoBtn) lessonCosimoBtn.addEventListener('click', function() { BrainLessons.openCosimoForLesson(); });
  if (lessonDeleteBtn) lessonDeleteBtn.addEventListener('click', function() { BrainLessons.deleteLesson(); });
  if (lessonScopeToggle) lessonScopeToggle.addEventListener('click', function() { BrainLessons.toggleLessonScope(); });

  // Lesson scope filters (delegation)
  var lessonScopeFilters = document.getElementById('lessonScopeFilters');
  if (lessonScopeFilters) {
    lessonScopeFilters.addEventListener('click', function(e) {
      var pill = e.target.closest('.mem-cat-pill');
      if (!pill) return;
      var scopes = ['all', 'user', 'company'];
      var idx = Array.from(lessonScopeFilters.querySelectorAll('.mem-cat-pill')).indexOf(pill);
      if (idx >= 0 && idx < scopes.length) BrainLessons.filterLessonScope(scopes[idx], pill);
    });
  }

  // Lesson list (delegation for card clicks and scope toggle)
  var lessonList = document.getElementById('lessonList');
  if (lessonList) {
    lessonList.addEventListener('click', function(e) {
      var scopeBtn = e.target.closest('.lesson-card-scope-btn');
      if (scopeBtn) { BrainLessons.toggleCardScope(scopeBtn, e); return; }
      var card = e.target.closest('.lesson-card');
      if (card) BrainLessons.openLesson(card.dataset.lesson);
    });
  }

  // --- Brain Graphs section ---
  var graphEditBtn = document.getElementById('graphEditBtn');
  var graphCosimoBtn = document.getElementById('graphCosimoBtn');
  var graphCloseBtn = document.getElementById('graphCloseBtn');
  if (graphEditBtn) graphEditBtn.addEventListener('click', function() { Graph.editGraphEntity(); });
  if (graphCosimoBtn) graphCosimoBtn.addEventListener('click', function() { Graph.openCosimoForEntity(); });
  if (graphCloseBtn) graphCloseBtn.addEventListener('click', function() { Graph.closeGraphDetail(); });

  // Graph breadcrumbs (delegation)
  var graphBreadcrumb = document.querySelector('.graph-breadcrumb');
  if (graphBreadcrumb) {
    graphBreadcrumb.addEventListener('click', function(e) {
      var crumb = e.target.closest('.graph-crumb');
      if (crumb && crumb.dataset.nav) Graph.graphNavigate(crumb.dataset.nav);
    });
  }

  // Graph related pills (delegation)
  var graphDetailBody = document.getElementById('graphDetailBody');
  if (graphDetailBody) {
    graphDetailBody.addEventListener('click', function(e) {
      var pill = e.target.closest('.graph-related-pill');
      if (pill) Graph.navigateToRelated(pill.dataset.entityId, pill.dataset.entityCat);
    });
  }

  // --- Search results (delegation) ---
  var searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.addEventListener('click', function(e) {
      var item = e.target.closest('.search-result-item');
      if (item && item.dataset.threadId) {
        Chat.selectThread(item.dataset.threadId, null);
        Chat.closeSearch();
      }
    });
  }

  // --- Cosimo panel ---
  var panelOverlay = document.getElementById('panelOverlay');
  var cosimoPanelClose = document.getElementById('cosimoPanelClose');
  var cosimoPanelSend = document.getElementById('cosimoPanelSend');
  if (panelOverlay) panelOverlay.addEventListener('click', function() { UI.closeCosimoPanel(); });
  if (cosimoPanelClose) cosimoPanelClose.addEventListener('click', function() { UI.closeCosimoPanel(); });
  if (cosimoPanelSend) cosimoPanelSend.addEventListener('click', function() { UI.sendPanelMessage(); });

  // --- Input handlers (replaces inline oninput/onkeydown) ---
  var sidebarSearch = document.querySelector('.sidebar-search-input');
  if (sidebarSearch) sidebarSearch.addEventListener('input', function() { Chat.runGlobalSearch(this.value); });

  var purpleSlider = document.getElementById('purpleIntensitySlider');
  if (purpleSlider) purpleSlider.addEventListener('input', function() { A11y.applyPurpleIntensity(this.value); });

  var fontSizeSlider = document.getElementById('fontSizeSlider');
  if (fontSizeSlider) fontSizeSlider.addEventListener('input', function() { A11y.applyFontSizeBoost(this.value); });

  var memSearchInput = document.getElementById('memSearchInput');
  if (memSearchInput) memSearchInput.addEventListener('input', function() { BrainMemory.filterMemories(); });

  var lessonSearchInput = document.getElementById('lessonSearchInput');
  if (lessonSearchInput) lessonSearchInput.addEventListener('input', function() { BrainLessons.filterLessons(); });

  var traitInput = document.getElementById('traitInput');
  if (traitInput) traitInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { BrainMemory.addCustomTrait(); e.preventDefault(); } });

  var memAddInput = document.getElementById('memAddInput');
  if (memAddInput) memAddInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { BrainMemory.submitNewMemory(); e.preventDefault(); } });

  var panelInput = document.getElementById('panelInput');
  if (panelInput) panelInput.addEventListener('keydown', function(e) { UI.handlePanelKey(e); });

  // --- Global Escape key handler with priority chain ---
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;

    // Priority 1: Node popover (most specific overlay)
    if (Workflows._activePopover) {
      e.preventDefault();
      Workflows.closeNodePopover();
      return;
    }

    // Priority 2: Command autocomplete dropdown
    if (Chat._acOpen) {
      // Already handled by the autocomplete-specific keydown listener
      return;
    }

    // Priority 3: Cosimo panel
    var cosimoPanel = document.getElementById('cosimoPanel');
    if (cosimoPanel && cosimoPanel.classList.contains('open')) {
      e.preventDefault();
      UI.closeCosimoPanel();
      return;
    }

    // Priority 4: Workflow context panel
    var wfPanel = document.getElementById('workflowPanel');
    if (wfPanel && wfPanel.classList.contains('open')) {
      e.preventDefault();
      Chat.closeWorkflowPanel();
      return;
    }
  });

})();

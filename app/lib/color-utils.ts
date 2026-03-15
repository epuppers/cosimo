// ============================================
// COLOR UTILITIES
// Ported from ColorUtils namespace in js/app.js
// Used by the purple intensity slider and theme system
// ============================================

/**
 * Converts a hex color string (e.g. "#7c5cbf") to an HSL array [h, s, l].
 * H is in degrees (0-360), S and L are percentages (0-100).
 */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Converts HSL values to a hex color string.
 * @param h - Hue in degrees (0-360)
 * @param s - Saturation percentage (0-100)
 * @param l - Lightness percentage (0-100)
 */
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Converts a hex color to an "r,g,b" string for use in rgba() CSS functions.
 */
export function hexToRgbString(hex: string): string {
  return (
    parseInt(hex.slice(1, 3), 16) +
    ',' +
    parseInt(hex.slice(3, 5), 16) +
    ',' +
    parseInt(hex.slice(5, 7), 16)
  );
}

/**
 * Adjusts purple/violet/berry color token saturation based on a slider value.
 * Returns a map of CSS property names to their adjusted hex values,
 * plus any RGB companion values.
 *
 * @param baseColors - Map of CSS custom property names to their base hex values
 * @param intensity - Intensity percentage (0-100)
 * @param rgbCompanions - Map of CSS property names to their RGB companion property names
 * @returns Map of CSS property names to adjusted color values (hex or RGB string)
 */
export function adjustPurpleIntensity(
  baseColors: Record<string, string>,
  intensity: number,
  rgbCompanions: Record<string, string> = {}
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const prop of Object.keys(baseColors)) {
    const hsl = hexToHsl(baseColors[prop]);
    const newSat = Math.min(100, hsl[1] * (intensity / 100));
    const newHex = hslToHex(hsl[0], newSat, hsl[2]);
    result[prop] = newHex;

    if (rgbCompanions[prop]) {
      result[rgbCompanions[prop]] = hexToRgbString(newHex);
    }
  }

  return result;
}

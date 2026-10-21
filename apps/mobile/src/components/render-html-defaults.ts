import { defaultFallbackFonts, type RenderHTMLProps } from 'react-native-render-html';

// React 19 ignores the renderer defaultProps; inline colours can clash with the active theme.
export const RENDER_HTML_DEFAULTS = {
  enableCSSInlineProcessing: true,
  enableUserAgentStyles: true,
  fallbackFonts: defaultFallbackFonts,
  ignoredStyles: ['color', 'backgroundColor'],
} satisfies Partial<RenderHTMLProps>;

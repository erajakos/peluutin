import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

/**
 * App icons, generated from one source: `npm run generate-pwa-assets`.
 *
 * The round crest keeps transparent corners for the regular icons. Maskable and
 * Apple icons get padding and the pitch green behind them, because those
 * platforms crop the icon into their own shape and must not cut into the ball.
 */
const PITCH_GREEN = '#0F3324'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      padding: 0.28,
      resizeOptions: { background: PITCH_GREEN },
    },
    apple: {
      ...preset.apple,
      padding: 0.18,
      resizeOptions: { background: PITCH_GREEN },
    },
  },
  images: ['public/icon.svg'],
})

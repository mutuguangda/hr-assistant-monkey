import { defineConfig, presetAttributify, presetUno, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify({ /* preset options */}),
    presetUno(),
    presetIcons()
  ],
  transformers: [
    transformerDirectives()
  ]
})
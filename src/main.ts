import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css'

console.log('main.ts init')

setTimeout(() => {
  createApp(App).mount(
    (() => {
      const app = createElement('div', {
        width: '300px',
        position: 'relative',
        overflow: 'hidden',
        // padding: '10px',
      })
      const frame = document.querySelector('div.alive-frame-wrap.visible') as HTMLElement
      const content = document.querySelector('#recommendContent') as HTMLElement
      setStyle(frame, { display: 'flex' })
      setStyle(content, { width: 'calc(100% - 300px)' })
      frame.append(app)
      return app;
    })(),
  );
}, 5000)

function setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  Object.keys(style).forEach(key => {
    (element.style as Record<string, any>)[key] = (style as Record<string, any>)[key]
  })
}

function createElement(tagName: string, style: Partial<CSSStyleDeclaration> | undefined = undefined) {
  const element = document.createElement(tagName)
  if (style) setStyle(element, style)
  return element
}

import { GM_getValue } from "$"
import { ref } from "vue"

export const useChat = () => {
  const content = ref<string>('')

  // const apiKey = 'sk-Y58iJCcl1FQl02uAa T1YT3BlbkFJ2f6ZyQBj1cPMKxBDSzaf'
  const apiKey = GM_getValue('apiKey')
  const messages = ref<any[]>([])

  function generatePayload(messages: any[]) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.6,
        stream: true,
      })
    }
  }

  async function send(message: string) {
    messages.value.push({ role: 'user', content: message })
    const initOptions = generatePayload(messages.value)
    await fetch('https://api.openai.com/v1/chat/completions', initOptions).then(response => {
      messages.value.push({ role: 'assistant', content: '' })
      content.value = ''

      const reader = response.body?.getReader()
      let isClose = false

      return new ReadableStream({
        start(controller) {
          updateContent()

          function updateContent() {
            const decoder = new TextDecoder()
            reader?.read().then(({ done, value }) => {
              // if (done) {
              //   controller.close()
              //   return
              // }
              const text = decoder.decode(value)
              // console.log('text',text)
              const match = text.match(/data: (.*)/g)
              match?.forEach((item) => {
                const data = /data: (.*)/.exec(item)?.[1]
                if (data === '[DONE]') {
                  // messages.value.push({ role: 'assistant', content: content.value })
                  isClose = true
                  controller.close()
                  return
                }
                const json = JSON.parse(data || '{}')
                messages.value[messages.value.length - 1].content += json.choices[0].delta?.content || ''
                content.value += json.choices[0].delta?.content || ''
              })
              if (isClose) return
              updateContent()
            })
          }
        }
      })
    })
  }

  return { content, send, messages }
}

<!--
 * @Author: duqing
 * @Description: 
-->
<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useChat } from './openai';

const message = ref('')
const mutuguangda = ref('一键打招呼 by mutuguangda')

const greetParams = reactive({
  num: 20,
  keywords: ''
})
const greetRecord = ref<any[]>([])
const greetRecordWrapper = ref<HTMLElement>()
watch(greetRecord, () => {
  greetRecordWrapper.value?.scrollTo({ top: greetRecordWrapper.value.offsetHeight })
})
const greetPerson = ref<any[]>([])

const { content, send, messages } = useChat()

const isGreet = ref(false)

const activeIndex = ref(1)

function sendMessage() {
  // console.log('record',record)
  send(message.value)
  message.value = ''
}

async function greet() {
  let currentGreetNum = 0
  let prevListLength = 0
  isGreet.value = true
  greetRecord.value.push('开始打招呼')
  while (isGreet.value) {
    const recommentList = document.querySelector('iframe')?.contentDocument?.querySelectorAll('#recommend-list ul li')
    if (!recommentList) {
      // TODO: undefined
      return
    }
    // const recommentList = Array.prototype.slice.call(nodeList, prevListLength)
    // console.log('recommentList', recommentList)
    // console.log('prevListLength', prevListLength)
    for (let i = prevListLength; i < recommentList.length && isGreet.value; i++) {
      const curr = recommentList[i]

      scroll((curr as HTMLElement).offsetTop)

      // return
      const html = curr.innerHTML
      let keywords = greetParams.keywords.split('、')
      keywords = keywords.filter(keyword => {
        return html.indexOf(keyword) !== -1
      })
      if (keywords.length !== 0) {
        const button = (curr as HTMLElement).querySelector('button.btn.btn-greet:not(.overdue-tip)') as HTMLElement
        // console.log('button', button)
        if (!button) continue
        // TODO: 在打招呼之前再做一个判断
        if (!isGreet.value) {
          greetRecord.value.push('打招呼已结束 💕')
          greetRecord.value.push(greetPerson.value)
          return
        }
        // console.log(`greet to ${i}`)
        const nameWrapper = curr.querySelector('.name')
        const name = nameWrapper?.innerHTML
        greetRecord.value.push(`${name}符合${keywords.join('、')}${keywords.length > 1 ? '等' : ''}关键字，正在打招呼 🙏 中...`)
        setStyle((curr as HTMLElement), {
          border: '2px solid #00bebd',
          borderRadius: '8px'
        })
        // TODO: 打招呼
        try {
          button.click()
          await sleep(0.5 * i)
          const dialog = document.querySelector('div.dialog-wrap.active[data-type="boss-dialog"]')
          if (dialog) {
            greetRecord.value.push('招呼数已达上限！')
            greetRecord.value.push('打招呼已结束 💕')
            greetRecord.value.push(greetPerson.value)
            return
          }
        } catch (error) {
          greetRecord.value.push('我只是一个熊熊，什么都不知道，也许这是一个 BUG 🐛？')
          return
        }

        const resumeWrapper = curr.querySelector('div > div')
        console.log('resumeWrapper', resumeWrapper)
        greetPerson.value.push({ keywords, element: curr, name, event: (resumeWrapper as HTMLElement).click, index: i, resumeWrapper })
        // await sleep(i)
        currentGreetNum++
        // console.log('currentGreetNum',currentGreetNum)
        if (currentGreetNum >= greetParams.num) {
          console.log('打招呼结束')
          isGreet.value = false
          greetRecord.value.push('打招呼已结束 💕')
          greetRecord.value.push(greetPerson.value)
          return
        }
      }
    }
    prevListLength = recommentList.length
    // scroll()
    // TODO: 在休眠前再判断
    if (!isGreet.value) {
      greetRecord.value.push('打招呼已结束 💕')
      greetRecord.value.push(greetPerson.value)
      return
    }
    // greetRecord.value.push('休眠5s...')
    // await sleep(5)
  }
}

function scroll(top: number) {
  const html = document.querySelector('iframe')?.contentDocument?.querySelector('html')
  html?.scrollTo({ top, left: 0, behavior: 'smooth' })
}

function sleep(t: number, fn: ((...args: any[]) => any) | undefined = undefined): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      fn && fn()
      resolve()
    }, t * 1000)
  })
}

function setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  Object.keys(style).forEach(key => {
    element.style[key] = style[key]
  })
}

function openResume(index: number) {
  const recommentList = document.querySelector('iframe')?.contentDocument?.querySelectorAll('#recommend-list ul li > div > div')
  // console.log('recommentList',recommentList)
  if (!recommentList) {
    greetRecord.value.push('我只是一个熊熊，什么都不知道，也许这是一个 BUG 🐛？')
    return
  }
  (recommentList[index] as HTMLElement).click()
}
</script>

<template>
  <div class="mtgd">
    <div class="nav px-10px">
      <div class="nav-wrapper">
        <div class="nav-item" @click="activeIndex = 0" :class="{ 'text-[#ffffff]': activeIndex === 0 }"><span
            class="text-16px">🤖</span>Chatgpt</div>
        <div class="nav-item" @click="activeIndex = 1" :class="{ 'text-[#ffffff]': activeIndex === 1 }"><span
            class="text-16px">🐻</span>打招呼</div>
        <div class="slider" :style="{ 'transform': `translateX(${activeIndex === 0 ? '0' : '100%'})` }"></div>
      </div>
    </div>
    <!-- 后续换成机器人 -->

    <!-- index === 0 -->
    <div v-show="activeIndex === 0">
      <div class="message-container h-[calc(100vh-180px)] overflow-auto p-10px">
        <div v-for="message in messages" class="shadow rounded-8px overflow-hidden mb-10px px-7px py-4px">
          <div>
            <span class="text-20px leading-24px select-none">{{ message.role === 'user' ? '😀' : '🤖' }}</span>
            <span class="font-bold select-none">: </span>
            <span class="text-14px leading-24px">{{ message.content }}</span>
          </div>
        </div>
      </div>
      <div class="absolute left-0 bottom-0 box-border">
        <div class="flex items-center gap-8px px-10px pb-10px">
          <!-- Q: input 设置 flex: 1 不能自由伸缩 -->
          <input v-model="message" class="focus:border-[#00bebd]" w="100%" px="8px" py="3px" rounded="4px"
            text="[#999999]" border="1px [#eeeeee]" @keyup.enter="sendMessage" />
          <button class="mtgd-btn" @click="sendMessage">
            Send
          </button>
          <button class="mtgd-btn">
            Clear
          </button>
          <!-- <button class="mtgd-btn" @click="turnPage">翻页</button> -->
          <!-- @mouseleave.native="mutuguangda = '一键打招呼'" @mouseover.native="mutuguangda = '一键打招呼 by mutuguangda'"  -->
        </div>

      </div>
    </div>

    <!-- index === 1 -->
    <div v-show="activeIndex === 1">
      <div class="record-container h-[calc(100vh-180px)] overflow-auto p-10px" ref="greetRecordWrapper">
        <div v-if="greetRecord.length === 0" class="flex flex-col justify-center items-start gap-10px h-full">
          <div class="text-32px mx-auto mb-10px">
            🐻
          </div>
          <div class="mtgd-btn cursor-default mx-auto" @mouseleave.native="mutuguangda = '一键打招呼'"
            @mouseover.native="mutuguangda = '一键打招呼 by mutuguangda'">{{ mutuguangda }}</div>
          <div class="mx-auto">✨ 使用步骤如下：</div>
          <div class="px-20px">1. 左输入框设置需要本熊打的招呼数，默认是20</div>
          <div class="px-20px">2. 右输入框可以设置关键词，如需设置多个关键词请用、分隔</div>
          <div class="px-20px">3. 点击 Greet，熊熊将为你做牛做马（指打招呼 🙈）！</div>
        </div>
        <div v-else v-for="message in greetRecord" class="shadow rounded-8px overflow-hidden mb-10px px-7px py-4px">
          <div>
            <span class="text-20px leading-24px select-none">🐻</span>
            <span class="font-bold select-none">: </span>
            <span class="text-14px leading-24px" v-if="typeof message === 'string'">{{ message }}</span>
            <span v-if="typeof message !== 'string'">总计打了{{ greetPerson.length }}个招呼，以下是人选记录：{{ greetPerson.length ? '': '无' }}</span>
            <div v-if="typeof message !== 'string'" v-for="person in message" class="flex items-center gap-4px">
              <span>{{ person.name }}</span>
              <span>{{ person.keywords.join('、') }}</span>
              <!-- {{ person.index }} -->
              <!-- <span @click="openResume(person.index)" class="text-[#00A6A7] cursor-pointer">点击查看简历信息</span> -->
              <span @click="person.resumeWrapper.click()" class="text-[#00A6A7] cursor-pointer">点击查看简历信息</span>
              <!-- Q: 不能传 dom 的 click 事件 -->
              <!-- <span @click="person.event" class="text-[#00A6A7] cursor-pointer">点击查看简历信息</span> -->
            </div>
          </div>
        </div>
      </div>
      <div class="absolute left-0 bottom-0 box-border">
        <div v-show="isGreet" class="px-10px mb-10px">
          <button class="mtgd-btn" @click="isGreet = false">Stop</button>
        </div>
        <div class="flex items-center gap-8px px-10px pb-10px">
          <input v-model="greetParams.num" type="text" class="focus:border-[#00bebd]" w="3em" px="8px" py="3px"
            rounded="4px" text="[#999999]" border="1px [#eeeeee]" />
          <input v-model="greetParams.keywords" type="text" class="focus:border-[#00bebd]" w="100%" px="8px" py="3px"
            rounded="4px" text="[#999999]" border="1px [#eeeeee]" placeholder="请输入关键词" @keyup.enter="greet" />
          <button class="mtgd-btn" @click="greet">Greet</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.mtgd-btn {
  @apply cursor-pointer rounded-4px px-10px py-5px flex items-center border-none bg-[#F2F4F7] whitespace-nowrap hover:(text-[#00A6A7] bg-[#E5FAF8]);
}

.record-container div:last-child {
  margin: 0;
}

.chat-global-entry {
  left: -356px;
}

.mtgd .slider {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 50%;
  border-radius: 8px;
  background-color: #00A6A7;
  z-index: 10;
  transition: transform .2s ease-in;
}

.mtgd .nav-item {
  @apply w-[50%] py-4px z-50 cursor-pointer flex justify-center items-center gap-10px;
}

.mtgd .nav-wrapper {
  @apply flex overflow-hidden rounded-8px relative;
  border: 1px dashed #ccc;
}
</style>
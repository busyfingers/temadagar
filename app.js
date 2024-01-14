import { writeFile } from 'node:fs/promises'
import { parse } from 'node-html-parser'
import * as ics from 'ics'

const year = new Date().getFullYear()
const months = {
  januari: 1,
  februari: 2,
  mars: 3,
  april: 4,
  maj: 5,
  juni: 6,
  juli: 7,
  augusti: 8,
  september: 9,
  oktober: 10,
  november: 11,
  december: 12,
}

function getDayAndMonth(text) {
  const [dayText, monthText] = text.split(' ')

  return [Number(dayText), months[monthText]]
}

function getNextDay(year, month, day) {
  const dt = new Date([year, month, day])
  const nextDt = new Date(dt)
  nextDt.setDate(dt.getDate() + 1)

  return [year, nextDt.getMonth() + 1, nextDt.getDate()]
}

async function run() {
  const domText = await (await fetch('https://år.nu/temadagar')).text()
  const dom = parse(domText)
  const events = []

  dom
    .querySelector('.arnu-text')
    ?.querySelectorAll('p')
    ?.forEach((pElem) => {
      const aTag = pElem?.querySelector('a')
      const strongTag = pElem?.querySelector('strong')
      if (!aTag || !strongTag) return

      const [day, month] = getDayAndMonth(aTag.innerText)
      if (!day || !month) {
        console.log(`Unable to parse: ${aTag.innerText}`)
      }

      const textParts = strongTag.innerText.split(', ')

      events.push({
        title: textParts[0],
        description: textParts.slice(1).join(', '),
        start: [year, month, day],
        end: getNextDay(year, month, day),
      })
    })

  ics.createEvents(events, async (error, data) => {
    if (error) {
      console.log(error)
      return
    }

    await writeFile(`Temadagar_${year}.ics`, data)
  })
}

run()

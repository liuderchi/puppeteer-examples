// notify me when those package download count reaches milestone

const puppeteer = require('puppeteer')


// const URL = 'https://atom.io/packages/ide-html'
const URLS = [
  'https://atom.io/packages/ide-html',
  'https://atom.io/packages/ide-css',
  'https://atom.io/packages/ide-yaml'
]

const getDownloadCount = () => {
  // run js script after page loaded
  const CSS_SELECTOR = 'span[aria-label~="downloads"] > .value'
  const content = document.querySelectorAll(CSS_SELECTOR)[0].textContent
  return (typeof content === 'string') ? parseInt(content.replace(",", "")) : "N/A"
}

const puppeteerTaskFactory = (url, script) => async () => {
   const browser = await puppeteer.launch()
   const page = await browser.newPage()

   console.log(`fetching from ${url} ...`)

   await page.goto(url, { waitUntil: 'networkidle2' })
   const downloadCount = await page.evaluate(script)

   console.log('downloadCount:', downloadCount)

   if (downloadCount % 1000 < 100) {
     const milestone = Math.floor(downloadCount/1000) * 1000
     console.log(`Congrats! download count reaches ${milestone}. Making a snapshot...`)

     const screenSize = { height: 400, width: 1000 }
     await page.setViewport({ ...screenSize })
     await page.screenshot({
       path: `${url.split("/").pop()}-${milestone}.png`,
       ...screenSize,
     })
   }
   await browser.close()

   return await url  // return Promise.resolve(nextUrl)
}

URLS.reduce(
  (_, nextUrl) => _.then(puppeteerTaskFactory(nextUrl, getDownloadCount)),
  Promise.resolve('foo')
)

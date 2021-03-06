/**
 * @author ebidel@ (Eric Bidelman)
 * License Apache-2.0
 */

 /**
  * Hash (#) changes aren't considered navigations in Chrome. This makes it
  * tricky to test aSPA that use hashes to change views.
  *
  * This script shows how to observe the view of a SPA changing in Puppeteer
  * by injecting code into the page that listens for `hashchange` events.
  *
  * To run:
  * 1. Start a web server in this folder on port 5000.
  * 2. node hash_navigation.js
  */

const {URL} = require('url');
const puppeteer = require('puppeteer');

const url = 'http://localhost:5000/html/spa.html';

async function printVisibleView(page) {
  console.log('Visible panel:', await page.$eval(':target', el => el.textContent));
}

async function main() {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  // Catch + "forward" hashchange events from page to node puppeteer.
  await page.exposeFunction('onHashChange', url => page.emit('hashchange', url));
  await page.evaluateOnNewDocument(() => {
    addEventListener('hashchange', e => onHashChange(location.href));
  });

  // Listen for hashchange events in node Puppeteer code.
  page.on('hashchange', url => console.log('hashchange event:', new URL(url).hash));

  await page.goto(url);
  await page.waitForSelector('[data-page="#page1"]'); // wait for view 1 to be "loaded".
  await printVisibleView(page);

  try {
    // "Navigate" to view 2 in SPA. We don't want to wait for the `load` event,
    // so set a small timeout and catch the "navigation timeout".
    await page.goto(`${url}#page2`, {timeout: 1});
  } catch (err) {
    // noop
  }

  await page.waitForSelector('[data-page="#page2"]'); // wait for view 2 to be "loaded".
  await printVisibleView(page);

  await browser.close();
}

main();
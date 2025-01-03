#! /usr/bin/env node

const puppeteer = require("puppeteer");
const CONTENT_SELECTOR = "#page-content > div";
const TITLE_SELECTOR = "#activity-name";

const logProcess = (percent) => {
  const completed = Math.min(Math.floor(percent * 40), 40);
  process.stdout.write("\r\x1b[K");
  process.stdout.write(
    `\uD83D\uDEA7[${Array(completed).fill("=").join("")}${Array(40 - completed)
      .fill("-")
      .join("")}]`
  );
};

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const STEP = 200;
      const TIME_INTERVAL = 200;

      let totalHeight = 0;

      const timer = setInterval(() => {
        const totalDistance = document.body.scrollHeight - window.innerHeight;

        window.scrollBy(0, STEP);
        totalHeight += STEP;

        console.log("progress", totalHeight / totalDistance);

        if (totalHeight >= totalDistance) {
          clearInterval(timer);
          resolve();
        }
      }, TIME_INTERVAL);
    });
  });
};

(async () => {
  const browser = await puppeteer.launch();

  console.log("\uD83D\uDCAA Started...");

  const page = await browser.newPage();
  await page.goto(process.argv[2]);

  page.on("console", (consoleObj) => {
    const content = consoleObj.text();
    if (content.startsWith("progress")) {
      logProcess(Number(consoleObj.text().split("progress ")[1]));
    }
  });

  await autoScroll(page);

  await page.waitForSelector(CONTENT_SELECTOR);

  const titleEle = await page.$(TITLE_SELECTOR);
  const title = (
    await page.evaluate((el) => el.textContent, titleEle)
  ).replaceAll(/\s/g, "");

  console.log(`\n\u26FD Start to download ${title}...`);

  const element = await page.$(CONTENT_SELECTOR);
  await element.evaluate((el) => (el.style.padding = "16px"));

  const filePath = `${process.cwd()}/${title}.png`;

  await element.screenshot({ path: filePath });

  console.log(`\uD83C\uDF7B Saved at: ${filePath}`);
  await browser.close();
})();

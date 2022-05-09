const puppeteer = require("puppeteer");
const SELECTOR = "#page-content > div";

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

  console.log("\uD83D\uDCAAStarted!");

  const page = await browser.newPage();
  await page.goto(process.argv[2]);

  page.on("console", (consoleObj) => {
    const content = consoleObj.text();
    if (content.startsWith("progress")) {
      logProcess(Number(consoleObj.text().split("progress ")[1]));
    }
  });

  console.log("\u26FDStart to generate!");

  await autoScroll(page);

  await page.waitForSelector(SELECTOR);

  const element = await page.$(SELECTOR);
  await element.evaluate((el) => (el.style.padding = "16px"));

  const filePath = `${await page.title()}.png`;

  await element.screenshot({ path: `output/${await page.title()}.png` });

  console.log(`\n\uD83C\uDF7B${filePath} generated!`);
  await browser.close();
})();

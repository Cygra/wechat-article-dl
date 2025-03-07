import puppeteer, { Page } from "puppeteer";

const CONTENT_SELECTOR = "#page-content > div";
const TITLE_SELECTOR = "#activity-name";
const ACCOUNT_TITLE_SELECTOR = "#js_name";

const logProcess = (percent: number) => {
  const completed = Math.min(Math.floor(percent * 40), 40);
  process.stdout.write("\r\x1b[K");
  process.stdout.write(
    `\uD83D\uDEA7 [${Array(completed).fill("=").join("")}${Array(40 - completed)
      .fill("-")
      .join("")}]`
  );
};

const autoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
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

export const getImage = async (link: string, width: number) => {
  const browser = await puppeteer.launch();

  console.log("\uD83D\uDCAA 下载开始...");

  const page = await browser.newPage();
  await page.setViewport({
    width,
    height: 100,
    deviceScaleFactor: 1,
  });
  await page.goto(link);

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
    await page.evaluate((el: any) => el.textContent, titleEle)
  ).replaceAll(/\s/g, "");

  const accountTitleEle = await page.$(ACCOUNT_TITLE_SELECTOR);
  const accountTitle = (
    await page.evaluate((el: any) => el.textContent, accountTitleEle)
  ).replaceAll(/\s/g, "");

  console.log(`\n\u26FD 开始解析 ${title}...`);

  const element = await page.$(CONTENT_SELECTOR);
  await element?.evaluate((el: any) => (el.style.padding = "16px"));

  const uint8Array = await element?.screenshot({
    type: "jpeg",
  });

  return { uint8Array, accountTitle, title };
};

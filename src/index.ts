#! /usr/bin/env node

import puppeteer, { Page } from "puppeteer";
import prompts from "prompts";
// import piexif from "piexifjs";
// import { promises as fs } from "fs";

const CONTENT_SELECTOR = "#page-content > div";
const TITLE_SELECTOR = "#activity-name";
const ACCOUNT_TITLE_SELECTOR = "#js_name";

const questions: Array<prompts.PromptObject<string>> = [
  {
    type: "text",
    name: "link",
    message: "请输入微信公众号文章链接",
    validate: (value) => {
      if (!value) {
        return "请输入链接";
      }
      if (!value.startsWith("https://mp.weixin.qq.com/s/")) {
        return "请输入有效的微信公众号文章链接";
      }

      return true;
    },
  },
  {
    type: "select",
    name: "width",
    message: "选择窗口尺寸",
    choices: [
      { title: "窄", description: "适合手机浏览", value: "430" },
      { title: "宽", description: "适合电脑浏览", value: "1600" },
    ],
    initial: 0,
  },
];

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

(async () => {
  const { link, width } = await prompts(questions);

  const browser = await puppeteer.launch();

  console.log("\uD83D\uDCAA 下载开始...");

  const page = await browser.newPage();
  await page.setViewport({
    width: Number(width),
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

  const filePath = `${process.cwd()}/${accountTitle}-${title}.jpeg`;

  await element?.screenshot({
    path: filePath,
    type: "jpeg",
  });

  // var exifObj = {
  //   Exif: {
  //     37510: link,
  //   },
  // };

  // const screenshot = await fs.readFile(filePath);

  // var exifStr = piexif.dump(exifObj);
  // const screenshotWithExif = piexif.insert(
  //   exifStr,
  //   "data:image/jpeg;base64," + screenshot.toString("base64")
  // );
  // await fs.writeFile(filePath, screenshotWithExif);

  console.log(`\uD83C\uDF7B 截图保存至：${filePath}`);
  await browser.close();
})();

# wechat article downloader

微信公众号文章下载，好文章保存到本地才是最靠谱的。

![mark](./img/mark.png)

基于 [Puppeteer](https://github.com/puppeteer/puppeteer)。

## 安装

```bash
# 安装依赖
npm install -g wechat-article-dl

# 执行 `wx-dl [公众号文章链接]`
wx-dl https://mp.weixin.qq.com/s/AnCv3WLmMGJPn5MAjqwC6g
```

执行完成后，会生成 `[root]/[文章名].png`。

![example](./img/example.png)

## TODO

- [ ] telegram 机器人
- [ ] serverless
- [ ] 处理文章中的视频

# wechat article downloader

微信公众号文章下载，好文章保存到本地才是最靠谱的。

![mark](./img/mark.png)

## 使用

```bash
# 安装依赖
npm install -g wechat-article-dl

# 执行 `wx-dl`
wx-dl
```

会唤起系统默认浏览器并打开 `http://localhost:3000`，在页面上直接操作即可。

执行完成后，生成的截图会出现在页面右侧。

![example](./img/example.png)

## 开发

```sh
# 开发
npm run start

# 构建
npm run build
```

## TODO

- [ ] telegram 机器人
- [ ] serverless
- [ ] 处理文章中的视频

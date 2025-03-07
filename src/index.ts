#! /usr/bin/env node

import express from "express";
import cors from "cors";
import { getImage } from "./utils";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  const { link, width } = req.body;

  const { uint8Array, accountTitle, title } = await getImage(link, width);

  const base64 = Buffer.from(uint8Array!).toString("base64");

  res.json({
    image: `data:image/jpeg;base64,${base64}`,
    accountTitle,
    title,
    link,
    width,
  });
});

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  import("open").then((open) => {
    open.default(`http://localhost:${PORT}`);
  });
});

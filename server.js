const fs = require("fs");
const { join } = require("path");
const express = require("express");
const https = require("https");
const logger = require("morgan");

const key = fs.readFileSync("./cert/CA/localhost/localhost.decrypted.key");
const cert = fs.readFileSync("./cert/CA/localhost/localhost.crt");
const port = 3000;

const app = express();

app.use(logger(":method :url :status :res[content-length] - :response-time ms"));

app.use(express.static(join(__dirname, "public")));

app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const server = https.createServer({ key, cert }, app);

server.listen(port, () => {
  console.log(`Server is listening on https://localhost:${port}`);
});


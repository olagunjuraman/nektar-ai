import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = `${__dirname}/${"example.txt"}`;

function parseQuery(paramString) {
  const params = paramString.split('&');
  const paramObj = {};
  params.forEach((param) => {
    paramObj[param.split('=')[0]] = param.split('=')[1]
  })
  return paramObj;
}

const server = http.createServer(function (req, res) {
  const requestURL = req.url;
  const endpoint = requestURL.split('?')[0];
  if (endpoint === "/get-log") {
    const param = requestURL.split('?')[1];
    const query = parseQuery(param);
    if (!query.date || !query.hourOfDay) {
      res.write('Required query missing. Please ensure the hourOfDay and date is specified')
      res.end();
    } else {
      returnLog(query, res);
    }

  }
});


function returnLog(query, res) {
  let resultLog = "";
  const rl = readline.createInterface({
    input: fs.createReadStream(logFile),
    crlfDelay: Infinity,
  });

  rl.on("line", (line) => {
    const logLine = line;
    const time = logLine.slice(11, 13);
    const date = logLine.slice(0, 10);
    if (
      query.date === date &&
      Number(query.hourOfDay) == Number(time)
    ) {
      resultLog += String(line) + '\n';
    }
  });

  rl.on("close", () => {
    res.write(resultLog);
    res.end();
  });
}

server.listen(7000, function () {
  console.log("server start at port 7000"); //the server object listens on port 3000
});

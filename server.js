const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain"
};

http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(
      new URL(req.url, `http://${req.headers.host}`).pathname
    );

    // Health check for Render
    if (urlPath === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    let filePath = path.join(ROOT, urlPath);
    if (urlPath === "/") filePath = path.join(ROOT, "index.html");

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        fs.readFile(path.join(ROOT, "index.html"), (e, data) => {
          if (e) {
            res.writeHead(404);
            res.end("Not found");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
        return;
      }

      const ext = path.extname(filePath);
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream"
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch {
    res.writeHead(500);
    res.end("Server error");
  }
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Error "Node.js is required to preview Spotit locally."
  exit 1
}

$publicRoot = (Join-Path $PSScriptRoot "public").Replace("\", "\\")
$script = @'
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = "__SPOTIT_PUBLIC_ROOT__";
const port = Number(process.env.SPOTIT_LOCAL_PORT || 8787);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  let requestedPath = decodeURIComponent(url.pathname);
  if (requestedPath === "/" || requestedPath === "") requestedPath = "/index.html";

  const file = path.resolve(root, `.${requestedPath}`);
  if (!file.startsWith(root)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, bytes) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(bytes);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Spotit local app running at http://127.0.0.1:${port}/`);
});
'@

$script = $script.Replace("__SPOTIT_PUBLIC_ROOT__", $publicRoot)

$tempScript = Join-Path $env:TEMP "spotit-local-preview.js"
Set-Content -LiteralPath $tempScript -Value $script -Encoding UTF8
node $tempScript

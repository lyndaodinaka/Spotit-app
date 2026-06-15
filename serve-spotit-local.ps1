$root = Join-Path $PSScriptRoot "public"
$port = 8787
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Spotit local app running at http://localhost:$port/"

$contentTypes = @{
  ".html" = "text/html"
  ".css" = "text/css"
  ".js" = "application/javascript"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $path = $context.Request.Url.AbsolutePath.TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($path)) {
    $path = "index.html"
  }

  $safePath = $path -replace "/", [System.IO.Path]::DirectorySeparatorChar
  $file = Join-Path $root $safePath
  $resolvedRoot = [System.IO.Path]::GetFullPath($root)
  $resolvedFile = [System.IO.Path]::GetFullPath($file)

  if (-not $resolvedFile.StartsWith($resolvedRoot) -or -not (Test-Path -LiteralPath $resolvedFile -PathType Leaf)) {
    $context.Response.StatusCode = 404
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
    continue
  }

  $extension = [System.IO.Path]::GetExtension($resolvedFile).ToLowerInvariant()
  $context.Response.ContentType = $contentTypes[$extension]
  if (-not $context.Response.ContentType) {
    $context.Response.ContentType = "application/octet-stream"
  }

  $bytes = [System.IO.File]::ReadAllBytes($resolvedFile)
  $context.Response.ContentLength64 = $bytes.Length
  $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $context.Response.Close()
}

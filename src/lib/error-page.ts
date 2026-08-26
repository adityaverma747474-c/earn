export function renderErrorPage(errorMsg?: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 48rem; width: 100%; text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      pre { text-align: left; background: #f1f5f9; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; font-size: 12px; color: #ef4444; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Server Error Log</h1>
      <p>Something went wrong. Here is the debug log:</p>
      ${errorMsg ? `<pre>${errorMsg}</pre>` : ""}
    </div>
  </body>
</html>`;
}

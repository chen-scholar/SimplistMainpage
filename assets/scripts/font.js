export async function setupPrimaryFont({ fontPath, timeoutMs }) {
  const root = document.documentElement;

  if (!("FontFace" in window) || !document.fonts) {
    root.dataset.fontState = "fallback";
    return;
  }

  root.dataset.fontState = "pending";

  try {
    const fontFace = new FontFace("Ubuntu Sans Mono Medium", `url(${fontPath}) format("woff")`, {
      style: "normal",
      weight: "500"
    });

    await Promise.race([
      fontFace.load(),
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("font-timeout")), timeoutMs);
      })
    ]);

    document.fonts.add(fontFace);
    root.dataset.fontState = "ready";
  } catch {
    root.dataset.fontState = "fallback";
  }
}

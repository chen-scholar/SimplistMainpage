// 用 FontFace API 异步加载自定义字体，超时就摆烂用系统字体
// 通过 html 标签上的 data-font-state 来控制 CSS 里的字体族切换
export async function setupPrimaryFont({ fontPath, timeoutMs }) {
  const root = document.documentElement;

  // 浏览器不支持 FontFace API，直接投降
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

    // 字体加载和超时赛跑，谁先到听谁的
    await Promise.race([
      fontFace.load(),
      new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("font-timeout")), timeoutMs);
      })
    ]);

    document.fonts.add(fontFace);
    root.dataset.fontState = "ready";
  } catch {
    root.dataset.fontState = "fallback";   // 不管超时还是报错，一律落入后备字体
  }
}

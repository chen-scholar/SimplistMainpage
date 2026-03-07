// 头像加载：成了就显示图片，挂了就老老实实兜底
export async function setupAvatar({ avatar, image, fallback, src }) {
  if (!avatar || !image || !fallback) {
    return;
  }

  try {
    await loadImage(image, src);
    avatar.classList.add("is-loaded");
    fallback.setAttribute("aria-hidden", "true");   // 加载成功就藏掉兜底占位
  } catch {
    avatar.classList.remove("is-loaded");
    fallback.removeAttribute("aria-hidden");   // 失败了把占位露出来
  }
}

// 简单的 Promise 包装 image 加载，没啥黑魔法
function loadImage(image, src) {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("avatar-load-failed"));
    image.src = src;
  });
}

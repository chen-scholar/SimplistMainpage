export async function setupAvatar({ avatar, image, fallback, src }) {
  if (!avatar || !image || !fallback) {
    return;
  }

  try {
    await loadImage(image, src);
    avatar.classList.add("is-loaded");
    fallback.setAttribute("aria-hidden", "true");
  } catch {
    avatar.classList.remove("is-loaded");
    fallback.removeAttribute("aria-hidden");
  }
}

function loadImage(image, src) {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("avatar-load-failed"));
    image.src = src;
  });
}

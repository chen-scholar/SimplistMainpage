// 入口文件，根据 body 上的 data-page 决定当前页面，然后拉起一切
import { siteConfig } from "./config.js";
import { setupAvatar } from "./avatar.js";
import { loadPageContent } from "./content.js";
import { setupPrimaryFont } from "./font.js";

const pageId = document.body.dataset.page;
const page = siteConfig.pages.find((item) => item.id === pageId);

bootstrap();

// 所有异步任务（字体/头像/内容）并发执行，各管各的不互相卡
async function bootstrap() {
  hydrateStaticBits();   // 先同步填好导航栏和页脚这些静态部分，不用等网络

  if (!page) {
    return;
  }

  await Promise.all([
    setupPrimaryFont({
      fontPath: siteConfig.fontPath,
      timeoutMs: siteConfig.fontTimeoutMs
    }),
    setupAvatar({
      avatar: document.querySelector(".avatar-card"),
      image: document.querySelector(".avatar-card__image"),
      fallback: document.querySelector(".avatar-card__fallback"),
      src: siteConfig.avatarPath
    }),
    loadPageContent({
      mount: document.querySelector("[data-content]"),
      loading: document.querySelector("[data-loading]"),
      markdownPath: page.markdown,
      pageTitle: `${page.title} | ${siteConfig.siteTitle}`
    })
  ]);
}

// 把配置里的静态内容灌进 DOM（导航栏、页脚、侧边标题），不需要等网络
function hydrateStaticBits() {
  const navList = document.querySelector("[data-nav-list]");
  const footer = document.querySelector("[data-footer-text]");
  const title = document.querySelector(".sidebar__title");

  if (title) {
    title.textContent = siteConfig.siteTitle;
  }

  if (footer) {
    footer.textContent = siteConfig.footerText;
  }

  if (!navList) {
    return;
  }

  // 遍历配置里的页面列表生成导航链接，当前页加个 is-active 高亮
  navList.innerHTML = siteConfig.pages
    .map((item) => {
      const activeClass = item.id === pageId ? "is-active" : "";
      return `<li><a class="${activeClass}" href="${item.href}">${item.label}</a></li>`;
    })
    .join("");
}

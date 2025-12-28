import { siteConfig } from "./config.js";
import { setupAvatar } from "./avatar.js";
import { loadPageContent } from "./content.js";
import { setupPrimaryFont } from "./font.js";

const pageId = document.body.dataset.page;
const page = siteConfig.pages.find((item) => item.id === pageId);

bootstrap();

async function bootstrap() {
  hydrateStaticBits();

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

  navList.innerHTML = siteConfig.pages
    .map((item) => {
      const activeClass = item.id === pageId ? "is-active" : "";
      return `<li><a class="${activeClass}" href="${item.href}">${item.label}</a></li>`;
    })
    .join("");
}

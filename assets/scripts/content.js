import { renderMarkdown } from "./markdown.js";

export async function loadPageContent({ mount, loading, markdownPath, pageTitle }) {
  if (!mount || !loading) {
    return;
  }

  try {
    const response = await fetch(markdownPath, { headers: { Accept: "text/markdown, text/plain;q=0.9, */*;q=0.1" } });

    if (!response.ok) {
      throw new Error(`markdown-request-failed:${response.status}`);
    }

    const markdown = await response.text();
    mount.innerHTML = renderMarkdown(markdown);
    mount.classList.add("is-ready");
    document.title = pageTitle;
  } catch {
    mount.innerHTML = `
      <section class="error-card">
        <h1>Not found.</h1>
        <p>这页对应的 Markdown 还没准备好，或者路径写岔了。先去 content 目录看一眼，大概率就能发现问题。</p>
      </section>
    `;
    mount.classList.add("is-ready");
    document.title = `${pageTitle} - missing`;
  } finally {
    loading.classList.add("is-hidden");
  }
}

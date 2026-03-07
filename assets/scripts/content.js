import { renderMarkdown } from "./markdown.js";

// 拉取对应页面的 markdown 文件，渲染到内容区，失败就展示错误提示
export async function loadPageContent({ mount, loading, markdownPath, pageTitle }) {
  if (!mount || !loading) {
    return;
  }

  try {
    // 设置个 Accept 头明确说自己要 markdown/纯文本，万一后端哪天抽风也能兜住
    const response = await fetch(markdownPath, { headers: { Accept: "text/markdown, text/plain;q=0.9, */*;q=0.1" } });

    if (!response.ok) {
      throw new Error(`markdown-request-failed:${response.status}`);
    }

    const markdown = await response.text();
    mount.innerHTML = renderMarkdown(markdown);
    mount.classList.add("is-ready");
    document.title = pageTitle;
  } catch {
    // markdown 文件路径有问题或者网络挂了，优雅地提示一下
    mount.innerHTML = `
      <section class="error-card">
        <h1>Not found.</h1>
        <p>这页对应的 Markdown 还没准备好，或者路径写岔了。先去 content 目录看一眼，大概率就能发现问题。</p>
      </section>
    `;
    mount.classList.add("is-ready");
    document.title = `${pageTitle} - missing`;
  } finally {
    loading.classList.add("is-hidden");   // 不管死活都得把 loading 藏掉
  }
}

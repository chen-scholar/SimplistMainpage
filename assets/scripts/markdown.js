// 极简 markdown 解析器：先把源文本切成 block，再逐个转成 HTML
// 不需要引入任何第三方库，够用就行
export function renderMarkdown(markdown) {
  const blocks = tokenize(markdown);
  return blocks.map(renderBlock).join("");
}

// 逐行扫描，按 block 级别（段落/标题/列表/引用/代码块）切分
// flushXxx 就是把缓冲区里的内容"提交"成 block，扫到新类型时触发
function tokenize(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let codeFence = null;   // 代码块标记，进入时记下语言，退出时清掉

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flushList = () => {
    if (!list) {
      return;
    }

    blocks.push(list);
    list = null;
  };

  const flushQuote = () => {
    if (!quote.length) {
      return;
    }

    blocks.push({ type: "blockquote", text: quote.join(" ") });
    quote = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // 代码块内部：啥都不解析，直接吞进去，直到遇到结束的 ```
    if (codeFence) {
      if (line.startsWith("```")) {
        blocks.push(codeFence);
        codeFence = null;
      } else {
        codeFence.lines.push(rawLine);
      }
      continue;
    }

    // 代码块开头：进入代码块模式
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      flushQuote();
      codeFence = {
        type: "code",
        language: line.slice(3).trim(),
        lines: []
      };
      continue;
    }

    // 空行 = 分隔符，把当前积攒的内容全部 flush 掉
    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    // 标题：h1 ~ h3，够用了
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      continue;
    }

    // 引用：以 > 开头
    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }

    // 列表项：- 或 * 开头
    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();   // 注意：不 flush 列表本身，因为连续列表项要合并
      if (!list) {
        list = { type: "list", items: [] };
      }
      list.items.push(listMatch[1]);
      continue;
    }

    // 啥都不是，就是普通段落文本
    flushList();
    flushQuote();
    paragraph.push(line);
  }

  // 文件末尾记得把残留的缓冲区清掉
  flushParagraph();
  flushList();
  flushQuote();

  // 如果 markdown 结尾忘了关代码块，也兜个底
  if (codeFence) {
    blocks.push(codeFence);
  }

  return blocks;
}

// 把 block 对象转成对应的 HTML 标签
function renderBlock(block) {
  switch (block.type) {
    case "heading":
      return `<h${block.level}>${renderInline(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${renderInline(block.text)}</p>`;
    case "list":
      return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`;
    case "blockquote":
      return `<blockquote><p>${renderInline(block.text)}</p></blockquote>`;
    case "code":
      return `<pre><code>${escapeHtml(block.lines.join("\n"))}</code></pre>`;
    default:
      return "";
  }
}

// 行内元素解析：code / 加粗 / 斜体 / 链接，按顺序替换
// 注意要先 escape HTML，否则恶意注入就搞笑了
function renderInline(input) {
  let output = escapeHtml(input);

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return output;
}

// HTML 实体转义，防止 XSS
function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
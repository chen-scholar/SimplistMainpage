export function renderMarkdown(markdown) {
  const blocks = tokenize(markdown);
  return blocks.map(renderBlock).join("");
}

function tokenize(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  let quote = [];
  let codeFence = null;

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

    if (codeFence) {
      if (line.startsWith("```")) {
        blocks.push(codeFence);
        codeFence = null;
      } else {
        codeFence.lines.push(rawLine);
      }
      continue;
    }

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

    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

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

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quote.push(quoteMatch[1]);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      if (!list) {
        list = { type: "list", items: [] };
      }
      list.items.push(listMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  if (codeFence) {
    blocks.push(codeFence);
  }

  return blocks;
}

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

function renderInline(input) {
  let output = escapeHtml(input);

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return output;
}

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

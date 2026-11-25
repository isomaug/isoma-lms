import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

function enhanceHtml(html) {
  let i = 0;
  let out = html
    .replace(/<ol(\s[^>]*)?>/gi, '<ol class="lesson-step-list">')
    .replace(/<ul(\s[^>]*)?>/gi, '<ul class="lesson-bullet-list">');

  out = out.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, code) => {
    const key = `code-${i++}`;
    const plain = code
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return (
      `<div class="lesson-code-block" data-copy-key="${key}" data-code="${encodeURIComponent(plain)}">` +
      `<div class="lesson-code-toolbar"><span class="lesson-code-label">Code</span>` +
      `<button type="button" class="lesson-code-copy" data-copy-key="${key}">Copy</button></div>` +
      `<pre class="lesson-code-pre"><code class="lesson-code-font"${attrs}>${code}</code></pre></div>`
    );
  });
  return out;
}

/**
 * Full-bleed spoken lesson reader with graphic steps and copyable code.
 */
export default function LessonTextPanel({ markdown, emptyLabel = "No content available." }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const html = useMemo(() => {
    if (!markdown) return "";
    const raw = marked.parse(String(markdown).trim());
    return enhanceHtml(
      DOMPurify.sanitize(raw, {
        ADD_ATTR: ["data-code", "data-copy-key", "class"],
        ADD_TAGS: ["button"],
      })
    );
  }, [markdown]);

  const onClick = async (e) => {
    const btn = e.target.closest(".lesson-code-copy");
    if (!btn) return;
    e.preventDefault();
    const key = btn.getAttribute("data-copy-key");
    const block = btn.closest(".lesson-code-block");
    const text = decodeURIComponent(block?.getAttribute("data-code") || "");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      btn.textContent = "Copied";
      window.setTimeout(() => {
        btn.textContent = "Copy";
        setCopiedKey((cur) => (cur === key ? null : cur));
      }, 1600);
    } catch (_) {
      /* ignore */
    }
  };

  if (!markdown) {
    return <p className="italic opacity-60 px-1">{emptyLabel}</p>;
  }

  return (
    <div className="lesson-text-reader w-full max-w-none" data-copied={copiedKey || ""} onClick={onClick}>
      <div
        className="prose prose-slate w-full max-w-none lesson-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

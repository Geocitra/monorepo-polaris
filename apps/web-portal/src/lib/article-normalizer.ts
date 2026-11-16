function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdown(raw: string): string {
  const escaped = escapeHtml(raw);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[\^([^\]]+)\]/g, '<sup>[$1]</sup>');
}

/**
 * Mengonversi Markdown menjadi HTML aman untuk template yang memakai dangerouslySetInnerHTML
 * (dengan proteksi XSS escapeHtml dan penanganan heading, blockquote, list, serta tabel).
 */
export function markdownToSafeHtml(rawMarkdown: string): string {
  if (!rawMarkdown || typeof rawMarkdown !== 'string') return '';
  const trimmed = rawMarkdown.trim();
  if (!trimmed) return '';

  // Jika sudah berupa HTML dari TipTap, kembalikan apa adanya setelah strip script tag
  if (trimmed.startsWith('<') && !trimmed.includes(':::chart') && !trimmed.includes(':::metric')) {
    return trimmed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  const lines = trimmed.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;
  let inSpecialBlock = false;
  let tableRows: string[] = [];

  const flushList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const [headerRow, ...bodyRows] = tableRows;
    const parseCells = (row: string) =>
      row
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim());

    const headers = parseCells(headerRow);
    const dataRows = bodyRows.filter((r) => !/^\|?[\s:-]+\|/.test(r));

    htmlParts.push('<table><thead><tr>');
    for (const h of headers) {
      htmlParts.push(`<th>${formatInlineMarkdown(h)}</th>`);
    }
    htmlParts.push('</tr></thead><tbody>');
    for (const r of dataRows) {
      const cells = parseCells(r);
      htmlParts.push('<tr>');
      for (const c of cells) {
        htmlParts.push(`<td>${formatInlineMarkdown(c)}</td>`);
      }
      htmlParts.push('</tr>');
    }
    htmlParts.push('</tbody></table>');
    tableRows = [];
  };

  for (const line of lines) {
    const t = line.trim();

    if (t.startsWith(':::')) {
      flushList();
      flushTable();
      inSpecialBlock = !inSpecialBlock;
      continue;
    }
    if (inSpecialBlock) continue;
    if (t.startsWith('<!--') && t.endsWith('-->')) continue;

    if (t.startsWith('|') && t.endsWith('|')) {
      flushList();
      tableRows.push(t);
      continue;
    }
    flushTable();

    if (!t) {
      flushList();
      continue;
    }

    if (t.startsWith('### ')) {
      flushList();
      htmlParts.push(`<h3>${formatInlineMarkdown(t.slice(4))}</h3>`);
    } else if (t.startsWith('## ')) {
      flushList();
      htmlParts.push(`<h2>${formatInlineMarkdown(t.slice(3))}</h2>`);
    } else if (t.startsWith('# ')) {
      flushList();
      htmlParts.push(`<h1>${formatInlineMarkdown(t.slice(2))}</h1>`);
    } else if (t.startsWith('> ')) {
      flushList();
      htmlParts.push(`<blockquote><p>${formatInlineMarkdown(t.slice(2))}</p></blockquote>`);
    } else if (/^[-*]\s+/.test(t)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${formatInlineMarkdown(t.replace(/^[-*]\s+/, ''))}</li>`);
    } else {
      flushList();
      htmlParts.push(`<p>${formatInlineMarkdown(t)}</p>`);
    }
  }

  flushList();
  flushTable();
  return htmlParts.join('\n');
}

/**
 * Menormalkan kontrak payload artikel dari api-core agar seluruh template web-portal
 * (yang membaca bodyContentMarkdown, body, content, summary/excerpt, atau posterUrl/coverImage)
 * menerima data lengkap secara konsisten.
 */
export function normalizePublicArticle<T extends Record<string, any>>(
  article: T,
  canonicalUrl: string
): T & {
  bodyContentMarkdown: string;
  body: string;
  content: string;
  excerpt: string;
  summary: string;
  leadParagraph: string;
  posterUrl: string | null;
  featuredImageUrl: string | null;
  coverImage: string | null;
  canonicalUrl: string;
} {
  const rawBody =
    (typeof article.bodyContentMarkdown === 'string' && article.bodyContentMarkdown) ||
    (typeof article.body === 'string' && article.body) ||
    (typeof article.content === 'string' && article.content) ||
    '';

  const safeHtmlContent =
    typeof article.content === 'string' && article.content.trim().startsWith('<')
      ? article.content
      : markdownToSafeHtml(rawBody);

  const summaryText = article.excerpt || article.summary || article.leadParagraph || '';
  const imageUrl = article.posterUrl || article.featuredImageUrl || article.coverImage || null;

  return {
    ...article,
    bodyContentMarkdown: rawBody,
    body: rawBody,
    content: safeHtmlContent,
    excerpt: summaryText,
    summary: summaryText,
    leadParagraph: summaryText,
    posterUrl: imageUrl,
    featuredImageUrl: imageUrl,
    coverImage: imageUrl,
    canonicalUrl,
  };
}


// Convert a structured chart object into a high-DPI QuickChart.io PNG image URL
export function chartBlockToQuickChartUrl(chartData: {
  type?: string;
  title?: string;
  unit?: string;
  labels?: string[];
  datasets?: { label?: string; data: number[] }[];
}): string {
  const chartType = chartData.type === 'line' ? 'line' : chartData.type === 'pie' ? 'pie' : 'bar';
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];

  const chartConfig = {
    type: chartType,
    data: {
      labels: chartData.labels || ['Tahun 2024', 'Tahun 2025', 'Tahun 2026'],
      datasets: (chartData.datasets || [{ label: 'Data', data: [40, 60, 80] }]).map((ds, idx) => ({
        label: (ds.label || 'Realisasi') + (chartData.unit ? ` (${chartData.unit})` : ''),
        data: ds.data,
        backgroundColor: chartType === 'pie' ? colors : colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 1,
        borderRadius: chartType === 'bar' ? 6 : 0,
      })),
    },
    options: {
      plugins: {
        title: {
          display: !!chartData.title,
          text: chartData.title || 'Grafik Kebijakan Daerah',
          font: { size: 14, weight: 'bold' },
          padding: { top: 8, bottom: 12 },
        },
        legend: {
          display: true,
          position: 'bottom',
        },
      },
      scales: chartType === 'pie' ? undefined : {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?bkg=white&w=650&h=350&devicePixelRatio=2&v=3&c=${encoded}`;
}

// Helper to convert Markdown syntax to basic HTML for TipTap initialization
export function markdownToHtml(md: string): string {
  if (!md) return '<p></p>';
  // If already pure HTML without any ::: blocks or markdown tables, return directly
  if (md.trim().startsWith('<') && !md.includes(':::chart') && !md.includes(':::metric') && !md.includes('|')) {
    return md;
  }

  // Pre-clean any <p> wrapping around :::chart or :::metric
  const cleaned = md
    .replace(/<p>\s*:::chart([\s\S]*?):::\s*<\/p>/gi, ':::chart$1:::')
    .replace(/<p>\s*:::metric([\s\S]*?):::\s*<\/p>/gi, ':::metric$1:::');

  const lines = cleaned.split('\n');
  const htmlParts: string[] = [];
  let inTable = false;
  let inList = false;
  let consecutiveEmptyLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Chart Block :::chart ... ::: -> QuickChart.io PNG Image
    if (trimmed.startsWith(':::chart')) {
      let json = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        json += lines[i] + ' ';
        i++;
      }
      try {
        const cleanJson = json.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const parsed = JSON.parse(cleanJson);
        const chartUrl = chartBlockToQuickChartUrl(parsed);
        htmlParts.push(`
          <p style="text-align: center; margin: 1.5em 0;">
            <img src="${chartUrl}" alt="${parsed.title || 'Grafik Kebijakan'}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;" />
          </p>
        `);
      } catch {}
      continue;
    }

    // Metric Block :::metric ... ::: -> Styled KPI card
    if (trimmed.startsWith(':::metric')) {
      let json = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        json += lines[i] + ' ';
        i++;
      }
      try {
        const cleanJson = json.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const parsed = JSON.parse(cleanJson);
        htmlParts.push(`
          <blockquote style="border-left: 4px solid #2563EB; background: #F8FAFC; padding: 12px 18px; border-radius: 8px; margin: 1.5em 0;">
            <p><strong>📊 ${parsed.label || 'Indikator Kebijakan'}: ${parsed.value || ''}</strong></p>
            <p style="font-size: 0.9em; color: #475569; margin-top: 4px;">${parsed.description || ''}</p>
          </blockquote>
        `);
      } catch {}
      continue;
    }

    // Table Row detection (Markdown table -> TipTap compliant <table> schema)
    const isTableLine = trimmed.startsWith('|') || (trimmed.endsWith('|') && trimmed.includes('|'));
    if (isTableLine) {
      if (trimmed.includes('---') || /^\|?[\s\-:|]+\|?$/.test(trimmed)) {
        continue; // delimiter row
      }
      let inner = trimmed;
      if (inner.startsWith('|')) inner = inner.slice(1);
      if (inner.endsWith('|')) inner = inner.slice(0, -1);
      const cells = inner
        .split('|')
        .map((c) => c.trim());

      if (!inTable) {
        htmlParts.push('<table><tbody>');
        inTable = true;
        htmlParts.push(
          `<tr>${cells.map((c) => `<th colspan="1" rowspan="1"><p><strong>${c}</strong></p></th>`).join('')}</tr>`
        );
      } else {
        htmlParts.push(
          `<tr>${cells.map((c) => `<td colspan="1" rowspan="1"><p>${c}</p></td>`).join('')}</tr>`
        );
      }
      continue;
    } else if (inTable) {
      htmlParts.push('</tbody></table>');
      inTable = false;
    }

    // Inline Visual Slot Marker: <!-- VISUAL_SLOT: ... -->
    const visualSlotMatch = trimmed.match(/<!--\s*VISUAL_SLOT:\s*({[\s\S]*?})\s*-->/);
    if (visualSlotMatch) {
      try {
        const slotData = JSON.parse(visualSlotMatch[1]);
        const caption = slotData.caption || 'Ilustrasi / Foto Liputan Terkait';
        const prompt = slotData.prompt || caption;
        htmlParts.push(`
          <blockquote style="border: 2px dashed #3B82F6; background: #EFF6FF; padding: 16px 20px; border-radius: 12px; margin: 1.75em 0; text-align: center;">
            <p style="font-weight: 800; color: #1D4ED8; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">🖼️ REKOMENDASI SLOT VISUAL ARTIKEL</p>
            <p style="font-size: 0.95em; color: #1E293B; font-weight: 600; margin-bottom: 4px;">"${caption}"</p>
            <p style="font-size: 0.8em; color: #64748B; font-style: italic; margin-bottom: 0;">Arahan Visual: ${prompt}</p>
          </blockquote>
        `);
      } catch {}
      continue;
    }

    // Markdown Images: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const imgSrc = imgMatch[2];
      const captionHtml = altText
        ? `<figcaption style="font-size: 0.85em; color: #64748B; font-style: italic; margin-top: 6px; text-align: center;">📷 ${altText}</figcaption>`
        : '';
      htmlParts.push(`
        <figure class="article-image-block" data-size="full" data-align="center" style="margin: 1.75em auto; text-align: center; max-width: 100%;">
          <img src="${imgSrc}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; margin: 0 auto;" />
          ${captionHtml}
        </figure>
      `);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      htmlParts.push(`<h1>${trimmed.replace(/^#\s*/, '')}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2>${trimmed.replace(/^##\s*/, '')}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      htmlParts.push(`<h3>${trimmed.replace(/^###\s*/, '')}</h3>`);
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      htmlParts.push('<hr>');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      htmlParts.push(`<blockquote><p>${trimmed.replace(/^>\s*/, '')}</p></blockquote>`);
      continue;
    }

    // Bullet lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li><p>${trimmed.replace(/^[*\-]\s*/, '')}</p></li>`);
      continue;
    } else if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    if (trimmed.length > 0) {
      // Bold / Italic inline replace
      const parsedLine = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      htmlParts.push(`<p>${parsedLine}</p>`);
      consecutiveEmptyLines = 0;
    } else {
      consecutiveEmptyLines++;
      // Jangan suntikkan <p><br></p> untuk 1 baris kosong pemisah paragraf standar
      // Hanya suntikkan jika ada 2 atau lebih baris kosong berturut-turut (spacer intensional)
      if (consecutiveEmptyLines > 1) {
        htmlParts.push('<p><br></p>');
      }
    }
  }

  if (inTable) htmlParts.push('</tbody></table>');
  if (inList) htmlParts.push('</ul>');

  return htmlParts.join('');
}


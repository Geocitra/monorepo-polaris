import React from 'react';
import { BarChart3, TrendingUp, Camera, Quote, Info, CheckCircle2 } from 'lucide-react';

interface ChartBlockData {
  type?: 'bar' | 'line' | 'pie';
  title?: string;
  labels?: string[];
  unit?: string;
  datasets?: { label?: string; data: number[] }[];
}

interface MetricBlockData {
  value: string;
  label: string;
  description?: string;
}

// Convert a chart object into a high-DPI QuickChart URL
function chartToQuickChartUrl(chartData: ChartBlockData): string {
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
          text: chartData.title || 'Grafik Kebijakan Publik',
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
  return `https://quickchart.io/chart?bkg=white&w=700&h=380&devicePixelRatio=2&v=3&c=${encoded}`;
}

export function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  // Pre-clean any accidental HTML wrappers around custom blocks
  const cleaned = content
    .replace(/<p>\s*:::chart([\s\S]*?):::\s*<\/p>/gi, ':::chart$1:::')
    .replace(/<p>\s*:::metric([\s\S]*?):::\s*<\/p>/gi, ':::metric$1:::');

  // If content is already clean TipTap HTML without markdown blocks or tables, render directly
  if (
    cleaned.trim().startsWith('<') &&
    !cleaned.includes(':::chart') &&
    !cleaned.includes(':::metric') &&
    !cleaned.includes('|')
  ) {
    return (
      <div
        className="prose prose-slate max-w-none text-gray-800 leading-relaxed text-base sm:text-lg dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />
    );
  }

  const lines = cleaned.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let i = 0;

  function renderInline(text: string): React.ReactNode {
    // Check if text has HTML tags
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }

    // Markdown Links: [label](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = text.split(/(\[.*?\]\(.*?\))/g);

    return parts.map((part, pIdx) => {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        return (
          <a
            key={pIdx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {match[1]}
          </a>
        );
      }

      // Bold & Italic
      const boldParts = part.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return boldParts.map((subPart, sIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return (
            <strong key={`${pIdx}-${sIdx}`} className="font-extrabold text-gray-900">
              {subPart.slice(2, -2)}
            </strong>
          );
        }
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          return (
            <em key={`${pIdx}-${sIdx}`} className="italic text-gray-800">
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
    });
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Chart Block :::chart ... :::
    if (trimmed.startsWith(':::chart')) {
      let jsonStr = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        jsonStr += lines[i] + '\n';
        i++;
      }
      i++; // skip closing :::
      try {
        const cleanJson = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const chartData: ChartBlockData = JSON.parse(cleanJson);
        const chartUrl = chartToQuickChartUrl(chartData);

        renderedElements.push(
          <figure key={`chart-${i}`} className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={chartUrl}
              alt={chartData.title || 'Grafik Kebijakan'}
              className="mx-auto rounded-xl max-w-full h-auto"
              loading="lazy"
            />
            <figcaption className="mt-3 text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>{chartData.title || 'Visualisasi Indikator Kebijakan Daerah'}</span>
              {chartData.unit && <span className="text-slate-400">({chartData.unit})</span>}
            </figcaption>
          </figure>
        );
      } catch {
        renderedElements.push(
          <div key={`chart-err-${i}`} className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>Data Grafik Kebijakan:</strong>
            <pre className="mt-1 font-mono text-[11px] whitespace-pre-wrap">{jsonStr}</pre>
          </div>
        );
      }
      continue;
    }

    // 2. Metric Block :::metric ... :::
    if (trimmed.startsWith(':::metric')) {
      let jsonStr = '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        jsonStr += lines[i] + '\n';
        i++;
      }
      i++; // skip closing :::
      try {
        const cleanJson = jsonStr.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
        const metricData: MetricBlockData = JSON.parse(cleanJson);

        renderedElements.push(
          <div
            key={`metric-${i}`}
            className="my-7 p-5 rounded-2xl border-l-4 border-l-blue-600 border border-slate-200 bg-gradient-to-r from-blue-50/60 to-slate-50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>{metricData.label}</span>
              </span>
              {metricData.description && (
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {metricData.description}
                </p>
              )}
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight text-blue-900">
                {metricData.value}
              </span>
            </div>
          </div>
        );
      } catch {}
      continue;
    }

    // 3. Markdown Table: | Col 1 | Col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length > 0) {
        const headerCells = tableLines[0]
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());

        const dataRows = tableLines.slice(1).filter((row) => !row.includes('---'));

        renderedElements.push(
          <div key={`table-${i}`} className="my-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 sm:px-6 sm:py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataRows.map((row, rIdx) => {
                  const cells = row
                    .slice(1, -1)
                    .split('|')
                    .map((c) => c.trim());
                  return (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 sm:px-6 sm:py-3.5 text-slate-700">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 4. Markdown Images: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const altText = imgMatch[1] || 'Dokumentasi Kebijakan Lapangan';
      const imgSrc = imgMatch[2];

      renderedElements.push(
        <figure key={`img-${i}`} className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={altText}
            className="w-full object-cover max-h-[500px]"
            loading="lazy"
          />
          <figcaption className="p-3 text-center text-xs text-slate-600 italic bg-white border-t border-slate-100 flex items-center justify-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{altText}</span>
          </figcaption>
        </figure>
      );
      i++;
      continue;
    }

    // 5. Headings
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight pt-6 pb-2 border-b border-slate-200">
          {trimmed.replace(/^#\s*/, '')}
        </h1>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-6 pb-2 border-b border-slate-100">
          {trimmed.replace(/^##\s*/, '')}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1">
          {trimmed.replace(/^###\s*/, '')}
        </h3>
      );
      i++;
      continue;
    }

    // 6. Blockquote
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-6 p-4 sm:p-5 rounded-2xl border-l-4 border-l-slate-900 bg-slate-50 text-slate-800 italic font-serif text-base sm:text-lg leading-relaxed shadow-2xs relative pl-6"
        >
          <Quote className="w-4 h-4 text-slate-400 mb-1 inline mr-2 opacity-50" />
          {renderInline(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 7. Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      renderedElements.push(<hr key={`hr-${i}`} className="my-8 border-slate-200" />);
      i++;
      continue;
    }

    // 8. Bullet List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={`li-${i}`} className="ml-6 list-disc text-slate-700 my-1 leading-relaxed">
          {renderInline(trimmed.replace(/^[*\-]\s*/, ''))}
        </li>
      );
      i++;
      continue;
    }

    // 9. Regular Paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="text-justify leading-relaxed text-slate-800 my-3">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-2 text-slate-800 leading-relaxed text-base sm:text-lg">
      {renderedElements}
    </div>
  );
}

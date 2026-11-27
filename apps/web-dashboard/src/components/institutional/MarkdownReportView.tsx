'use client';

import { Table2, Download } from 'lucide-react';

function downloadCsvFromMarkdownTable(lines: string[]) {
  const rows = lines
    .filter((l) => !/^\s*\|[\s:-]+\|\s*$/.test(l))
    .map((l) =>
      l
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => `"${cell.trim().replace(/"/g, '""')}"`)
        .join(',')
    );
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `polaris-tabel-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-indigo-600 dark:text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function MarkdownReportView({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: Array<{ type: 'table' | 'text'; lines: string[] }> = [];

  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('|---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
    } else {
      const textLines: string[] = [];
      while (
        i < lines.length &&
        !(lines[i].trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('|---'))
      ) {
        textLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'text', lines: textLines });
    }
  }

  return (
    <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          const headerCells = block.lines[0]
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());
          const bodyRows = block.lines
            .slice(2)
            .map((row) =>
              row
                .trim()
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map((c) => c.trim())
            );

          return (
            <div
              key={bIdx}
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Table2 className="h-3.5 w-3.5 text-indigo-500" />
                  Tabel Terstruktur
                </span>
                <button
                  type="button"
                  onClick={() => downloadCsvFromMarkdownTable(block.lines)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Unduh CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                      {headerCells.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className="px-3 py-2 font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((cells, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-slate-100 dark:border-slate-800/70 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                      >
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                            {renderInlineFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        return (
          <div key={bIdx} className="space-y-1.5">
            {block.lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;
              if (trimmed.startsWith('#### ')) {
                return (
                  <h5 key={lIdx} className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white pt-1.5">
                    {renderInlineFormatting(trimmed.slice(5))}
                  </h5>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-sm font-black text-slate-900 dark:text-white pt-2">
                    {renderInlineFormatting(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-base font-black text-slate-900 dark:text-white pt-2">
                    {renderInlineFormatting(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-indigo-500 font-bold mt-0.5">&bull;</span>
                    <span>{renderInlineFormatting(trimmed.slice(2))}</span>
                  </div>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <div
                    key={lIdx}
                    className="border-l-2 border-indigo-400 pl-3 py-0.5 text-slate-600 dark:text-slate-400 italic"
                  >
                    {renderInlineFormatting(trimmed.slice(2))}
                  </div>
                );
              }
              return <p key={lIdx}>{renderInlineFormatting(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

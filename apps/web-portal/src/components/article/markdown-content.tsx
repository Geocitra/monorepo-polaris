import React from 'react';

export function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;

  // Split per paragraf / baris
  const lines = content.split('\n');

  return (
    <div className="space-y-4 text-gray-800 leading-relaxed text-base sm:text-lg">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Heading 1 & 2 (##)
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight pt-6 pb-2 border-b border-gray-100"
            >
              {trimmed.replace('## ', '')}
            </h2>
          );
        }

        // Heading 3 (###)
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-xl sm:text-2xl font-bold text-gray-900 pt-4 pb-1"
            >
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        // Bullet list (-)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <li key={idx} className="ml-6 list-disc text-gray-700">
              {trimmed.substring(2)}
            </li>
          );
        }

        // Paragraf biasa dengan formatting bold (**teks**)
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={idx} className="text-justify leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-extrabold text-gray-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

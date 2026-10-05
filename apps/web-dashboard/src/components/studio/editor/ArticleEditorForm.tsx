'use client';

interface ArticleEditorFormProps {
  title: string;
  setTitle: (val: string) => void;
  excerpt: string;
  setExcerpt: (val: string) => void;
  bodyContentMarkdown: string;
  setBodyContentMarkdown: (val: string) => void;
}

export function ArticleEditorForm({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  bodyContentMarkdown,
  setBodyContentMarkdown,
}: ArticleEditorFormProps) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">Judul Artikel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul artikel atau siaran pers..."
          className="mt-1 block w-full text-xl font-extrabold text-slate-900 border-b border-slate-200 pb-2 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">Ringkasan (Excerpt)</label>
        <textarea
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Ringkasan singkat artikel..."
          className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-xs italic text-slate-700 focus:border-blue-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">
          Isi Naskah Artikel (Markdown Editor)
        </label>
        <textarea
          rows={18}
          value={bodyContentMarkdown}
          onChange={(e) => setBodyContentMarkdown(e.target.value)}
          placeholder="Tulis naskah lengkap menggunakan format Markdown..."
          className="mt-1 block w-full rounded-xl border border-slate-200 p-4 text-xs font-mono leading-relaxed text-slate-800 focus:border-blue-600 focus:outline-none"
        />
      </div>
    </div>
  );
}

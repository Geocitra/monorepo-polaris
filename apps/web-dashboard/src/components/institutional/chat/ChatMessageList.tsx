'use client';

import { useState, type RefObject } from 'react';
import Link from 'next/link';
import {
  Bot,
  BookmarkPlus,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  PencilLine,
  Send,
  Sparkles,
  Table2,
  UploadCloud,
  FolderOpen,
} from 'lucide-react';
import { MarkdownReportView } from '../MarkdownReportView';
import type {
  CoordinatorChatMode,
  CoordinatorGuidedOptionDto,
  CoordinatorGuidedQuestionDto,
  CoordinatorLinkedActionDto,
} from '@polaris/shared-types';

export interface ChatMessageViewItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  routedAgents?: string[];
  detectedMode?: CoordinatorChatMode;
  generatedImageUrl?: string | null;
  usedCitations?: Array<{ code: string; title: string; scope: string }>;
  guidedQuestion?: CoordinatorGuidedQuestionDto | null;
  linkedActions?: CoordinatorLinkedActionDto[];
  createdAt: string;
}

interface ChatMessageListProps {
  messages: ChatMessageViewItem[];
  sending: boolean;
  activeMode?: CoordinatorChatMode;
  unitName?: string;
  onSelectGuidedOption: (opt: CoordinatorGuidedOptionDto) => void;
  onSaveAsNote: (msg: ChatMessageViewItem) => void;
  onExportCsv: (markdown: string) => void;
  onCopyMessage: (msg: ChatMessageViewItem) => void;
  onFollowUpAction: (msg: ChatMessageViewItem, targetMode: 'ARTICLE' | 'IMAGE') => void;
  bottomRef: RefObject<HTMLDivElement | null>;
}

function getContextualLoadingText(mode?: CoordinatorChatMode, unitName?: string): string {
  switch (mode) {
    case 'LKPJ_FINANCE':
      return 'Menelaah dokumen LKPJ, capaian program, dan serapan anggaran...';
    case 'LEGISLATION':
      return 'Menyisir pasal Raperda dan regulasi hukum terkait...';
    case 'BRIEFING':
      return 'Menyusun briefing rapat 5 poin yang ringkas dan strategis...';
    case 'ARTICLE':
      return 'Menyusun draf artikel dan siaran pers resmi untuk publik...';
    case 'IMAGE':
      return 'Merancang komposisi dan merender visual infografis...';
    default:
      return `Menyiapkan analisis strategis untuk ${unitName || 'Bidang Anda'}...`;
  }
}

export function ChatMessageList({
  messages,
  sending,
  activeMode,
  unitName,
  onSelectGuidedOption,
  onSaveAsNote,
  onExportCsv,
  onCopyMessage,
  onFollowUpAction,
  bottomRef,
}: ChatMessageListProps) {
  const [activeInlineOptionKey, setActiveInlineOptionKey] = useState<string | null>(null);
  const [inlineValues, setInlineValues] = useState<Record<string, string>>({});

  function handleSubmitInlineOption(opt: CoordinatorGuidedOptionDto) {
    const fields = opt.inlineInputFields || [];
    const filledLines = fields
      .map((f) => {
        const val = (inlineValues[f.key] || '').trim();
        return val ? `- ${f.label}: ${val}` : null;
      })
      .filter(Boolean);
    if (filledLines.length === 0) return;

    const combinedPrompt = `${opt.nextMessage}\n\n${filledLines.join('\n')}`;
    setActiveInlineOptionKey(null);
    setInlineValues({});
    onSelectGuidedOption({
      ...opt,
      requiresInlineInput: false,
      nextMessage: combinedPrompt,
    });
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-6">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[82%] rounded-2xl rounded-tr-sm bg-indigo-600 text-white px-4 py-3 text-sm shadow-xs'
                  : 'flex-1 min-w-0 space-y-3'
              }
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <>
                  {msg.routedAgents && msg.routedAgents.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {msg.routedAgents.map((ag) => (
                        <span
                          key={ag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                          <span>{ag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 shadow-2xs">
                    <MarkdownReportView content={msg.content} />

                    {msg.generatedImageUrl && (
                      <div className="mt-4 space-y-2">
                        <img
                          src={msg.generatedImageUrl}
                          alt="Visualisasi AI POLARIS"
                          className="rounded-xl border border-slate-200 dark:border-slate-700 max-h-[460px] object-contain bg-slate-50"
                        />
                        <a
                          href={msg.generatedImageUrl}
                          download={`polaris-visual-${msg.id}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh Gambar</span>
                        </a>
                      </div>
                    )}

                    {/* Kartu Pilihan Interaktif (Guided Input ala Gemini/Claude) */}
                    {msg.guidedQuestion && msg.guidedQuestion.options.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          Pilih Langkah Lanjutan:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.guidedQuestion.options.map((opt) => {
                            const optionKey = `${msg.id}_${opt.id}`;
                            const isInlineOpen = activeInlineOptionKey === optionKey;
                            return (
                              <div key={opt.id} className={isInlineOpen ? 'sm:col-span-2 space-y-2' : ''}>
                                <button
                                  type="button"
                                  disabled={sending}
                                  onClick={() => {
                                    if (opt.requiresInlineInput) {
                                      setActiveInlineOptionKey(isInlineOpen ? null : optionKey);
                                      setInlineValues({});
                                    } else {
                                      onSelectGuidedOption(opt);
                                    }
                                  }}
                                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${opt.recommended
                                    ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70'
                                    : isInlineOpen
                                      ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
                                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-900/50'
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                      {opt.requiresUpload && <UploadCloud className="h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                                      {opt.requiresLibraryPick && <FolderOpen className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                                      {opt.requiresInlineInput && <PencilLine className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                      {opt.recommended && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                                      <span>{opt.label}</span>
                                    </span>
                                  </div>
                                  {opt.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                      {opt.description}
                                    </p>
                                  )}
                                </button>

                                {isInlineOpen && opt.inlineInputFields && opt.inlineInputFields.length > 0 && (
                                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-slate-50 dark:bg-slate-900/80 space-y-2.5">
                                    {opt.inlineInputTitle && (
                                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                        {opt.inlineInputTitle}
                                      </div>
                                    )}
                                    {opt.inlineInputFields.map((field) => (
                                      <div key={field.key} className="space-y-1">
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                          {field.label}
                                        </label>
                                        {field.multiline ? (
                                          <textarea
                                            rows={2}
                                            value={inlineValues[field.key] || ''}
                                            onChange={(e) =>
                                              setInlineValues((prev) => ({
                                                ...prev,
                                                [field.key]: e.target.value,
                                              }))
                                            }
                                            placeholder={field.placeholder}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                        ) : (
                                          <input
                                            type="text"
                                            value={inlineValues[field.key] || ''}
                                            onChange={(e) =>
                                              setInlineValues((prev) => ({
                                                ...prev,
                                                [field.key]: e.target.value,
                                              }))
                                            }
                                            placeholder={field.placeholder}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                        )}
                                      </div>
                                    ))}
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setActiveInlineOptionKey(null)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        type="button"
                                        disabled={
                                          sending ||
                                          !opt.inlineInputFields.some((f) => (inlineValues[f.key] || '').trim())
                                        }
                                        onClick={() => handleSubmitInlineOption(opt)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                                      >
                                        <Send className="h-3 w-3" />
                                        <span>Kirim Data &amp; Analisis</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sitasi */}
                    {msg.usedCitations && msg.usedCitations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                        {msg.usedCitations.map((c, idx) => (
                          <span
                            key={`${c.code}_${idx}`}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                          >
                            [{c.code}] {c.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar di bawah jawaban asisten */}
                  {!msg.guidedQuestion && (
                    <div className="flex flex-wrap items-center gap-2 px-1">
                      <button
                        type="button"
                        onClick={() => onCopyMessage(msg)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Salin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSaveAsNote(msg)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                      >
                        <BookmarkPlus className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Simpan ke Catatan</span>
                      </button>

                      {msg.detectedMode !== 'ARTICLE' && (
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => onFollowUpAction(msg, 'ARTICLE')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer disabled:opacity-50"
                        >
                          <FileText className="h-3.5 w-3.5 text-sky-500" />
                          <span>Jadikan Rilis Media</span>
                        </button>
                      )}

                      {!msg.generatedImageUrl && (
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => onFollowUpAction(msg, 'IMAGE')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-purple-300 hover:text-purple-600 cursor-pointer disabled:opacity-50"
                        >
                          <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
                          <span>Buat Infografis</span>
                        </button>
                      )}

                      {msg.content.includes('|') && (
                        <button
                          type="button"
                          onClick={() => onExportCsv(msg.content)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                        >
                          <Table2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Ekspor Tabel CSV</span>
                        </button>
                      )}

                      {msg.linkedActions?.map((act, i) =>
                        act.href ? (
                          <Link
                            key={`${act.kind}_${i}`}
                            href={act.href}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>{act.label}</span>
                          </Link>
                        ) : null
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3 text-xs font-semibold text-slate-500">
              {getContextualLoadingText(activeMode, unitName)}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

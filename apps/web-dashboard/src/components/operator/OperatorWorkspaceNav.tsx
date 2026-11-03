'use client';

import React from 'react';
import {
  Sparkles,
  BookOpen,
  Database,
  User,
  FileText,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { OperatorTabType } from './types';

interface OperatorWorkspaceNavProps {
  activeTab: OperatorTabType;
  setActiveTab: (tab: OperatorTabType) => void;
  articlesCount: number;
  activeBriefsCount?: number;
}

export function OperatorWorkspaceNav({
  activeTab,
  setActiveTab,
  articlesCount,
  activeBriefsCount = 0,
}: OperatorWorkspaceNavProps) {
  return (
    <div className="flex items-center space-x-2 border-t border-slate-200/80 dark:border-slate-800/80 pt-3 overflow-x-auto scrollbar-none pb-1 max-w-full">
      <button
        type="button"
        onClick={() => setActiveTab('CONTENT')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'CONTENT'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Pabrik Konten & Visual AI</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('BRIEFS')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'BRIEFS'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>Request & Diskusi WA</span>
        {activeBriefsCount > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'BRIEFS'
                ? 'bg-white text-emerald-700'
                : 'bg-emerald-500 text-white animate-pulse'
            }`}
          >
            {activeBriefsCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('ARTICLES')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'ARTICLES'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Arsip & Draf Naskah ({articlesCount})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('KNOWLEDGE')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'KNOWLEDGE'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Database className="w-3.5 h-3.5" />
        <span>Bank Dokumen & AI</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('PROFILE')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'PROFILE'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Profil & Branding Tokoh</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('ASPIRASI')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'ASPIRASI'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Aspirasi Warga</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('COMMENTS')}
        className={`shrink-0 whitespace-nowrap flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
          activeTab === 'COMMENTS'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Moderasi Komentar</span>
      </button>
    </div>
  );
}


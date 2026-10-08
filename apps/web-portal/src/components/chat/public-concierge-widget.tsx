'use client';

import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    Bot,
    ChevronDown,
    ExternalLink,
    RotateCcw,
    Send,
    ShieldCheck,
    Sparkles,
    Tag,
    UserPlus,
    X,
} from 'lucide-react';
import { sendPublicChatMessage } from '@/lib/api';
import type { PublicChatMessageTurn } from '@/lib/api';
import { ConciergeAvatarLauncher } from './concierge-avatar-launcher';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    suggestedAction?: 'VIEW_PRICING' | 'REGISTER' | 'NONE';
}

const STORAGE_KEY = 'polaris_landing_concierge_chat_v1';
const INITIAL_GREETING: ChatMessage = {
    id: 'greeting',
    role: 'assistant',
    content: 'Halo, saya asisten AI POLARIS. Saya bisa membantu menjelaskan fitur, keamanan, dan paket lisensi.',
};
const ICEBREAKERS = [
    { label: 'Fitur utama', prompt: 'Apa saja fitur utama POLARIS?' },
    { label: 'Paket lisensi', prompt: 'Berapa harga paket lisensi?' },
    { label: 'Keamanan data', prompt: 'Bagaimana perlindungan data di POLARIS?' },
    { label: 'Pengadaan SPK', prompt: 'Apakah tersedia pengadaan melalui SPK?' },
];
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

function readSavedMessages(): ChatMessage[] {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (!saved) return [INITIAL_GREETING];

        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.length === 0) return [INITIAL_GREETING];

        const validMessages = parsed.filter(
            (message): message is ChatMessage =>
                message !== null &&
                typeof message === 'object' &&
                typeof message.id === 'string' &&
                (message.role === 'user' || message.role === 'assistant') &&
                typeof message.content === 'string' &&
                (message.suggestedAction === undefined ||
                    message.suggestedAction === 'VIEW_PRICING' ||
                    message.suggestedAction === 'REGISTER' ||
                    message.suggestedAction === 'NONE')
        );
        return validMessages.length ? validMessages.slice(-40) : [INITIAL_GREETING];
    } catch {
        return [INITIAL_GREETING];
    }
}

export function PublicConciergeWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [failedMessage, setFailedMessage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const launcherRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMessages(readSavedMessages());
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady) return;
        try {
            if (messages.length > 1) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            else sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Storage can be unavailable in private browsing; chat remains usable in memory.
        }
    }, [isReady, messages]);

    useEffect(() => {
        if (!isOpen) return;
        const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeWidget();
                return;
            }

            if (event.key !== 'Tab' || !panelRef.current) return;
            const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
            ));
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' });
    }, [isOpen, loading, messages]);

    function closeWidget() {
        setIsOpen(false);
        window.requestAnimationFrame(() => launcherRef.current?.focus());
    }

    function resetChat() {
        setMessages([INITIAL_GREETING]);
        setInputMessage('');
        setErrorMessage(null);
        setFailedMessage(null);
        try {
            sessionStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore unavailable session storage.
        }
    }

    async function sendMessage(candidate = inputMessage, isRetry = false) {
        const text = candidate.trim().slice(0, 250);
        if (!text || loading) return;

        setInputMessage('');
        setErrorMessage(null);
        setFailedMessage(null);
        const userMessage: ChatMessage | null = isRetry ? null : {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
        };
        const previousMessages = messages;
        if (userMessage) setMessages((current) => [...current, userMessage]);
        setLoading(true);

        const historySource = isRetry && previousMessages.at(-1)?.role === 'user' && previousMessages.at(-1)?.content === text
            ? previousMessages.slice(0, -1)
            : previousMessages;
        const history: PublicChatMessageTurn[] = historySource
            .filter((message) => message.id !== INITIAL_GREETING.id)
            .slice(-3)
            .map(({ role, content }) => ({ role, content: content.slice(0, 250) }));

        try {
            const response = await sendPublicChatMessage({ message: text, history });
            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: response.reply,
                    suggestedAction: response.suggestedAction,
                },
            ]);
        } catch (error: unknown) {
            setErrorMessage(error instanceof Error ? error.message : 'Gagal menghubungi asisten POLARIS.');
            setFailedMessage(text);
        } finally {
            setLoading(false);
        }
    }

    function handleAction(action: ChatMessage['suggestedAction']) {
        if (action === 'VIEW_PRICING') {
            const pricingSection = document.getElementById('pricing');
            closeWidget();
            if (pricingSection) {
                const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                pricingSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
            } else window.location.assign('/pricing');
        } else if (action === 'REGISTER') {
            window.location.assign('/pricing');
        }
    }

    return (
        <div
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && isOpen) closeWidget();
            }}
            className={isOpen
                ? 'fixed inset-0 z-50 flex items-end justify-end bg-slate-950/45 sm:inset-auto sm:bottom-6 sm:right-6 sm:bg-transparent'
                : 'fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6'}>
            {!isOpen ? (
                <ConciergeAvatarLauncher
                    isOpen={isOpen}
                    onToggle={() => setIsOpen(true)}
                    buttonRef={launcherRef}
                />
            ) : (
                <section
                    ref={panelRef}
                    id="public-concierge-panel"
                    aria-label="POLARIS Concierge"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="public-concierge-title"
                    className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f7f9fc] pb-[env(safe-area-inset-bottom)] shadow-2xl sm:h-[min(42rem,calc(100dvh-3rem))] sm:w-[min(26rem,calc(100vw-2rem))] sm:rounded-lg sm:border sm:border-slate-200"
                >
                    <header className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-[#10243b] px-4 py-4 text-white sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-blue-100">
                                <Bot aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 id="public-concierge-title" className="truncate text-[15px] font-semibold">POLARIS Concierge</h2>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
                                    <span className="rounded bg-blue-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-100">AI</span>
                                    Informasi produk POLARIS
                                </p>
                            </div>
                        </div>
                        <div className="ml-2 flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={resetChat}
                                aria-label="Hapus percakapan dan mulai ulang"
                                title="Hapus percakapan"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={closeWidget}
                                aria-label="Tutup chat"
                                title="Tutup"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                            >
                                <ChevronDown aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    {errorMessage && (
                        <div role="alert" className="flex shrink-0 items-start gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
                            <span className="mt-0.5 flex-1">{errorMessage}</span>
                            {failedMessage && (
                                <button
                                    type="button"
                                    onClick={() => void sendMessage(failedMessage, true)}
                                    className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
                                >
                                    Coba lagi
                                </button>
                            )}
                            <button type="button" onClick={() => { setErrorMessage(null); setFailedMessage(null); }} aria-label="Tutup pesan error" className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-amber-100">
                                <X aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div
                        className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5"
                    >
                        {messages.length === 1 && (
                            <div className="mb-1 border-b border-slate-200 pb-5">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-800">Selamat datang</p>
                                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-slate-600">
                                    Mulai dari topik yang ingin Anda ketahui. Jawaban dibatasi pada informasi produk POLARIS.
                                </p>
                            </div>
                        )}
                        {messages.map((message) => {
                            const isUser = message.role === 'user';
                            return (
                                <div key={message.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                    <span className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${isUser ? 'mr-1 text-slate-500' : 'ml-1 text-slate-500'}`}>
                                        {isUser ? 'Anda' : 'POLARIS AI'}
                                    </span>
                                    <p className={`max-w-[90%] whitespace-pre-wrap break-words rounded-lg px-3.5 py-3 text-[13px] leading-[1.65] shadow-sm sm:text-sm ${isUser ? 'rounded-br-sm bg-[#173b65] text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'}`}>
                                        {message.content}
                                    </p>
                                    {!isUser && message.suggestedAction === 'VIEW_PRICING' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAction('VIEW_PRICING')}
                                            className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-left text-xs font-semibold text-blue-900 transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
                                        >
                                            <Tag aria-hidden="true" className="h-4 w-4 shrink-0" />
                                            <span>Lihat paket dan harga</span>
                                            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                                        </button>
                                    )}
                                    {!isUser && message.suggestedAction === 'REGISTER' && (
                                        <button
                                            type="button"
                                            onClick={() => handleAction('REGISTER')}
                                            className="mt-2 inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
                                        >
                                            <UserPlus aria-hidden="true" className="h-4 w-4 shrink-0" />
                                            <span>Lanjut ke pendaftaran</span>
                                            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex items-center gap-2.5 text-xs text-slate-600" role="status">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700 motion-reduce:animate-none" />
                                <span>Asisten AI sedang menyusun jawaban</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length <= 1 && (
                        <div className="shrink-0 px-4 pb-4 sm:px-5">
                            <div className="grid grid-cols-2 gap-2">
                                {ICEBREAKERS.map(({ label, prompt }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => void sendMessage(prompt)}
                                        disabled={loading}
                                        className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-snug text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 disabled:opacity-50"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            void sendMessage();
                        }}
                        className="shrink-0 border-t border-slate-200 bg-white px-4 pb-3 pt-3 sm:px-5"
                    >
                        <div className="flex items-center gap-2">
                            <label className="sr-only" htmlFor="public-concierge-input">Ketik pertanyaan tentang produk POLARIS</label>
                            <div className="relative min-w-0 flex-1">
                                <input
                                    ref={inputRef}
                                    id="public-concierge-input"
                                    type="text"
                                    maxLength={250}
                                    autoComplete="off"
                                    value={inputMessage}
                                    onChange={(event) => setInputMessage(event.target.value)}
                                    placeholder="Tulis pertanyaan produk..."
                                    className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-14 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                                />
                                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums ${inputMessage.length > 220 ? 'text-amber-700' : 'text-slate-500'}`}>
                                    {inputMessage.length}/250
                                </span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !inputMessage.trim()}
                                aria-label="Kirim pertanyaan"
                                title="Kirim"
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                <Send aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-2.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                            <ShieldCheck aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <span>Jangan kirim kata sandi, kode OTP, atau data pribadi warga. Pesan dikirim ke layanan AI untuk dijawab.</span>
                        </p>
                    </form>
                </section>
            )}
        </div>
    );
}
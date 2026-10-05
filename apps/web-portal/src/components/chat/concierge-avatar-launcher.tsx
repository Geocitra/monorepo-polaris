import Image from 'next/image';
import type { Ref } from 'react';
import { getLandingMediaUrl } from '@/lib/landing-media';

interface ConciergeAvatarLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}

const IDLE_IMAGE_SRC = getLandingMediaUrl('/images/concierge/avatar-idle.webp');
const HOVER_IMAGE_SRC = getLandingMediaUrl('/images/concierge/avatar-hover.webp');

export function ConciergeAvatarLauncher({
  isOpen,
  onToggle,
  buttonRef,
}: ConciergeAvatarLauncherProps) {
  if (isOpen) return null;

  return (
    <div className="group relative">
      <button
        ref={buttonRef}
        id="public-concierge-launcher"
        type="button"
        onClick={onToggle}
        aria-label="Tanya POLARIS Concierge"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="public-concierge-panel"
        className="relative block h-36 w-28 sm:h-44 sm:w-36 cursor-pointer rounded-2xl transition-transform hover:-translate-y-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none drop-shadow-xl"
      >
        <span className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl transition-colors group-hover:bg-blue-400/35" />
        <span className="absolute inset-0 overflow-hidden">
          <Image
            src={IDLE_IMAGE_SRC}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 120px, 160px"
            className="object-contain object-bottom transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
          />
          <Image
            src={HOVER_IMAGE_SRC}
            alt=""
            fill
            sizes="(max-width: 640px) 120px, 160px"
            className="object-contain object-bottom opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          />
        </span>
        <span className="absolute bottom-3 right-2 h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full border-2 border-white bg-emerald-500 shadow-md ring-2 ring-emerald-400/30" />
        <span className="sr-only">Tanya POLARIS, Asisten AI produk</span>
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        Tanya POLARIS
      </span>
    </div>
  );
}

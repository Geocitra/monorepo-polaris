'use client';

interface PolarisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PolarisLogo({ className = '', size = 'md' }: PolarisLogoProps) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Polaris Star Logo from favicon-1024x1024.png */}
      <img
        src="/logo.png"
        alt="POLARIS"
        className={`${iconSizes[size]} shrink-0 object-contain rounded-lg`}
      />

      <span
        className={`${textSizes[size]} font-black tracking-widest text-slate-900 dark:text-white uppercase font-sans`}
      >
        POLARIS
      </span>
    </div>
  );
}

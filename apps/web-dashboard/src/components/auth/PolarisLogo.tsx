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
      {/* Icon stylized "P" matching the reference screenshot */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="44" height="44" rx="10" fill="none" />
        {/* Navy Primary Backbone of P */}
        <path
          d="M11 9C11 7.89543 11.8954 7 13 7H23.5C28.1944 7 32 10.8056 32 15.5C32 20.1944 28.1944 24 23.5 24H18.5V36C18.5 37.1046 17.6046 38 16.5 38H13C11.8954 38 11 37.1046 11 36V9Z"
          fill="#1D4ED8"
        />
        {/* Cyan Fold Accent */}
        <path
          d="M18.5 13H23.5C24.8807 13 26 14.1193 26 15.5C26 16.8807 24.8807 18 23.5 18H18.5V13Z"
          fill="#06B6D4"
        />
        {/* Dynamic Light Beam / Spark */}
        <circle cx="28" cy="27" r="3.5" fill="#38BDF8" />
      </svg>

      <span
        className={`${textSizes[size]} font-black tracking-widest text-slate-900 dark:text-white uppercase font-sans`}
      >
        POLARIS
      </span>
    </div>
  );
}

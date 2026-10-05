'use client';

const institutions = [
  {
    name: 'DPR RI',
    sub: 'Dewan Perwakilan Rakyat',
    target: 'solusi-dpr',
    icon: (
      <svg className="h-7 w-7 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'KEMENTERIAN DALAM NEGERI',
    sub: 'Republik Indonesia',
    target: 'solusi-pemda',
    icon: (
      <svg className="h-7 w-7 text-blue-800" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
  },
  {
    name: 'BAPPENAS',
    sub: 'Kementerian PPN',
    target: 'solusi-pemda',
    icon: (
      <svg className="h-7 w-7 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
      </svg>
    ),
  },
  {
    name: 'PEMERINTAH PROVINSI',
    sub: 'Pemerintah Daerah Tk. I',
    target: 'solusi-dprd',
    icon: (
      <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
  },
  {
    name: 'PEMERINTAH KABUPATEN / KOTA',
    sub: 'Pemerintah Daerah Tk. II',
    target: 'solusi-dprd',
    icon: (
      <svg className="h-7 w-7 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-5.16z"/>
      </svg>
    ),
  },
  {
    name: 'LEMBAGA NEGARA LAINNYA',
    sub: 'Komisi & Badan Publik',
    target: 'solusi',
    icon: (
      <svg className="h-7 w-7 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    ),
  },
];

export function InstitutionTrustBar() {
  const handleClick = (targetId: string) => {
    const el = document.getElementById(targetId) || document.getElementById('solusi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="border-t border-b border-slate-200/80 bg-white/70 backdrop-blur-sm py-10 mb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* HEADER TEKS */}
          <div className="lg:max-w-xs text-center lg:text-left shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 block mb-1">
              Standar Komunikasi Publik
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
              Dipercaya oleh berbagai institusi dan pemangku kepentingan publik
            </h4>
          </div>

          {/* EMBLEMS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 w-full items-center">
            {institutions.map((inst, idx) => (
              <button 
                key={idx}
                onClick={() => handleClick(inst.target)}
                className="flex flex-col items-center justify-center text-center space-y-1.5 p-2 rounded-xl hover:bg-blue-50/60 hover:scale-105 transition-all group cursor-pointer"
                title={`Pelajari solusi untuk ${inst.name}`}
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center p-1.5 group-hover:bg-white group-hover:shadow-md transition-all shadow-xs">
                  {inst.icon}
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-slate-800 block tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {inst.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium block">
                    {inst.sub}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

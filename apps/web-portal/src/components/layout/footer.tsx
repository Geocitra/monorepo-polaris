interface FooterProps {
  officialName: string;
  dapilName: string;
  partyAffiliation: string;
}

export function Footer({ officialName, dapilName, partyAffiliation }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-semibold text-gray-800">{officialName}</p>
        <p className="mt-1 text-xs">
          Wakil Rakyat Terpilih Daerah Pemilihan {dapilName} • Fraksi {partyAffiliation}
        </p>
        <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Portal Transparansi Kinerja & Layanan Konstituen • Ditenagai oleh POLARIS Engine
        </div>
      </div>
    </footer>
  );
}

import { notFound } from 'next/navigation';
import { fetchPortalData } from '@/lib/api';
import { TEMPLATE_DEFAULT_COLORS } from '@polaris/shared-types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) {
    notFound();
  }

  const { theme } = portalData;
  const tplDefault = (TEMPLATE_DEFAULT_COLORS as any)[theme.layoutTemplateId] || {
    primary: '#1890FF',
    secondary: '#001529',
  };
  const primaryColor = theme.primaryHexColor || tplDefault.primary;

  // Custom theme mode is only applied when the user's color explicitly differs from the template's default
  const isCustomColor = Boolean(
    theme.primaryHexColor &&
    theme.primaryHexColor.toLowerCase() !== tplDefault.primary.toLowerCase()
  );

  return (
    <div
      data-polaris-theme={isCustomColor ? 'custom' : 'default'}
      suppressHydrationWarning
      style={
        {
          '--portal-primary': primaryColor,
          '--portal-secondary': theme.secondaryHexColor || tplDefault.secondary,
          '--portal-font': theme.fontFamily || 'Inter, sans-serif',
        } as React.CSSProperties
      }
      className="flex min-h-screen flex-col relative"
    >
      <main className="flex-1">{children}</main>
    </div>
  );
}

'use client';

import React from 'react';
import { TemplateLayoutSelector } from '../TemplateLayoutSelector';

interface ThemeTemplatesSectionProps {
  layoutTemplateId: string;
  onLayoutTemplateIdChange?: (val: string) => void;
  planTier?: string | null;
}

export function ThemeTemplatesSection({
  layoutTemplateId,
  onLayoutTemplateIdChange,
  planTier,
}: ThemeTemplatesSectionProps) {
  return (
    <div className="space-y-4">
      <TemplateLayoutSelector
        selectedTemplateId={layoutTemplateId}
        onSelectTemplate={(templateId: string) => onLayoutTemplateIdChange?.(templateId)}
        planTier={planTier}
      />
    </div>
  );
}

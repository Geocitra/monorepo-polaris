import { SetMetadata } from '@nestjs/common';

export const SKIP_RLS_CONTEXT_KEY = 'skipRlsContext';

export const SkipRlsContext = () => SetMetadata(SKIP_RLS_CONTEXT_KEY, true);
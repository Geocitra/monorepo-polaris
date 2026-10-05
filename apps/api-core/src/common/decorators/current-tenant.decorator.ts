import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedTenantPayload {
  tenantId: string;
  email: string;
  subdomainSlug: string;
}

export const CurrentTenant = createParamDecorator(
  (data: keyof AuthenticatedTenantPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedTenantPayload;
    return data ? user?.[data] : user;
  }
);

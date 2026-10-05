import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedCitizenPayload {
  citizenId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export const CurrentCitizen = createParamDecorator(
  (data: keyof AuthenticatedCitizenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const citizen = request.citizen as AuthenticatedCitizenPayload;
    return data ? citizen?.[data] : citizen;
  }
);

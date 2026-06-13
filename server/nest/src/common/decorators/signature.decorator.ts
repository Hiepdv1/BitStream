import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SignatureGuard } from 'src/app/guards/signature/signature.guard';

export const REQUIRE_SIGNATURE_KEY = 'require-signature';

export const RequireSignature = () => applyDecorators(
  SetMetadata(REQUIRE_SIGNATURE_KEY, true),
  UseGuards(SignatureGuard)
);

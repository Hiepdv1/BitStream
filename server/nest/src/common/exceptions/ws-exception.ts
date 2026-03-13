import { WsException } from '@nestjs/websockets';

export interface WsErrorPayload {
  status: number;
  message: string;
  errors?: any;
}

export class WsBaseException extends WsException {
  constructor(payload: WsErrorPayload) {
    super(payload);
  }
}

export class WsBadRequestException extends WsBaseException {
  constructor(message = 'Bad request', errors?: any) {
    super({
      status: 400,
      message,
      errors,
    });
  }
}

export class WsUnauthorizedException extends WsBaseException {
  constructor(message = 'Unauthorized', errors?: any) {
    super({
      status: 401,
      message,
      errors,
    });
  }
}

export class WsForbiddenException extends WsBaseException {
  constructor(message = 'Forbidden', errors?: any) {
    super({
      status: 403,
      message,
      errors,
    });
  }
}

export class WsNotFoundException extends WsBaseException {
  constructor(message = 'Not found', errors?: any) {
    super({
      status: 404,
      message,
      errors,
    });
  }
}

export class WsInternalServerErrorException extends WsBaseException {
  constructor(message = 'Internal server error', errors?: any) {
    super({
      status: 500,
      message,
      errors,
    });
  }
}

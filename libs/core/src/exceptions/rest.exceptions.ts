import { Response } from "express";

export class BaseException extends Error {
  constructor(public code: number, public message: string) {
    super(message);
  }
  send(resp: Response): void {
    if (resp) {
      resp.status(this.code).send({
        success: false,
        error: this.message,
      });
    }
  }
}

export class BadRquestException extends BaseException {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(401, message);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string) {
    super(404, message);
  }
}

export class MethodNotAllowedException extends BaseException {
  constructor(message: string) {
    super(405, message);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string) {
    super(409, message);
  }
}

export class PayloadToLargeException extends BaseException {
  constructor(message: string) {
    super(413, message);
  }
}

export class UnsupportedMediaException extends BaseException {
  constructor(message: string) {
    super(413, message);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message: string) {
    super(500, message);
  }
}
import { validate } from "class-validator";

export class BaseDTO {
  constructor(data?: any) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }
  async validate(): Promise<boolean> {
    const errors = await validate(this);
    if (!errors.length) {
      return true;
    }
    throw new Error(
      errors
        .map(
          (err) =>
            `Validation Error(Property: ${err.property}): ${err.toString()}`
        )
        .join("\n")
    );
  }
}

export interface PubSubPayload<T> {
  requestId: string;
  data: T;
}

export interface PubSubResponse<T> {
  requestId: string;
  data: T;
}

export interface PubSubErrorResponse {
  requestId: string;
  error: Error;
}
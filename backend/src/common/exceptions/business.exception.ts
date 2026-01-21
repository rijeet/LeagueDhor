import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: number = 400) {
    super(
      {
        status: 'error',
        message,
        statusCode,
      },
      statusCode,
    );
  }
}

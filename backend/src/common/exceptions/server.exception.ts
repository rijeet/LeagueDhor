import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerException extends HttpException {
  constructor(message: string = 'Internal server error', statusCode: number = 500) {
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

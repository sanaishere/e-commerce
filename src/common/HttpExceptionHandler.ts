import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { sendResponse } from './sendResponse';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    console.log("exception:",exception)
    const responseToSend=sendResponse({error_code:status,
        error_message:exception.message,
        errors:exception['response']},"")
        console.log("response",responseToSend)
    response
      .status(status)
      .send(responseToSend)
  }
}
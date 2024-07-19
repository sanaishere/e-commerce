import { ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { sendResponse } from './sendResponse';
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();
    const errors = exception.getResponse()
    console.log(errors)
    console.log(exception)
    const responseToSend=sendResponse({error_code:400,
        error_message:errors['message'],
        errors:errors['error']},"")
    response
      .status(400)
      .send(responseToSend)
   
  }
}
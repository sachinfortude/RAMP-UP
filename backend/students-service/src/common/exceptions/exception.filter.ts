import {
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name); // Logger instance

  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    // Log the error details
    this.logger.error(
      `Exception thrown: ${exception.message}`,
      exception.stack,
    );

    // If it's an HTTP Exception, return it directly
    if (exception instanceof HttpException) {
      return exception;
    }

    // Return a generic internal server error for unknown exceptions
    return new InternalServerErrorException('Internal Server Error');
  }
}

import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import * as _ from 'lodash';

interface ValidationResponse {
  data: Record<string, unknown>;
}

@Catch(BadRequestException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = ctx.getResponse<Response>();
    let statusCode = exception.getStatus();
    const r = <any>exception.getResponse();

    if (_.isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      const validationErrors = <ValidationError[]>r.message;
      this._validationFilter(validationErrors);
    }
    const formattedErrors = this.formatErrors(r.message);
    r.statusCode = statusCode;
    r.error = STATUS_CODES[statusCode];
    console.log('formattedErrors', formattedErrors);

    throw response.status(statusCode).json(formattedErrors);
  }

  private _validationFilter(validationErrors: ValidationError[]) {
    for (const validationError of validationErrors) {
      for (const [constraintKey, constraint] of Object.entries(
        validationError.constraints,
      )) {
        if (!constraint) {
          validationError.constraints[constraintKey] =
            'error.fields.' + _.snakeCase(constraintKey);
        }
      }
      if (!_.isEmpty(validationError.children)) {
        this._validationFilter(validationError.children);
      }
    }
  }

  private formatErrors(errors: ValidationError[]): ValidationResponse {
    const errMsg = {};
    if (_.isArray(errors) && errors.length === 0) {
      errors.forEach((error: ValidationError) => {
        errMsg[error.property] = error.children.length
          ? [this.formatErrors(error.children)]
          : [...Object.values(error.constraints)];
      });
      const formattedErrors = {
        data: errMsg,
      };
      return formattedErrors;
    } else if (!_.isEmpty(errors)) {
      if (errors[0].constraints) {
        for (const [key, value] of Object.entries(errors[0].constraints)) {
          errMsg[key] = value;
        }
      } else {
        errMsg['message'] = errors;
      }
      return { data: errMsg };
    } else {
      return { data: {} };
    }
  }
}

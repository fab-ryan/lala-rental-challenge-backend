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
  
      throw response.status(statusCode).json(formattedErrors);
    }
  
    private _validationFilter(validationErrors: ValidationError[]) {
      for (const validationError of validationErrors) {
        for (const [constraintKey, constraint] of Object.entries(
          validationError.constraints,
        )) {
          if (!constraint) {
            // convert error message to error.fields.{key} syntax for i18n translation
            validationError.constraints[constraintKey] =
              'error.fields.' + _.snakeCase(constraintKey);
          }
        }
        if (!_.isEmpty(validationError.children)) {
          this._validationFilter(validationError.children);
        }
      }
    }
  
    private formatErrors(
      errors: ValidationError[],
      seen = new WeakSet<ValidationError>(),
    ): ValidationResponse {
      const errMsg = {};
  
      if (_.isArray(errors) && errors.length === 0) {
        errors.forEach((error: ValidationError) => {
          if (seen.has(error)) {
            return;
          }
          seen.add(error);
  
          if (error.constraints) {
            errMsg[error.property] = Object.values(error.constraints);
          } else if (error.children && error.children.length > 0) {
            errMsg[error.property] = this.formatErrors(error.children);
          } else {
            errMsg[error.property] = ['Unknown validation error'];
          }
        });
        const formattedErrors = {
          data: errMsg,
        };
        return formattedErrors;
      } else if (!_.isEmpty(errors)) {
        if (_.isString(errors)) {
          errMsg['error'] = errors;
          return {
            data: errMsg,
          };
        }
      } else {
        return { data: {} };
      }
    }
  }
  
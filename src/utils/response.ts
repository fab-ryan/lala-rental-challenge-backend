import { Injectable, Scope, Inject, HttpStatus } from '@nestjs/common';
import { ResponseDto } from './response.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PartialType } from '@nestjs/swagger';

export class IResponseData<T> {
  success = true;
  statusCode: number = HttpStatus.OK;
  data: T = null;
  path: any;
  method: string;
  requestId?: string;
  timestamp: number = Date.now();
  message: string;
  key?: string = 'data';
}

export class IRequest extends PartialType(IResponseData) {}

@Injectable({ scope: Scope.REQUEST | Scope.TRANSIENT | Scope.DEFAULT })
export class ResponseService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
  public Response(result: IRequest): ResponseDto {
    const { route, method } = this.request;
    const response: ResponseDto = {
      success: result.success,
      statusCode: result.statusCode,
      [result.key ?? 'data']: result.data,
      path: route.path,
      method: method,
      requestId: result.requestId,
      message: result.message,
      timestamp: new Date(Date.now()).toISOString(),
    };
    return response;
  }
}

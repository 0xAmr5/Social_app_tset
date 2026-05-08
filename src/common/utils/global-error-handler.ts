import type { Request, Response, NextFunction } from "express";

export class ErrorResponse extends Error {
  public statusCode: number;
  public message: any;
  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: number;
  }) {
    super(message);
    ((this.message = message), (this.statusCode = statusCode));
  }
}

export class appError extends ErrorResponse {
  public details?: unknown;

  constructor(message: string, detailsOrStatusCode: unknown = 500, statusCode?: number) {
    super({
      message,
      statusCode: typeof detailsOrStatusCode === "number" ? detailsOrStatusCode : statusCode ?? 500,
    });
    if (typeof detailsOrStatusCode !== "number") {
      this.details = detailsOrStatusCode;
    }
  }
}

export const globalErrorHandling = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err)
  const status = err.statusCode as number || 500 ;
  res.status(status).json({
    status,
    err: err.message,
    stack: err.stack,
  });
};

export const ErrorUnAuthorizedRequest = (
  message: string = "you are not authorized to access this page",
) => {
  throw new ErrorResponse({ message, statusCode: 401 });
};
export const Errorforbidden = (
  message: string = "forbidden response due to error when proccessing the request data",
) => {
  throw new ErrorResponse({ message, statusCode: 403 });
};
export const ErrorForbidden = Errorforbidden;
export const ErrorNotFound = (message: string = "failed to find the data") => {
  throw new ErrorResponse({ message, statusCode: 404 });
};
export const ErrorConflict = (message: string = "conflict") => {
  throw new ErrorResponse({ message, statusCode: 409 });
};
export const ErrorInteralServerError = (
  message: any,
  statusCode: number = 500,
) => {
  throw new ErrorResponse({ message, statusCode });
};

export const SuccessResponse = ({
  res,
  statusCode = 200,
  data,
}: {
  res: Response;
  statusCode?: number;
  data: any;
}) => {
  return res.status(statusCode).json(data);
};

export const globalErrorHandler = globalErrorHandling;

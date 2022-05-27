export abstract class AppException extends Error {
  abstract code: number;
  abstract httpCode: number;
  abstract message: string;
}
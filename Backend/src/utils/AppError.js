class AppError extends Error {
  constructor(arg1, arg2 = 500) {
    let statusCode;
    let message;

    if (typeof arg1 === "number") {
      statusCode = arg1;
      message = typeof arg2 === "string" ? arg2 : String(arg2 || "Internal Server Error");
    } else {
      message = typeof arg1 === "string" ? arg1 : "Internal Server Error";
      statusCode = typeof arg2 === "number" ? arg2 : 500;
    }

    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = null,
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = message;

        if (stack) {
            this.stack = stack;
        } else {
           Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };

class ApiError extends Error {
  statusCode: number
  data: null
  success: boolean
  errors: any[]

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: any[] = [],
    stack: string = '',
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  // Factory methods
  static badRequest(message: string, errors: any[] = []) {
    return new ApiError(400, message, errors)
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message)
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message)
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message)
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message)
  }
}

export default ApiError
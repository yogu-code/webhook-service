class ApiResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data: T

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode
    this.success = statusCode < 400
    this.message = message
    this.data = data
  }

  static success<T>(message: string, data: T, statusCode: number = 200) {
    return new ApiResponse(statusCode, message, data)
  }

  static created<T>(message: string, data: T) {
    return new ApiResponse(201, message, data)
  }
}

export default ApiResponse
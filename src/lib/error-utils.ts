interface ApiError {
  status: string;
  message: string;
  details?: string;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle API error response
    if ('status' in error && 'message' in error) {
      const apiError = error as ApiError;
      return apiError.details || apiError.message;
    }
    
    // Handle standard Error object
    if (error instanceof Error) {
      return error.message;
    }
  }
  
  return 'An unexpected error occurred';
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 'unauthorized';
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 'unprocessable_entity';
  }
  return false;
}

export function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    return apiError.status === 'not_found';
  }
  return false;
} 
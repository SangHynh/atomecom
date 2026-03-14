import axios from 'axios';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

/**
 * Maps backend validation errors to react-hook-form errors.
 * Assumes the error structure is:
 * {
 *   message: 'VALIDATION_ERROR',
 *   errors: [ { path: string | string[], message: string } ]
 * }
 */
export function handleBackendValidationError<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
) {
  if (
    axios.isAxiosError(error) &&
    error.response?.data?.message === 'VALIDATION_ERROR'
  ) {
    const backendErrors = error.response.data.errors || [];
    backendErrors.forEach((err: { path: string | string[]; message: string }) => {
      // Clean up the path (e.g., remove 'body.' prefix if present)
      const rawPath = Array.isArray(err.path)
        ? err.path.join('.')
        : (err.path as string);
      
      const path = rawPath.replace(/^body\./, '') as Path<T>;

      if (path) {
        form.setError(path, {
          type: 'manual',
          message: err.message,
        });
      }
    });
    return true;
  }
  return false;
}

import { toast } from 'sonner';
import { getErrorMessage, isUnauthorizedError, isValidationError } from '@/lib/error-utils';
import { useRouter } from 'next/navigation';

export function useErrorHandler() {
  const router = useRouter();

  const handleError = (error: unknown) => {
    const message = getErrorMessage(error);

    if (isUnauthorizedError(error)) {
      toast.error('Session expired. Please log in again.');
      router.push('/login');
      return;
    }

    if (isValidationError(error)) {
      toast.error(message);
      return;
    }

    // Default error toast
    toast.error(message);
  };

  return { handleError };
} 
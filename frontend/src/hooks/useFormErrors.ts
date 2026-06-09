import { useState, useCallback } from "react";

export function useFormErrors(initialFields: string[]) {

  const [errors, setErrors] = useState<Record<string, boolean>>(() => 
    initialFields.reduce((acc, field) => ({ ...acc, [field]: false }), {})
  );

  const setError = useCallback((field: string, hasError: boolean) => {
    setErrors(prev => ({ ...prev, [field]: hasError }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(prev => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach(key => { cleared[key] = false; });
      return cleared;
    });
  }, []);

  const hasAnyError = Object.values(errors).some(error => error === true);

  return { errors, setError, clearAllErrors, hasAnyError };
}
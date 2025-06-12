export interface PhoneValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateSpanishPhoneNumber = (
  phone: string
): PhoneValidationResult => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  if (!cleanPhone) {
    return {
      isValid: false,
      errorMessage: "Revise el número de teléfono",
    };
  }

  const spanishPhoneRegex = /^[6789]\d{8}$/;

  const internationalPlusRegex = /^\+\d{10,15}$/;

  const internationalDoubleZeroRegex = /^00\d{10,15}$/;

  if (spanishPhoneRegex.test(cleanPhone)) {
    return { isValid: true };
  }

  if (internationalPlusRegex.test(cleanPhone)) {
    return { isValid: true };
  }

  if (internationalDoubleZeroRegex.test(cleanPhone)) {
    return { isValid: true };
  }

  if (cleanPhone.length < 9) {
    return {
      isValid: false,
      errorMessage: "Revise el número de teléfono",
    };
  }

  if (/^\d+$/.test(cleanPhone) && cleanPhone.length === 9) {
    return {
      isValid: false,
      errorMessage: "Revise el número de teléfono",
    };
  }

  return {
    isValid: false,
    errorMessage: "Revise el número de teléfono",
  };
};

export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (/^[6789]\d{8}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  return phone;
};

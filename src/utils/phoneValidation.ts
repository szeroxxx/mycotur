export interface PhoneValidationResult {
  isValid: boolean;
  errorMessage?: string;
}


export const validateSpanishPhoneNumber = (phone: string): PhoneValidationResult => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!cleanPhone) {
    return {
      isValid: false,
      errorMessage: 'El número de teléfono es obligatorio'
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
      errorMessage: 'El número de teléfono debe tener al menos 9 dígitos'
    };
  }

  if (/^\d+$/.test(cleanPhone) && cleanPhone.length === 9) {
    return {
      isValid: false,
      errorMessage: 'Los números españoles deben comenzar con 6, 7, 8 o 9'
    };
  }

  return {
    isValid: false,
    errorMessage: 'Formato de teléfono no válido. Use: 9 dígitos (6/7/8/9XXXXXXXX), +código país número, o 00 código país número'
  };
};

export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (/^[6789]\d{8}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};

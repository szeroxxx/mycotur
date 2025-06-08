import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RSVPFormData {
  firstName: string;
  phoneNumber: string;
  email: string;
  numberOfPeople: string;
  message: string;
}

interface RSVPFormProps {
  onSubmit?: (data: RSVPFormData) => Promise<void>;
  onGetContactInfo?: () => void;
  error?: string | null;
}

const RSVPForm: React.FC<RSVPFormProps> = ({
  onSubmit,
  onGetContactInfo,
  error = null,
}) => {
  const [formData, setFormData] = useState<RSVPFormData>({
    firstName: "",
    phoneNumber: "",
    email: "",
    numberOfPeople: "1",
    message: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(error);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string | null;
  }>({});

  const validateFirstName = (name: string): string | null => {
    if (!name.trim()) {
      return "El nombre es obligatorio";
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return "El nombre solo debe contener letras y espacios";
    }
    if (name.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (name.trim().length > 50) {
      return "El nombre no debe exceder los 50 caracteres";
    }
    return null;
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone.trim()) {
      return "El número de teléfono es obligatorio";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return "El número de teléfono debe tener al menos 10 dígitos";
    }
    if (cleanPhone.length > 15) {
      return "El número de teléfono no debe exceder los 15 dígitos";
    }
    if (!/^[\d\s\-\(\)\+]+$/.test(phone)) {
      return "El número de teléfono contiene caracteres no válidos";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "El correo electrónico es obligatorio";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Por favor ingresa una dirección de correo electrónico válida";
    }
    if (email.length > 254) {
      return "La dirección de correo electrónico es demasiado larga";
    }
    return null;
  };

  const validateNumberOfPeople = (num: string): string | null => {
    if (!num.trim()) {
      return "El número de personas es obligatorio";
    }
    const number = parseInt(num);
    if (isNaN(number)) {
      return "Por favor ingresa un número válido";
    }
    if (number < 1) {
      return "El número de personas debe ser al menos 1";
    }
    if (number > 100) {
      return "El número de personas no puede exceder 100";
    }
    return null;
  };

  const validateMessage = (message: string): string | null => {
    if (message.length > 500) {
      return "El mensaje no debe exceder los 500 caracteres";
    }
    return null;
  };

  const validateField = (name: string, value: string) => {
    let error: string | null = null;

    switch (name) {
      case "firstName":
        error = validateFirstName(value);
        break;
      case "phoneNumber":
        error = validatePhoneNumber(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "numberOfPeople":
        error = validateNumberOfPeople(value);
        break;
      case "message":
        error = validateMessage(value);
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "firstName") {
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phoneNumber") {
      processedValue = value.replace(/[^\d\s\-\(\)\+]/g, "");
    } else if (name === "numberOfPeople") {
      processedValue = value.replace(/[^\d]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    validateField(name, processedValue);
    setSubmitError(null);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string | null } = {};
    let isValid = true;

    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) {
      errors.firstName = firstNameError;
      isValid = false;
    }

    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
      isValid = false;
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
      isValid = false;
    }

    const peopleError = validateNumberOfPeople(formData.numberOfPeople);
    if (peopleError) {
      errors.numberOfPeople = peopleError;
      isValid = false;
    }

    const messageError = validateMessage(formData.message);
    if (messageError) {
      errors.message = messageError;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (onSubmit) {
        await onSubmit(formData);
        setFormData({
          firstName: "",
          phoneNumber: "",
          email: "",
          numberOfPeople: "1",
          message: "",
        });
        setFieldErrors({});
      } else {
        console.log("No onSubmit prop provided");
      }
    } catch (error) {
      console.error("RSVPForm submission error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Error al enviar RSVP"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetContactInfo = () => {
    if (onGetContactInfo) {
      onGetContactInfo();
    }
  };
  return (
    <div className="w-full max-w-none lg:max-w-sm lg:mx-auto overflow-hidden">
      <div className="p-6 space-y-4 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Confirma tu asistencia ahora
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {" "}
          <div>
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Nombre *
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="P. ej. Pedro García"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.firstName && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors.firstName}
              </div>
            )}
          </div>{" "}
          <div>
            <Label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Número de Teléfono *
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="ingresa tu número de teléfono principal"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.phoneNumber && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors.phoneNumber}
              </div>
            )}
          </div>{" "}
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Correo electrónico *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.email && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors.email}
              </div>
            )}
          </div>{" "}
          <div>
            <Label
              htmlFor="numberOfPeople"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Número de participantes*
            </Label>
            <Input
              id="numberOfPeople"
              name="numberOfPeople"
              placeholder="1"
              className={`text-gray-600 w-full h-11 px-3 border rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center ${
                fieldErrors.numberOfPeople
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formData.numberOfPeople}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.numberOfPeople && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors.numberOfPeople}
              </div>
            )}
          </div>{" "}
          <div>
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              Comentarios
              <span className="text-xs text-gray-500 ml-2">
                ({formData.message.length}/500)
              </span>
            </Label>
            <textarea
              id="message"
              name="message"
              placeholder="Escribe un mensaje al organizador"
              rows={3}
              className={`text-gray-600 w-full px-3 py-3 border rounded-md text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                fieldErrors.message ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.message}
              onChange={handleInputChange}
            />
            {fieldErrors.message && (
              <div className="text-red-500 text-xs mt-1">
                {fieldErrors.message}
              </div>
            )}
          </div>
          {submitError && (
            <div className="text-red-500 text-sm mt-2">{submitError}</div>
          )}{" "}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Enviar RSVP"}
          </Button>
        </form>
      </div>{" "}
      <div className="mt-2 px-6 py-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-tight">
          Ver detalles del organizador y contactarlo para más información
        </h3>
        <Button
          variant="outline"
          className="w-full bg-gray-700 text-white hover:bg-gray-900 border-gray-800 py-3 font-medium rounded-md transition-colors"
          onClick={handleGetContactInfo}
        >
          Obtener información de contacto
        </Button>
      </div>
    </div>
  );
};

export default RSVPForm;

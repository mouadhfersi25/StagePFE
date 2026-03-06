// Fonctions de validation

export const validateEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string | undefined): boolean => {
  return !!password && password.length >= 6;
};

export const validateDate = (date: string | undefined): boolean => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate <= today && !isNaN(selectedDate.getTime());
};

export const validatePhone = (phone: string | undefined): boolean => {
  if (!phone) return true;
  const phoneRegex = /^[0-9]{8}$/;
  return phoneRegex.test(phone.trim());
};

export const validateName = (name: string | undefined): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 50;
};

export const validateLevel = (level: number | undefined): boolean => {
  return !!level && level >= 1 && level <= 100;
};

export const getValidationError = (field: string, value: unknown): string | null => {
  switch (field) {
    case "email":
      if (!value) return "Email requis";
      if (!validateEmail(value as string)) return "Format email invalide";
      return null;
    case "password":
      if (!value) return "Mot de passe requis";
      if (!validatePassword(value as string)) return "Le mot de passe doit contenir au moins 6 caractères";
      return null;
    case "nom":
    case "prenom":
      if (!value) return `${field === "nom" ? "Nom" : "Prénom"} requis`;
      if (!validateName(value as string)) return `${field === "nom" ? "Le nom" : "Le prénom"} doit contenir entre 2 et 50 caractères`;
      return null;
    case "dateDeNaissance":
      if (!value) return "Date de naissance requise";
      if (!validateDate(value as string)) return "Date invalide";
      return null;
    case "telephone":
      if (value && !validatePhone(value as string)) return "Le téléphone doit contenir 8 chiffres";
      return null;
    default:
      return null;
  }
};

// Validate email format
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate rating between 1 and 5
export const validateRating = (stars) => {
  return stars >= 1 && stars <= 5;
};

// Validate required field is not empty
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

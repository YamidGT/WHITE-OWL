const validateUNALEmail = (email) => {
  const unalEmailRegex = /^[a-zA-Z0-9._%+-]+@unal\.edu\.co$/;
  return unalEmailRegex.test(email);
};

const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateCoordinates = (coordinates) => {
  const { lng, lat } = coordinates;
  
  // Validar que las coordenadas estén dentro del campus UNAL
  const isValidLng = lng >= -74.095 && lng <= -74.070;
  const isValidLat = lat >= 4.625 && lat <= 4.645;
  
  return isValidLng && isValidLat;
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start < end;
};

module.exports = {
  validateUNALEmail,
  validatePassword,
  validateCoordinates,
  validateDateRange,
};

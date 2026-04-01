/**
 * Validates that day, month, and year are provided and valid
 * @param {string} day - Birth day (1-31)
 * @param {string} month - Birth month (1-12)
 * @param {string} year - Birth year (YYYY)
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateBirthDate = (day, month, year) => {
  // Check if day is provided
  if (!day || day === '') {
    return { isValid: false, error: 'Please enter your birth day.' };
  }

  // Check if month is provided
  if (!month || month === '') {
    return { isValid: false, error: 'Please enter your birth month.' };
  }

  // Check if year is provided
  if (!year || year === '') {
    return { isValid: false, error: 'Please enter your birth year.' };
  }

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // Validate month range
  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Please enter a valid birth month (1-12).' };
  }

  // Validate year range (reasonable bounds)
  const currentYear = new Date().getFullYear();
  if (yearNum < 1900 || yearNum > currentYear) {
    return { isValid: false, error: `Please enter a valid birth year (1900-${currentYear}).` };
  }

  // Validate day range based on month
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  if (dayNum < 1 || dayNum > daysInMonth) {
    return { isValid: false, error: `Please enter a valid day for the month (1-${daysInMonth}).` };
  }

  return { isValid: true, error: '' };
};

/**
 * Calculates the user's age based on birth day, month, and year
 * @param {number} day - Birth day (1-31)
 * @param {number} month - Birth month (1-12)
 * @param {number} year - Birth year (YYYY)
 * @returns {number} Age in years
 */
export const calculateAge = (day, month, year) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDay = today.getDate();

  let age = currentYear - year;

  // If birthday hasn't occurred yet this year, subtract 1
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }

  return age;
};

/**
 * Determines if a user is 18 or older
 * @param {number} day - Birth day (1-31)
 * @param {number} month - Birth month (1-12)
 * @param {number} year - Birth year (YYYY)
 * @returns {boolean} True if user is 18 or older
 */
export const isOver18 = (day, month, year) => {
  return calculateAge(day, month, year) >= 18;
};

/**
 * Creates a date string for storage
 * @param {number} day - Birth day (1-31)
 * @param {number} month - Birth month (1-12)
 * @param {number} year - Birth year (YYYY)
 * @returns {string} ISO date string
 */
export const createBirthDateString = (day, month, year) => {
  // Create a date with the specific birth day, month, and year
  return new Date(year, month - 1, day).toISOString();
};

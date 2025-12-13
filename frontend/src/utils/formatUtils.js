/**
 * formatUtils.js
 * Utility functions for formatting numbers and currencies.
 */

/**
 * Converts a number to a comma-separated string.
 * Example: 10000 -> "10,000"
 * @param {string|number} value - The raw number
 * @returns {string} Formatted string
 */
export const formatCurrency = (value) => {
  if (!value) return '';
  // Ensure it's a number and format it to locale string (e.g., "10,000")
  return Number(value).toLocaleString('ko-KR');
};

/**
 * Converts a comma-separated string back to a number.
 * Example: "10,000" -> 10000
 * @param {string} value - The formatted string
 * @returns {number} Raw number
 */
export const parseCurrency = (value) => {
  if (!value) return '';
  // Remove commas and parse as integer
  // Replace all commas globally
  return parseInt(value.toString().replace(/,/g, ''), 10);
};
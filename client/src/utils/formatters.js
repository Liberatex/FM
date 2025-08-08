// Currency formatting
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `$${parseFloat(amount).toFixed(2)}`;
  }
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  try {
    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
      
      case 'long':
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(dateObj);
      
      case 'time':
        return new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
      
      case 'datetime':
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
      
      case 'relative':
        return formatRelativeDate(dateObj);
      
      default: // medium
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(dateObj);
    }
  } catch (error) {
    // Fallback formatting
    return dateObj.toLocaleDateString();
  }
};

// Relative date formatting (e.g., "2 days ago", "yesterday")
export const formatRelativeDate = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

// Category formatting
export const formatCategory = (category) => {
  if (!category) return 'Uncategorized';

  // Convert category names to display format
  const categoryMap = {
    'food_dining': 'Food & Dining',
    'transportation': 'Transportation',
    'shopping': 'Shopping',
    'entertainment': 'Entertainment',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'housing': 'Housing',
    'utilities': 'Utilities',
    'insurance': 'Insurance',
    'investments': 'Investments',
    'salary': 'Salary',
    'freelance': 'Freelance',
    'business': 'Business',
    'other': 'Other'
  };

  return categoryMap[category.toLowerCase()] || category;
};

// Number formatting
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  } catch (error) {
    return parseFloat(number).toFixed(decimals);
  }
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber; // Return original if can't format
};

// Credit card number formatting
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';

  // Remove all non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Format as XXXX XXXX XXXX XXXX
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Social security number formatting
export const formatSSN = (ssn) => {
  if (!ssn) return '';

  // Remove all non-digits
  const cleaned = ssn.replace(/\D/g, '');
  
  // Format as XXX-XX-XXXX
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return ssn; // Return original if can't format
};

// Duration formatting
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  return `${remainingMinutes}m`;
};

// Temperature formatting
export const formatTemperature = (celsius, unit = 'C') => {
  if (celsius === null || celsius === undefined || isNaN(celsius)) {
    return '0°C';
  }

  if (unit === 'F') {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  
  return `${celsius.toFixed(1)}°C`;
};

// Distance formatting
export const formatDistance = (meters, unit = 'metric') => {
  if (meters === null || meters === undefined || isNaN(meters)) {
    return '0 m';
  }

  if (unit === 'imperial') {
    const feet = meters * 3.28084;
    if (feet >= 5280) {
      const miles = feet / 5280;
      return `${miles.toFixed(1)} mi`;
    }
    return `${feet.toFixed(0)} ft`;
  }
  
  if (meters >= 1000) {
    const kilometers = meters / 1000;
    return `${kilometers.toFixed(1)} km`;
  }
  
  return `${meters.toFixed(0)} m`;
};

// Weight formatting
export const formatWeight = (grams, unit = 'metric') => {
  if (grams === null || grams === undefined || isNaN(grams)) {
    return '0 g';
  }

  if (unit === 'imperial') {
    const pounds = grams * 0.00220462;
    if (pounds >= 1) {
      return `${pounds.toFixed(1)} lbs`;
    }
    const ounces = pounds * 16;
    return `${ounces.toFixed(1)} oz`;
  }
  
  if (grams >= 1000) {
    const kilograms = grams / 1000;
    return `${kilograms.toFixed(1)} kg`;
  }
  
  return `${grams.toFixed(0)} g`;
};

// Truncate text
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Format account number (mask sensitive data)
export const formatAccountNumber = (accountNumber, visibleDigits = 4) => {
  if (!accountNumber) return '';

  const cleaned = accountNumber.replace(/\D/g, '');
  const length = cleaned.length;
  
  if (length <= visibleDigits) {
    return cleaned;
  }
  
  const visible = cleaned.slice(-visibleDigits);
  const masked = '*'.repeat(length - visibleDigits);
  
  return `${masked}${visible}`;
};

// Format routing number
export const formatRoutingNumber = (routingNumber) => {
  if (!routingNumber) return '';

  const cleaned = routingNumber.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return routingNumber;
};

// Format IBAN
export const formatIBAN = (iban) => {
  if (!iban) return '';

  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const groups = cleaned.match(/.{1,4}/g);
  
  return groups ? groups.join(' ') : cleaned;
};

// Format SWIFT/BIC code
export const formatSWIFT = (swift) => {
  if (!swift) return '';

  return swift.toUpperCase();
};

export default {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatCategory,
  formatNumber,
  formatFileSize,
  formatPhoneNumber,
  formatCreditCard,
  formatSSN,
  formatDuration,
  formatTemperature,
  formatDistance,
  formatWeight,
  truncateText,
  capitalize,
  formatAccountNumber,
  formatRoutingNumber,
  formatIBAN,
  formatSWIFT
}; 
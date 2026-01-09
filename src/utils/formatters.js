// Convert date string to local date format
export const formatDate = (dateStr) => {
  if(!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
};

// Truncate string to max length with ellipsis
export const truncate = (str, len = 100) => {
  if(!str || str.length <= len) return str;
  return str.slice(0, len) + '...';
};

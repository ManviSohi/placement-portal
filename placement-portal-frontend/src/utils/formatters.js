// src/utils/formatters.js

// Format a salary range for display
// formatSalary(15000, 25000) → "₹15,000 – ₹25,000/month"
// formatSalary(null, null)   → "Salary not disclosed"
export const formatSalary = (min, max) => {
  if (!min && !max) return 'Salary not disclosed';

  const format = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  if (min && max) return `${format(min)} – ${format(max)}/month`;
  if (min) return `From ${format(min)}/month`;
  return `Up to ${format(max)}/month`;
};

// Format a date string for display
// formatDate("2024-12-31T00:00:00Z") → "Dec 31, 2024"
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Check if a deadline has passed
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate long strings for card previews
export const truncate = (str, maxLength = 150) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "pending":
      return "badge badge-yellow";
    case "reviewed":
      return "badge badge-blue";
    case "shortlisted":
      return "badge badge-purple";
    case "accepted":
      return "badge badge-green";
    case "rejected":
      return "badge badge-red";
    default:
      return "badge badge-gray";
  }
};
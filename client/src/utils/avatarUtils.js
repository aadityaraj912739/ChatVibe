// Generate a consistent color based on the first letter of a name
export const getAvatarColor = (name) => {
  if (!name) return '#6B7280'; // Default gray
  
  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#06B6D4', // Cyan
    '#F43F5E', // Rose
    '#A855F7', // Purple
    '#22C55E', // Green
    '#EAB308', // Yellow
    '#0EA5E9', // Sky
    '#D946EF', // Fuchsia
    '#FB923C', // Orange-400
    '#4ADE80', // Green-400
    '#60A5FA', // Blue-400
  ];
  
  // Get the first letter and convert to uppercase
  const firstLetter = name.charAt(0).toUpperCase();
  
  // Get character code and map to color index
  const charCode = firstLetter.charCodeAt(0);
  const colorIndex = charCode % colors.length;
  
  return colors[colorIndex];
};

// Get initials from name (first letter of first and last name, or just first letter)
export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Return first letter of first name and first letter of last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Check if a URL is a valid image URL (not a placeholder)
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a placeholder URL
  if (url.includes('placeholder') || url.includes('via.placeholder')) {
    return false;
  }
  
  return true;
};

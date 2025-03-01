
/**
 * Determines which admin tab is active based on the current path
 */
export const getCurrentTab = (path: string): string => {
  if (path.includes('/admin/users')) return 'users';
  if (path.includes('/admin/schedule')) return 'schedule';
  if (path.includes('/admin/gallery')) return 'gallery';
  if (path.includes('/admin/notices')) return 'notice';
  return 'content';
};

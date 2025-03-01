
/**
 * Determines which admin tab is active based on the current path
 */
export const getCurrentTab = (path: string): string => {
  if (path === '/admin/users' || path.includes('/admin/users/')) return 'users';
  if (path === '/admin/schedule' || path.includes('/admin/schedule/')) return 'schedule';
  if (path === '/admin/gallery' || path.includes('/admin/gallery/')) return 'gallery';
  if (path === '/admin/notices' || path.includes('/admin/notices/')) return 'notice';
  return 'content';
};

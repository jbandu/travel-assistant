/**
 * Admin Authorization Utilities
 * Check if users have admin privileges
 */

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin email addresses (hardcoded for security)
const ADMIN_EMAILS = [
  'jbandu@gmail.com',
  'arindam2808@gmail.com',
];

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: { email: true, role: true },
    });

    if (!user) return false;

    // Check if email is in admin list OR role is admin
    return ADMIN_EMAILS.includes(user.email.toLowerCase()) || user.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const user = await prisma.user.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) return null;

  const isAdminUser = ADMIN_EMAILS.includes(user.email.toLowerCase()) || user.role === 'admin';
  if (!isAdminUser) return null;

  return user;
}

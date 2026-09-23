import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import type { JwtPayload, UserRole } from '../types/index.js';

// Convert database uppercase Role enum to frontend Title Case role representation
export function formatRoleForFrontend(dbRole: string): 'Admin' | 'Charterer' | 'Analyst' {
  if (dbRole === 'ADMIN') return 'Admin';
  if (dbRole === 'ANALYST') return 'Analyst';
  return 'Charterer';
}

export const authService = {
  async login(credentials: { email: string; password: string; loginType?: 'user' | 'admin'; role?: string }) {
    const { email, password, loginType } = credentials;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true }
    });

    if (!user) {
      const err: any = new Error('Invalid email or password credentials.');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (user.status !== 'ACTIVE') {
      const err: any = new Error('Your account is currently inactive or suspended. Contact support.');
      err.status = 403;
      err.code = 'ACCOUNT_INACTIVE';
      throw err;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const err: any = new Error('Invalid email or password credentials.');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // Critical authorization check: Admin Login pathway requires true ADMIN role
    if (loginType === 'admin') {
      if (user.role !== 'ADMIN') {
        const err: any = new Error('Access denied: Your authenticated account does not possess System Administrator privileges.');
        err.status = 403;
        err.code = 'FORBIDDEN_ADMIN_REQUIRED';
        throw err;
      }
    }

    // Update last active timestamp if database is reachable
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() }
      });
    } catch (dbErr) {
      // ignore when DB is offline
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organizationId
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: formatRoleForFrontend(user.role),
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        createdAt: user.createdAt.toISOString().split('T')[0],
        status: user.status === 'ACTIVE' ? 'Active' : 'Suspended'
      }
    };
  },

  async register(data: { name: string; email: string; organizationName: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existing) {
      const err: any = new Error('An account with this email address already exists.');
      err.status = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.organizationName,
          tier: 'COMMERCIAL',
          defaultCurrency: 'USD',
          defaultRiskTolerance: 'MODERATE'
        }
      });

      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: 'CHARTERER',
          status: 'ACTIVE',
          organizationId: org.id
        },
        include: { organization: true }
      });

      return user;
    });

    const tokenPayload: JwtPayload = {
      userId: result.id,
      email: result.email,
      role: result.role as UserRole,
      organizationId: result.organizationId
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    return {
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: formatRoleForFrontend(result.role),
        organizationId: result.organizationId,
        organizationName: result.organization.name,
        createdAt: result.createdAt.toISOString().split('T')[0],
        status: 'Active'
      }
    };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user) {
      const err: any = new Error('User account not found.');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: formatRoleForFrontend(user.role),
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      createdAt: user.createdAt.toISOString().split('T')[0],
      status: user.status === 'ACTIVE' ? 'Active' : 'Suspended'
    };
  }
};

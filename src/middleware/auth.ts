import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user?: {
    clinicianId: string;
    role: string;
    organisationId: string;
    organisationName?: string;
    permissions?: string[];
  };
};

type SessionPayload = {
  clinicianId: string;
  role: string;
  organisationId?: string;
  organisationName?: string;
  permissions?: string[];
};

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    response.status(500).json({ error: "Server authentication secret is not configured" });
    return;
  }

  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as SessionPayload;
    if (!payload.organisationId) {
      response.status(401).json({ error: "Please sign in again to open your organisation workspace" });
      return;
    }
    request.user = {
      clinicianId: payload.clinicianId,
      role: payload.role,
      organisationId: payload.organisationId,
      organisationName: payload.organisationName,
      permissions: payload.permissions || []
    };
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  requireAuth(request, response, () => {
    if (!request.user?.role || !["admin", "platform_admin"].includes(request.user.role)) {
      response.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

export function requirePlatformAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  requireAuth(request, response, () => {
    if (request.user?.role !== "platform_admin") {
      response.status(403).json({ error: "Spotit platform admin access required" });
      return;
    }
    next();
  });
}

export function requireOrganisationAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  requireAuth(request, response, () => {
    if (request.user?.role !== "admin") {
      response.status(403).json({ error: "Organisation admin access required" });
      return;
    }
    next();
  });
}

export function requirePermission(permission: string) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    requireAuth(request, response, () => {
      if (request.user?.role === "platform_admin" || request.user?.role === "admin") {
        next();
        return;
      }
      if (request.user?.permissions?.includes(permission)) {
        next();
        return;
      }
      response.status(403).json({ error: `Permission required: ${permission}` });
    });
  };
}

export function tenantId(request: AuthenticatedRequest) {
  if (!request.user?.organisationId) {
    throw new Error("Organisation workspace is required");
  }
  return request.user.organisationId;
}

export function requireRole(allowedRoles: string[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    requireAuth(request, response, () => {
      if (!request.user?.role || !allowedRoles.includes(request.user.role)) {
        response.status(403).json({ error: "Your role does not permit this action" });
        return;
      }
      next();
    });
  };
}

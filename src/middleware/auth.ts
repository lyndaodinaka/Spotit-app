import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user?: {
    clinicianId: string;
    role: string;
  };
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
    const payload = jwt.verify(token, jwtSecret) as { clinicianId: string; role: string };
    request.user = { clinicianId: payload.clinicianId, role: payload.role };
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired session" });
  }
}

export function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  requireAuth(request, response, () => {
    if (request.user?.role !== "admin") {
      response.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
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

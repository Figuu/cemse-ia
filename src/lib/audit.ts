import { prisma } from '@/lib/prisma/client';
import { headers } from 'next/headers';

interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  description?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Crea un registro de auditoría en el sistema
 *
 * @param data - Datos del registro de auditoría
 * @returns El registro de auditoría creado
 *
 * @example
 * await createAuditLog({
 *   action: "USER_CREATED",
 *   entityType: "User",
 *   entityId: newUser.id,
 *   userId: currentUser.id,
 *   description: `Usuario ${newUser.name} creado`,
 *   metadata: { role: newUser.role }
 * });
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Get request headers for IP and user agent
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
                      headersList.get('x-real-ip') ||
                      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    const auditLog = await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        description: data.description,
        changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        ipAddress,
        userAgent,
      },
    });

    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to avoid breaking the main operation
    return null;
  }
}

/**
 * Crea un registro de auditoría para la creación de una entidad
 */
export async function logCreate(
  entityType: string,
  entityId: string,
  entityName: string,
  userId: string,
  metadata?: Record<string, unknown>
) {
  return createAuditLog({
    action: `${entityType.toUpperCase()}_CREATED`,
    entityType,
    entityId,
    userId,
    description: `${entityType} "${entityName}" creado`,
    metadata,
  });
}

/**
 * Crea un registro de auditoría para la actualización de una entidad
 */
export async function logUpdate(
  entityType: string,
  entityId: string,
  entityName: string,
  userId: string,
  changes: Record<string, unknown>,
  metadata?: Record<string, unknown>
) {
  return createAuditLog({
    action: `${entityType.toUpperCase()}_UPDATED`,
    entityType,
    entityId,
    userId,
    description: `${entityType} "${entityName}" actualizado`,
    changes,
    metadata,
  });
}

/**
 * Crea un registro de auditoría para la eliminación (soft delete) de una entidad
 */
export async function logDelete(
  entityType: string,
  entityId: string,
  entityName: string,
  userId: string,
  metadata?: Record<string, unknown>
) {
  return createAuditLog({
    action: `${entityType.toUpperCase()}_DELETED`,
    entityType,
    entityId,
    userId,
    description: `${entityType} "${entityName}" eliminado`,
    metadata,
  });
}

/**
 * Crea un registro de auditoría para el cambio de contraseña
 */
export async function logPasswordChange(
  userId: string,
  targetUserId: string,
  targetUserEmail: string,
  isForced: boolean = false
) {
  return createAuditLog({
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: targetUserId,
    userId,
    description: isForced
      ? `Contraseña forzada a cambiar para ${targetUserEmail}`
      : `Contraseña cambiada para ${targetUserEmail}`,
    metadata: { isForced },
  });
}

/**
 * Crea un registro de auditoría para el inicio de sesión
 */
export async function logLogin(
  userId: string,
  userEmail: string,
  success: boolean = true
) {
  return createAuditLog({
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    entityType: 'User',
    entityId: userId,
    userId,
    description: success
      ? `Inicio de sesión exitoso para ${userEmail}`
      : `Intento de inicio de sesión fallido para ${userEmail}`,
  });
}

/**
 * Crea un registro de auditoría para el cierre de sesión
 */
export async function logLogout(
  userId: string,
  userEmail: string
) {
  return createAuditLog({
    action: 'LOGOUT',
    entityType: 'User',
    entityId: userId,
    userId,
    description: `Cierre de sesión para ${userEmail}`,
  });
}

/**
 * Crea un registro de auditoría para cambios en el estado de un caso
 */
export async function logCaseStatusChange(
  caseId: string,
  caseNumber: string,
  userId: string,
  oldStatus: string,
  newStatus: string
) {
  return createAuditLog({
    action: 'CASE_STATUS_CHANGED',
    entityType: 'Case',
    entityId: caseId,
    userId,
    description: `Estado del caso ${caseNumber} cambiado de ${oldStatus} a ${newStatus}`,
    changes: {
      status: { from: oldStatus, to: newStatus },
    },
  });
}

/**
 * Crea un registro de auditoría para la asignación de usuario a colegio
 */
export async function logSchoolAssignment(
  targetUserId: string,
  targetUserName: string,
  schoolId: string,
  schoolName: string,
  actionUserId: string
) {
  return createAuditLog({
    action: 'USER_SCHOOL_ASSIGNED',
    entityType: 'User',
    entityId: targetUserId,
    userId: actionUserId,
    description: `Usuario ${targetUserName} asignado al colegio ${schoolName}`,
    metadata: { schoolId, schoolName },
  });
}

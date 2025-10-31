import { Role, SchoolType, ViolenceType, CaseStatus, CasePriority } from '@prisma/client';

/**
 * Traduce los roles del sistema al español para mostrar en la interfaz
 */
export function translateRole(role: Role): string {
  const roleTranslations: Record<Role, string> = {
    SUPER_ADMIN: 'Super Administrador',
    ADMIN: 'Administrador',
    DIRECTOR: 'Director',
    PROFESOR: 'Profesor',
    USER: 'Usuario',
  };

  return roleTranslations[role] || role;
}

/**
 * Traduce los tipos de colegio al español para mostrar en la interfaz
 */
export function translateSchoolType(type: SchoolType): string {
  const typeTranslations: Record<SchoolType, string> = {
    PUBLIC: 'Público',
    PRIVATE: 'Privado',
    SUBSIDIZED: 'Convenio',
  };

  return typeTranslations[type] || type;
}

/**
 * Obtiene el badge color para cada rol
 */
export function getRoleBadgeColor(role: Role): string {
  const roleColors: Record<Role, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    DIRECTOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PROFESOR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    USER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  return roleColors[role] || roleColors.USER;
}

/**
 * Obtiene el badge color para cada tipo de colegio
 */
export function getSchoolTypeBadgeColor(type: SchoolType): string {
  const typeColors: Record<SchoolType, string> = {
    PUBLIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    PRIVATE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    SUBSIDIZED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return typeColors[type] || typeColors.PUBLIC;
}

/**
 * Traduce los tipos de violencia al español para mostrar en la interfaz
 */
export function translateViolenceType(type: ViolenceType): string {
  const translations: Record<ViolenceType, string> = {
    PHYSICAL: 'Física',
    VERBAL: 'Verbal',
    PSYCHOLOGICAL: 'Psicológica',
    SEXUAL: 'Sexual',
    CYBERBULLYING: 'Ciberacoso',
    DISCRIMINATION: 'Discriminación',
    PROPERTY_DAMAGE: 'Daño a Propiedad',
    OTHER: 'Otro',
  };

  return translations[type] || type;
}

/**
 * Traduce los estados de caso al español para mostrar en la interfaz
 */
export function translateCaseStatus(status: CaseStatus): string {
  const translations: Record<CaseStatus, string> = {
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    UNDER_REVIEW: 'En Revisión',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado',
    ARCHIVED: 'Archivado',
  };

  return translations[status] || status;
}

/**
 * Traduce las prioridades de caso al español para mostrar en la interfaz
 */
export function translateCasePriority(priority: CasePriority): string {
  const translations: Record<CasePriority, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };

  return translations[priority] || priority;
}

/**
 * Obtiene el badge color para cada tipo de violencia
 */
export function getViolenceTypeBadgeColor(type: ViolenceType): string {
  const colors: Record<ViolenceType, string> = {
    PHYSICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    VERBAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    PSYCHOLOGICAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    SEXUAL: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    CYBERBULLYING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    DISCRIMINATION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    PROPERTY_DAMAGE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  };

  return colors[type] || colors.OTHER;
}

/**
 * Obtiene el badge color para cada estado de caso
 */
export function getCaseStatusBadgeColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    OPEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    ARCHIVED: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  };

  return colors[status] || colors.OPEN;
}

/**
 * Obtiene el badge color para cada prioridad de caso
 */
export function getCasePriorityBadgeColor(priority: CasePriority): string {
  const colors: Record<CasePriority, string> = {
    LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return colors[priority] || colors.MEDIUM;
}

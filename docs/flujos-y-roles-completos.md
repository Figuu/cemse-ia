# Documentación Completa: Flujos, Roles y Permisos
## Plataforma Inteligente de Monitoreo y Supervisión de Casos de Violencia Escolar

**Versión:** 1.0  
**Fecha:** 2025-01-27  
**Proyecto:** DDE Cochabamba

---

## Índice

1. [Lista Completa de Roles](#1-lista-completa-de-roles)
2. [Matriz de Permisos Detallada](#2-matriz-de-permisos-detallada)
3. [Creación y Gestión de Usuarios](#3-creación-y-gestión-de-usuarios)
4. [Flujos por Módulo](#4-flujos-por-módulo)
5. [Sistema de Eventos y Auditoría](#5-sistema-de-eventos-y-auditoría)
6. [Reglas Especiales y Automatizaciones](#6-reglas-especiales-y-automatizaciones)

---

## 1. Lista Completa de Roles

### 1.1 Roles Principales

#### **SUPER_ADMIN**
- **Descripción:** Administrador máximo del sistema con acceso total
- **Ámbito:** Departamento completo (todas las U.E., Distritos, DDE)
- **Características:**
  - Puede eliminar casos físicamente (soft delete con registro)
  - Gestión completa de todos los usuarios
  - Acceso a todas las métricas y reportes consolidados
  - Configuración de parámetros del sistema
  - Gestión de integraciones externas

#### **ADMIN_DDE**
- **Descripción:** Administrador de la Dirección Departamental de Educación
- **Ámbito:** Departamento completo (vista consolidada)
- **Características:**
  - Lectura consolidada de todos los casos
  - Gestión de usuarios de DDE y Distritos
  - Reportes y analítica departamental
  - Escalamientos y supervisión

#### **ADMIN_DISTRITO**
- **Descripción:** Administrador a nivel distrital
- **Ámbito:** Distrito asignado (múltiples U.E.)
- **Características:**
  - Gestión de usuarios de las U.E. de su distrito
  - Lectura consolidada de casos del distrito
  - Reportes y analítica distrital
  - Supervisión de U.E.

#### **DIRECCION_UE**
- **Descripción:** Dirección de Unidad Educativa
- **Ámbito:** Una Unidad Educativa específica
- **Características:**
  - Registro y gestión completa de casos de su U.E.
  - Derivación y denuncia obligatoria (≤ 24h)
  - Aprobación de Planes de Protección
  - Gestión de Comisiones CAP
  - Lectura de contrarreferencias

#### **DOCENTE**
- **Descripción:** Docente de aula
- **Ámbito:** Una Unidad Educativa específica
- **Características:**
  - Registro inicial de casos
  - Lectura de casos de su U.E. (restringida)
  - Carga de evidencias
  - No puede derivar ni denunciar

#### **COMISION_CAP_CONSTRUCCION**
- **Descripción:** Miembro de comisión CAP en fase de construcción
- **Ámbito:** Una Unidad Educativa específica
- **Características:**
  - Creación y edición de Plan CAP
  - Elaboración de actas de construcción
  - Acceso a casos para contextualizar (solo lectura)

#### **COMISION_CAP_APROBACION**
- **Descripción:** Miembro de comisión CAP en fase de aprobación
- **Ámbito:** Una Unidad Educativa específica
- **Características:**
  - Aprobación de Plan CAP
  - Elaboración de actas de aprobación
  - Revisión de planes construidos

#### **COMISION_CAP_SOCIALIZACION**
- **Descripción:** Miembro de comisión CAP en fase de socialización
- **Ámbito:** Una Unidad Educativa específica
- **Características:**
  - Gestión de actividades de socialización
  - Elaboración de actas de socialización
  - Seguimiento y evaluación de actividades
  - Lectura de Plan CAP aprobado

#### **DDE_LECTURA**
- **Descripción:** Personal de DDE con acceso de solo lectura
- **Ámbito:** Departamento completo (vista consolidada)
- **Características:**
  - Lectura de casos consolidados
  - Acceso a reportes y dashboards
  - Sin capacidad de edición

#### **DNA_LECTURA**
- **Descripción:** Personal de DNA (Defensoría del Niño y Adolescente)
- **Ámbito:** Casos derivados a DNA
- **Características:**
  - Lectura de casos derivados (≤ 18 años)
  - Registro de contrarreferencias
  - Lectura de evidencias relevantes
  - Sin acceso a datos clínicos completos

#### **SLIM_LECTURA**
- **Descripción:** Personal de SLIM (Servicio Legal Integral Municipal)
- **Ámbito:** Casos derivados a SLIM
- **Características:**
  - Lectura de casos derivados (> 18 años)
  - Registro de contrarreferencias
  - Lectura de evidencias relevantes

#### **MP_LECTURA**
- **Descripción:** Personal del Ministerio Público
- **Ámbito:** Casos derivados por delitos
- **Características:**
  - Lectura de casos con denuncia penal
  - Registro de contrarreferencias
  - Acceso a evidencias y cadena de custodia

#### **SALUD_LECTURA**
- **Descripción:** Personal de Salud (Red/Establecimiento)
- **Ámbito:** Casos con componente de salud
 prohibits
- **Características:**
  - Lectura de casos con referencia a salud
  - Registro de contrarreferencias clínicas
  - Indicaciones médicas en Plan de Protección
  - Acceso a datos clínicos y constancias médicas

#### **ADMIN_BIBLIOTECA**
- **Descripción:** Administrador del módulo de Biblioteca y Sensibilización
- **Ámbito:** Sistema completo
- **Características:**
  - Carga de materiales, protocolos y guías
  - Gestión de cursos de capacitación
  - Visualización de métricas de uso
  - Generación de reportes cualitativos con IA

---

## 2. Matriz de Permisos Detallada

### 2.1 Módulo: Gestión de Casos

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP* | ADMIN_DISTRITO | ADMIN_DDE | DNA/SLIM/MP/SALUD | SUPER_ADMIN |
|--------|---------|--------------|---------------|----------------|-----------|-------------------|-------------|
| **Crear caso** | ✅ Crear | ✅ Crear | ❌ | ❌ | ❌ | ❌ | ✅ Crear |
| **Ver caso (propio)** | ✅ Lectura | ✅ Lectura | ✅ Lectura contextual | ❌ | ❌ | ❌ | ✅ Completo |
| **Ver caso (U.E.)** | ✅ Lectura restringida | ✅ Lectura completa | ✅ Lectura contextual | ❌ | ❌ | ❌ | ✅ Completo |
| **Ver caso (Distrito)** | ❌ | ❌ | ❌ | ✅ Lectura consolidada | ❌ | ❌ | ✅ Completo |
| **Ver caso (Departamento)** | ❌ | ❌ | ❌ | ❌ | ✅ Lectura consolidada | ❌ | ✅ Completo |
| **Editar caso (propio)** | ✅ Solo si es creador | ✅ Completo | ❌ | ❌ | ❌ | ❌ | ✅ Completo |
| **Editar caso (otros)** | ❌ | ✅ Solo su U.E. | ❌ | ❌ | ❌ | ❌ | ✅ Completo |
| **Eliminar caso** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Soft delete con auditoría |
| **Restaurar caso eliminado** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Solo SUPER_ADMIN |

### 2.2 Módulo: Derivaciones y Denuncias

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP* | ADMIN_DISTRITO | ADMIN_DDE | DNA/SLIM/MP/SALUD | SUPER_ADMIN |
|--------|---------|--------------|---------------|----------------|-----------|-------------------|-------------|
| **Crear derivación** | ❌ | ✅ Crear | ❌ | ❌ | ❌ | ❌ | ✅ Crear |
| **Editar derivación** | ❌ | ✅ Solo pendiente | ❌ | ❌ | ❌ | ❌ | ✅ Siempre |
| **Enviar derivación** | ❌ | ✅ Enviar | ❌ | ❌ | ❌ | ❌ | ✅ Enviar |
| **Ver derivaciones (propias)** | ❌ | ✅ Lectura | ❌ | ❌ | ❌ | ❌ | ✅ Completo |
| **Ver derivaciones (área)** | ❌ | ❌ | ❌ | ✅ Lectura consolidada | ✅ Lectura consolidada | ✅ Solo destinadas a ellos | ✅ Completo |
| **Registrar acuse de recibo** | ❌ | ✅ Manual si no automático | ❌ | ❌ | ❌ | ✅ Registro automático | ✅ Completo |
| **Derivación automática (violencia sexual)** | ❌ | Sistema automático cuando DIRECCION_UE registra | ❌ | ❌ | ❌ | Se les asigna | Sistema |

### 2.3 Módulo: Contrarreferencias

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP* | ADMIN_DISTRITO | ADMIN_DDE | DNA/SLIM/MP/SALUD | SUPER_ADMIN |
|--------|---------|--------------|---------------|----------------|-----------|-------------------|-------------|
| **Ver contrarreferencias** | ❌ | ✅ Lectura | ❌ | ✅ Lectura consolidada | ✅ Lectura consolidada | ✅ Solo propias | ✅ Completo |
| **Registrar contrarreferencia** | ❌ | ✅ Crear (manual) | ❌ | ❌ | ❌ | ✅ Crear (institución) | ✅ Crear |
| **Editar contrarreferencia** | ❌ | ✅ Solo si creador | ❌ | ❌ | ❌ | ✅ Solo si creador | ✅ Siempre |
| **Adjuntar documentos** | ❌ | ✅ Adjuntar | ❌ | ❌ | ❌ | ✅ Adjuntar | ✅ Completo |

### 2.4 Módulo: Plan de Protección

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP* | ADMIN_DISTRITO | ADMIN_DDE | DNA/SLIM/MP/SALUD | SUPER_ADMIN |
|--------|---------|--------------|---------------|----------------|-----------|-------------------|-------------|
| **Crear plan de protección** | ❌ | ✅ Crear | ❌ | ❌ | ❌ | ❌ | ✅ Crear |
| **Editar plan de protección** | ❌ | ✅ Editar | ❌ | ❌ | ❌ | ✅ Indicaciones médicas | ✅ Editar |
| **Aprobar plan de protección** | ❌ | ✅ Aprobar | ❌ | ❌ | ❌ | ❌ | ✅ Aprobar |
| **Ver plan de protección** | ✅ Lectura restringida | ✅ Lectura completa | ❌ | ✅ Lectura consolidada | ✅ Lectura consolidada | ✅ Lectura relevante | ✅ Completo |
| **Actualizar seguimiento** | ❌ | ✅ Actualizar | ❌ | ❌ | ❌ | ✅ Actualizar indicaciones | ✅ Actualizar |

### 2.5 Módulo: Plan CAP

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP_CONSTRUCCION | COMISION_CAP_APROBACION | COMISION_CAP_SOCIALIZACION | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|---------------------------|-------------------------|----------------------------|----------------|-----------|-------------|
| **Crear comisión CAP** | ❌ | ✅ Crear | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Crear |
| **Crear Plan CAP (borrador)** | ❌ | ✅ Crear | ✅ Crear/Editar | ❌ | ❌ | ❌ | ❌ | ✅ Crear |
| **Aprobar Plan CAP** | ❌ | ✅ Aprobar | ❌ | ✅ Aprobar | ❌ | ❌ | ❌ | ✅ Aprobar |
| **Crear actividad de socialización** | ❌ | ✅ Crear | ❌ | ❌ | ✅ Crear/Editar | ❌ | ❌ | ✅ Crear |
| **Elaborar acta (construcción)** | ❌ | ✅ Elaborar | ✅ Elaborar | ❌ | ❌ | ❌ | ❌ | ✅ Elaborar |
| **Elaborar acta (aprobación)** | ❌ | ✅ Elaborar | ™ | ✅ Elaborar | ❌ | ❌ | ❌ | ✅ Elaborar |
| **Elaborar acta (socialización)** | ❌ | ✅ Elaborar | ❌ | ❌ | ✅ Elaborar | ❌ | ❌ | ✅ Elaborar |
| **Ver Plan CAP** | ✅ Lectura limitada | ✅ Lectura completa | ✅ Lectura completa | ✅ Lectura completa | ✅ Lectura aprobado | ✅ Lectura consolidada | ✅ Lectura consolidada | ✅ Completo |
| **Firmar acta** | ❌ | ✅ Firmar | ✅ Firmar | ✅ Firmar | ✅ Firmar | ❌ | ❌ | ✅ Firmar |

### 2.6 Módulo: Submódulos Especiales

#### 2.6.1 Violencia Sexual

| Acción | DOCENTE | DIRECCION_UE | SALUD_LECTURA | DNA_LECTURA (< 18) | SLIM_LECTURA (> 18) | SUPER_ADMIN |
|--------|---------|--------------|---------------|-------------------|---------------------|-------------|
| **Registrar violencia sexual** | ✅ Registro inicial | ✅ Registro completo | ❌ | ❌ | ❌ | ✅ Completo |
| **Derivación automática DNA** | Sistema automático | Sistema automático | Sistema notifica | ✅ Recibe automático | ❌ | Sistema |
| **Derivación automática SLIM** | Sistema automático | Sistema automático | Sistema notifica | ❌ | ✅ Recibe automático | Sistema |
| **Registrar valoración médica** | ❌ | ❌ | ✅ Registro | ❌ | ❌ | ✅ Registro |
| **Cadena de custodia clínica** | ❌ | ✅ Ver | ✅ Ver/Editar | ✅ Ver relevante | ✅ Ver relevante | ✅ Completo |

#### 2.6.2 Drogas

| Acción | DOCENTE | DIRECCION_UE | SALUD_LECTURA | FELCN | SUPER_ADMIN |
|--------|---------|--------------|---------------|-------|-------------|
| **Registrar presencia** | ✅ Registro | ✅ Registro completo | ❌ | ❌ | ✅ Completo |
| **Registrar consumo/intoxicación** | ✅ Registro | ✅ Registro completo | ✅ Valoración | ❌ | ✅ Completo |
| **Solicitar FELCN** | ❌ | ✅ Solicitar | ❌ | ❌ | ✅ Solicitar |
| **Registrar acta de inventario** | ❌ | ✅ Si no llega FELCN | ❌ | ❌ | ✅ Siempre |
| **Alerta cierre de jornada** | Sistema notifica | Sistema notifica | Sistema notifica | Sistema notifica | Sistema |

#### 2.6.3 Lesiones/Urgencias

| Acción | DOCENTE | DIRECCION_UE | SALUD_LECTURA | SUPER_ADMIN |
|--------|---------|--------------|---------------|-------------|
| **Registrar lesión** | ✅ Registro inicial | ✅ Registro completo | ❌ | ✅ Completo |
| **Derivación inmediata a Salud** | Sistema automático | Sistema automático | ✅ Recibe | Sistema |
| **Registrar constancia médica** | ❌ | ✅ Adjuntar | ✅ Crear | ✅ Completo |
| **Actualizar estado de salud** | ❌ | ✅ Actualizar | ✅ Actualizar | ✅ Actualizar |

#### 2.6.4 Ciberacoso

| Acción | DOCENTE | DIRECCION_UE | SUPER_ADMIN |
|--------|---------|--------------|-------------|
| **Registrar ciberacoso** | ✅ Registro inicial | ✅ Registro completo | ✅ Completo |
| **Cargar evidencias digitales** | ✅ Cargar | ✅ Cargar/Gestionar | ✅ Completo |
| **Derivación a MP (si delito)** | ❌ | ✅ Derivar | ✅ Derivar |

### 2.7 Módulo: Alertas y SLA

| Acción | DOCENTE | DIRECCION_UE | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|----------------|-----------|-------------|
| **Ver alertas propias** | ✅ Lectura | ✅ Lectura/Resolver | ❌ | ❌ | ✅ Completo |
| **Ver alertas (área)** | ❌ | ❌ | ✅ Lectura consolidada | ✅ Lectura consolidada | ✅ Completo |
| **Resolver alerta** | ❌ | ✅ Resolver | ✅ Escalar | ✅ Resolver | ✅ Resolver |
| **Configurar reglas SLA** | ❌ | ❌ | ❌ | ❌ | ✅ Configurar |
| **Ver historial de alertas** | ❌ | ✅ Ver | ✅ Ver consolidado | ✅ Ver consolidado | ✅ Ver todo |

### 2.8 Módulo: Analítica y Reportería

| Acción | DOCENTE | DIRECCION_UE | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|----------------|-----------|-------------|
| **Ver dashboard (propio)** | ✅ Limitado (solo casos registrados) | ✅ Completo U.E. | ✅ Completo Distrito | ✅ Completo Dpto. | ✅ Completo Sistema |
| **Exportar reportes** | ❌ | ✅ Exportar U.E. | ✅ Exportar Distrito | ✅ Exportar Dpto. | ✅ Exportar todo |
| **Ver métricas SLA** | ❌ | ✅ Ver | ✅ Ver consolidado | ✅ Ver consolidado | ✅ Ver todo |
| **Ver mapas de calor** | ❌ | ✅ Ver U.E. | ✅ Ver Distrito | ✅ Ver Dpto. | ✅ Ver todo |
| **Anonimización automática** | N/A | Sistema aplica | Sistema aplica | Sistema aplica | Opción |

### 2.9 Módulo: Biblioteca y Sensibilización

| Acción | DOCENTE | DIRECCION_UE | COMISION_CAP* | ADMIN_BIBLIOTECA | SUPER_ADMIN |
|--------|---------|--------------|---------------|------------------|-------------|
| **Ver materiales** | ✅ Lectura/Descarga | ✅ Lectura/Descarga | ✅ Lectura/Descarga | ✅ Completo | ✅ Completo |
| **Subir materiales** | ❌ | ❌ | ❌ | ✅ Subir | ✅ Subir |
| **Ver cursos disponibles** | ✅ Ver/Inscribirse | ✅ Ver/Inscribirse | ✅ Ver/Inscribirse | ✅ Gestionar | ✅ Gestionar |
| **Completar curso** | ✅ Completar | ✅ Completar | ✅ Completar | ✅ Gestionar | ✅ Gestionar |
| **Ver métricas propias** | ✅ Ver propias | ✅ Ver U.E. | ✅ Ver propias | ✅ Ver todas | ✅ Ver todas |
| **Generar reportes cualitativos** | ❌ | ❌ | ❌ | ✅ Generar con IA | ✅ Generar con IA |

### 2.10 Módulo: Administración

#### 2.10.1 Gestión de Usuarios

| Acción | DOCENTE | DIRECCION_UE | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|----------------|-----------|-------------|
| **Crear usuario (U.E.)** | ❌ | ✅ Crear usuarios de su U.E. | ✅ Crear usuarios de su Distrito | ✅ Crear usuarios de session DDE | ✅ Crear cualquier usuario |
| **Crear usuario (Distrito)** | ❌ | ❌ | ✅ Crear | ❌ | ✅ Crear |
| **Crear usuario (DDE)** | ❌ | ❌ | ❌ | ✅ Crear | ✅ Crear |
| **Editar usuario (propio)** | ✅ Editar perfil propio | ✅ Editar perfil propio | ✅ Editar perfil propio | ✅ Editar perfil propio | ✅ Editar cualquier usuario |
| **Editar usuario (otros)** | ❌ | ✅ Solo usuarios de su U.E. | ✅ Solo usuarios de su Distrito | ✅ Solo usuarios de DDE | ✅ Cualquier usuario |
| **Asignar roles** | ❌ | ✅ Asignar roles ≤ DIRECCION_UE | ✅ Asignar roles ≤ ADMIN_DISTRITO | ✅ Asignar roles ≤ ADMIN_DDE | ✅ Asignar cualquier rol |
| **Desactivar usuario** | ❌ | ✅ Solo usuarios de su U.E. | ✅ Solo usuarios de su Distrito | ✅ Solo usuarios de DDE | ✅ Cualquier usuario |
| **Gestión masiva de usuarios** | ❌ | ❌ | ❌ | ❌ | ✅ Gestión masiva |

#### 2.10.2 Gestión de Catálogos

| Acción | DOCENTE | DIRECCION_UE | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|----------------|-----------|-------------|
| **Ver catálogos** | ✅ Lectura | ✅ Lectura | ✅ Lectura | ✅ Lectura | ✅ Lectura/Edición |
| **Editar catálogos** | ❌ | ❌ | ❌ | ❌ | ✅ Editar |

#### 2.10.3 Gestión de Estructura Organizacional

| Acción | DOCENTE | DIRECCION_UE | ADMIN_DISTRITO | ADMIN_DDE | SUPER_ADMIN |
|--------|---------|--------------|----------------|-----------|-------------|
| **Crear U.E.** | ❌ | ❌ | ✅ Crear | ✅ Crear | ✅ Crear |
| **Editar U.E.** | ❌ | ✅ Solo su U.E. (datos básicos) | ✅ Editar U.E. del distrito | ✅ Editar cualquier U.E. | ✅ Editar cualquier U.E. |
| **Crear Distrito** | ❌ | ❌ | ❌ | ✅ Crear | ✅ Crear |
| **Asignar U.E. a Distrito** | ❌ | ❌ | ✅ Asignar | ✅ Asignar | ✅ Asignar |

#### 2.10.4 Configuración del Sistema

| Acción | SUPER_ADMIN |
|--------|-------------|
| **Configurar parámetros SLA** | ✅ |
| **Configurar plantillas de documentos** | ✅ |
| **Configurar integraciones externas** | ✅ |
| **Configurar notificaciones** | ✅ |
| **Configurar anonimización** | ✅ |
| **Gestión de backups** | ✅ |
| **Ver logs de auditoría** | ✅ |

---

## 3. Creación y Gestión de Usuarios

### 3.1 Jerarquía de Creación de Usuarios

```
SUPER_ADMIN
  └─ Puede crear → Todos los roles
  
ADMIN_DDE
  └─ Puede crear → ADMIN_DISTRITO, DIRECCION_UE, DOCENTE, COMISION_CAP_*, ADMIN_BIBLIOTECA, DDE_LECTURA
  
ADMIN_DISTRITO
  └─ Puede crear → DIRECCION_UE, DOCENTE, COMISION_CAP_* (de su distrito)
  
DIRECCION_UE
  └─ Puede crear → DOCENTE, COMISION_CAP_* (de su U.E.)
```

### 3.2 Usuarios Externos (Instituciones)

Los usuarios de instituciones externas (DNA, SLIM, MP, Salud) son creados solo por **SUPER_ADMIN** y requieren:

- Validación externa (proceso manual inicial)
- Credenciales temporales con cambio obligatorio
- Ámbito limitado automáticamente a casos derivados

### 3.3 Flujo de Creación de Usuario

1. **Solicitud:**
   - Creador selecciona rol y ámbito (U.E./Distrito)
   - Sistema valida permisos del creador

2. **Registro:**
   - Email (debe ser único)
   - Nombre completo
   - Teléfono (opcional)
   - Rol asignado
   - Ámbito (U.E./Distrito/DDE) - automático según creador o seleccionable

3. **Notificación:**
   - Email de bienvenida con credenciales temporales
   - Si 2FA está habilitado, configuración requerida

4. **Primer acceso:**
   - Cambio obligatorio de contraseña
   - Configuración de 2FA (si aplica)
   - Tour inicial del sistema

### 3.4 Gestión de Roles Múltiples

Un usuario puede tener múltiples roles solo en casos específicos:

- **DIRECCION_UE + COMISION_CAP_*** (puede ser director y parte de comisión)
- **ADMIN_DISTRITO + COMISION_CAP_*** (casos especiales)

**Restricción:** No se puede ser DOCENTE y DIRECCION_UE simultáneamente en la misma U.E.

---

## 4. Flujos por Módulo

### 4.1 Flujo: Registro de Caso

#### 4.1.1 Inicio del Flujo

**Actor inicial:** DOCENTE o DIRECCION_UE

**Paso 1: Recepción y Escucha Activa**
- DOCENTE recibe información (sospecha/revelación)
- Realiza escucha activa sin promesas
- No investiga, solo registra

**Paso 2: Registro Inicial**
- DOCENTE accede al módulo "Registrar Caso"
- Completa formulario:
  - Unidad Educativa (precargada según su ámbito)
  - Fecha y hora del incidente
  - Tipo de violencia (Física, Psicológica, Sexual, Digital, Trata de Personas, Drogas, Otra)
  - Ámbito (Aula, Patio/Instalaciones, Virtual, Fuera de U.E.)
  - Descripción breve
  - Personas involucradas (víctima(s), presunto agresor(es))
  - Riesgo inicial (Bajo, Medio, Alto, Crítico)

**Paso 3: Carga de Evidencias**
- DOCENTE puede cargar:
  - Fotografías
  - Documentos
  - Testimonios
  - Otros archivos
- Sistema genera hash de custodia automático

**Paso 4: Guardado**
- DOCENTE guarda como "Borrador" o "Registrado"
- Si guarda como "Registrado":
  - Sistema genera código único del caso
  - Sistema crea **EVENTO**: "Caso creado por {DOCENTE} el {fecha}"
  - Sistema asigna **GESTOR_PRINCIPAL**: DOCENTE
  - Sistema notifica automáticamente a DIRECCION_UE

**Paso 5: Notificación a Dirección**
- Sistema envía notificación inmediata:
  - In-app
  - Email institucional
  - WhatsApp Business (si está configurado)
- DIRECCION_UE recibe alerta con prioridad según riesgo

#### 4.1.2 Continuación por Dirección

**Actor:** DIRECCION_UE

**Paso 6: Revisión Inicial**
- DIRECCION_UE recibe notificación
- Accede al caso
- Revisa información registrada
- Sistema crea **EVENTO**: "Caso revisado por {DIRECCION_UE} el {fecha}"

**Paso 7: Valoración de Riesgo (si no está completa)**
- DIRECCION_UE completa checklist de valoración
- Sistema calcula riesgo automático basado en:
  - Tipo de violencia
  - Reiteración
  - Gravedad
  - Contexto
- Sistema actualiza nivel de riesgo
- Sistema crea **EVENTO**: "Riesgo valorado como {nivel} por {DIRECCION_UE}"

**Paso 8: Tipificación Completa**
- DIRECCION_UE puede editar y completar:
  - Tipificación detallada
  - Datos adicionales
  - Actualizar evidencias
- Sistema crea **EVENTO**: "Caso actualizado por {DIRECCION_UE} el {fecha}"

**Paso 9: Transferencia de Gestión (Opcional)**
- Si otro usuario tomará la gestión principal:
  - DIRECCION_UE puede asignar **GESTOR_PRINCIPAL** a otro usuario autorizado
  - Sistema crea **EVENTO**: "Gestión transferida de {usuario_anterior} a {usuario_nuevo} por {DIRECCION_UE}"

---

### 4.2 Flujo: Derivación y Denuncia

#### 4.2.1 Derivación Manual

**Actor:** DIRECCION_UE (obligatorio para casos que requieren derivación)

**Paso 1: Decisión de Derivación**
- DIRECCION_UE evalúa si el caso requiere derivación según:
  - Tipo de violencia
  - Nivel de riesgo
  - Protocolo legal (SLA ≤ 24h)
- Sistema muestra recordatorio si han pasado > 20 horas desde registro

**Paso 2: Selección de Institución Destino**
- DIRECCION_UE selecciona:
  - DNA (Defensoría del Niño y Adolescente)
  - SLIM (Servicio Legal Integral Municipal)
  - MP (Ministerio Público)
  - Salud (Red/Establecimiento)
  - DDE (Dirección Departamental de Educación)
- Sistema valida según tipo de caso y edades

**Paso 3: Generación de Documento**
- Sistema genera plantilla prellenada según institución
- DIRECCION_UE revisa y ajusta contenido
- DIRECCION_UE puede adjuntar documentos adicionales

**Paso 4: Envío**
- DIRECCION_UE envía derivación
- Sistema registra:
  - Fecha y hora de envío
  - Usuario que envía
  - Institución destino
  - Estado: "Enviada"
- Sistema crea **EVENTO**: "Derivación enviada a {institución} por {DIRECCION_UE}"
- Sistema inicia contador de SLA
- Sistema notifica a institución destino (si tiene integración)

**Paso 5: Acuse de Recibo**
- Si integración automática: sistema registra acuse automáticamente
- Si manual: institución marca "Recibido"
- Sistema actualiza estado a "Recibida"
- Sistema crea **EVENTO**: "Derivación recibida por {institución}"

#### 4.2.2 Derivación Automática (Violencia Sexual)

**Actor:** Sistema automático

**Condición de Activación:**
- Tipo de violencia = "Sexual"
- DIRECCION_UE guarda caso con tipo sexual y edad de víctima registrada

**Proceso Automático:**
1. Sistema detecta violencia sexual
2. Sistema identifica edad de víctima
3. Si edad < 18 años:
   - Sistema crea derivación automática a DNA
   - Sistema asigna usuario DNA_LECTURA correspondiente al caso
   - Sistema notifica a DNA
4. Si edad ≥ 18 años:
   - Sistema crea derivación automática a SLIM
   - Sistema asigna usuario SLIM_LECTURA correspondiente al caso
   - Sistema notifica a SLIM
5. Sistema crea **EVENTO**: "Derivación automática creada a {institución} por sistema"
6. Sistema notifica a DIRECCION_UE que se creó derivación automática
7. DIRECCION_UE puede:
   - Confirmar derivación automática
   - Ajustar o agregar información
   - Cancelar si fue error (requiere justificación - se registra en auditoría)

---

### 4.3 Flujo: Contrarreferencias

#### 4.3.1 Registro de Contrarreferencia por Institución

**Actor:** DNA_LECTURA, SLIM_LECTURA, MP_LECTURA, SALUD_LECTURA

**Paso 1: Acceso al Caso**
- Institución recibe notificación de derivación
- Usuario de institución accede al caso (solo lectura de información relevante)
- Usuario ve información necesaria según su rol:
  - DNA/SLIM/MP: datos del caso, evidencias, contexto
  - SALUD: además puede ver datos clínicos si aplica

**Paso 2: Revisión y Acciones**
- Institución realiza acciones correspondientes fuera del sistema
- Usuario prepara respuesta

**Paso 3: Registro de Contrarreferencia**
- Usuario accede a sección "Registrar Contrarreferencia"
- Completa:
  - Resumen de acciones realizadas
  - Recomendaciones
  - Próximos pasos
  - Archivos adjuntos (constancias, informes, etc.)
- Sistema registra:
  - Fecha de recepción
  - Usuario que registra
  - Institución origen
- Sistema crea **EVENTO**: "Contrarreferencia registrada por {institución} - {usuario}"

**Paso 4: Notificación**
- Sistema notifica a DIRECCION_UE
- Sistema actualiza estado del caso si corresponde
- Sistema cierra SLA de respuesta

#### 4.3.2 Registro Manual de Contrarreferencia

**Actor:** DIRECCION_UE (cuando recibe respuesta por otros medios)

**Paso 1: Entrada de Información**
- DIRECCION_UE recibe respuesta fuera del sistema
- Accede a caso y crea contrarreferencia manual
- Adjunta documentos recibidos
- Sistema crea **EVENTO**: "Contrarreferencia registrada manualmente por {DIRECCION_UE}"

---

### 4.4 Flujo: Plan de Protección

**Actor principal:** DIRECCION_UE

**Paso 1: Elaboración del Plan**
- DIRECCION_UE accede a caso con derivación enviada o en proceso
- Crea Plan de Protección con:
  - Medidas académicas (ajustes curriculares, flexibilidad)
  - Medidas ambientales (separación, espacios seguros)
  - Medidas psicosociales (apoyo psicológico, acompañamiento)
  - Responsables de cada medida
  - Fechas de control
- Sistema crea **EVENTO**: "Plan de Protección creado por {DIRECCION_UE}"

**Paso 2: Integración de Indicaciones Médicas**
- Si SALUD_LECTURA registró indicaciones:
  - Sistema muestra indicaciones médicas
  - DIRECCION_UE puede incorporarlas al plan
- Sistema crea **EVENTO**: "Indicaciones médicas incorporadas al plan"

**Paso 3: Aprobación**
- DIRECCION_UE aprueba el plan
- Sistema marca plan como "Aprobado"
- Sistema crea **EVENTO**: "Plan de Protección aprobado por {DIRECCION_UE}"

**Paso 4: Seguimiento**
- Sistema genera alertas en fechas de control
- DIRECCION_UE actualiza seguimiento:
  - Estado de cada medida
  - Observaciones
  - Evidencias de cumplimiento
- Sistema crea **EVENTO**: "Seguimiento de Plan de Protección actualizado - {medida}"

---

### 4.5 Flujo: Submódulo Drogas

**Actor inicial:** DOCENTE o DIRECCION_UE

#### 4.5.1 Flujo: Presencia de Objetos/Sustancias

**Paso 1: Detección**
- DOCENTE detecta objeto/sustancia
- No manipula sin guantes (protocolo)

**Paso 2: Registro**
- DOCENTE registra caso con tipo "Drogas" → "Presencia"
- Completa:
  - Tipo de objeto/sustancia
  - Ubicación
  - Descripción
  - Testigos

**Paso 3: Resguardo**
- DOCENTE o DIRECCION_UE resguarda objeto
- Toma fotografías como evidencia

**Paso 4: Evaluación**
- DIRECCION_UE evalúa:
  - ¿Es sustancia lícita? → Acta de depósito + archivo
  - ¿Es sospecha ilícita? → Continúa flujo

**Paso 5: Solicitud FELCN**
- Si es sospecha ilícita:
  - DIRECCION_UE solicita presencia de FELCN
  - Sistema registra solicitud
  - Sistema inicia contador: cierre de jornada
  - Sistema crea **EVENTO**: "Solicitud FELCN registrada - tiempo límite: {cierre_jornada}"

**Paso 6: Espera y Control**
- Sistema monitorea tiempo hasta cierre de jornada
- Si FELCN llega antes de cierre:
  - DIRECCION_UE marca "FELCN presente"
  - Sistema registra entrega
  - Sistema crea **EVENTO**: "Objeto entregado a FELCN"
  - Sistema cierra caso

**Paso 7: Procedimiento si FELCN no llega**
- Si no llega antes de cierre de jornada:
  - Sistema genera alerta crítica
  - Sistema notifica:
    - DIRECCION_UE
    - ADMIN_DISTRITO
    - ADMIN_DDE
  - DIRECCION_UE debe realizar:
    - Inventario con testigos
    - Acta de custodia
    - Resguardo seguro
  - Sistema registra acta de inventario
  - Sistema crea **EVENTO**: "Acta de inventario realizada - FELCN no llegó a tiempo"
  - Sistema actualiza estado: "En custodia hasta retiro oficial"

#### 4.5.2 Flujo: Consumo/Intoxicación

**Paso 1: Detección**
- DOCENTE detecta consumo o intoxicación
- Realiza escucha activa
- NO interroga

**Paso 2: Registro Inicial**
- DOCENTE registra caso: "Drogas" → "Consumo" o "Intoxicación"
- Completa información básica

**Paso 3: Acción Inmediata**
- Si intoxicación:
  - Sistema genera alerta de urgencia
  - DIRECCION_UE contacta familia
  - Derivación inmediata a Salud
  - Sistema crea **EVENTO**: "Derivación urgente a Salud por intoxicación"
- Si solo consumo:
  - DIRECCION_UE contacta familia
  - Sistema crea **EVENTO**: "Familia contactada"

**Paso 4: Seguimiento**
- SALUD_LECTURA registra valoración
- Sistema referencia a DNA
- DIRECCION_UE registra acta
- Sistema crea **EVENTO**: "Acta de consumo/intoxicación registrada"

---

### 4.6 Flujo: Plan CAP (Comisiones y Actividades)

#### 4.6.1 Fase: Construcción

**Actor:** DIRECCION_UE + COMISION_CAP_CONSTRUCCION

**Paso 1: Creación de Comisión**
- DIRECCION_UE crea comisión CAP
- Asigna miembros con rol COMISION_CAP_CONSTRUCCION
- Define periodo de trabajo
- Sistema crea **EVENTO**: "Comisión CAP de construcción creada - periodo {fecha_inicio} a {fecha_fin}"

**Paso 2: Elaboración del Plan**
- Miembros COMISION_CAP_CONSTRUCCION trabajan colaborativamente
- Sistema permite edición simultánea
- Sección: Diagnóstico, Objetivos, Actividades, Cronograma
- Sistema crea **EVENTO**: "Plan CAP en construcción - editado por {usuario}"

**Paso 3: Actas de Trabajo**
- Durante construcción, pueden generar actas de sesión
- Sistema permite elaborar acta con firmas
- Sistema crea **EVENTO**: "Acta de construcción CAP generada por {usuario}"

**Paso 4: Finalización**
- COMISION_CAP_CONSTRUCCION marca plan como "Listo para aprobación"
- Sistema crea **EVENTO**: "Plan CAP finalizado por comisión de construcción"

#### 4.6.2 Fase: Aprobación

**Actor:** DIRECCION_UE + COMISION_CAP_APROBACION

**Paso 1: Revisión**
- COMISION_CAP_APROBACION accede al plan
- Revisa contenido y ajusta si necesario
- Sistema crea **EVENTO**: "Plan CAP revisado por {usuario}"

**Paso 2: Aprobación**
- COMISION_CAP_APROBACION aprueba el plan
- DIRECCION_UE confirma aprobación
- Sistema marca plan como "Aprobado"
- Sistema crea **EVENTO**: "Plan CAP aprobado por {usuario}"

**Paso 3: Acta de Aprobación**
- Sistema genera acta de aprobación
- Se requieren firmas de comisión y dirección
- Sistema crea **EVENTO**: "Acta de aprobación CAP generada"

#### 4.6.3 Fase: Socialización

**Actor:** DIRECCION_UE + COMISION_CAP_SOCIALIZACION

**Paso 1: Planificación de Actividades**
- COMISION_CAP_SOCIALIZACION crea actividades
- Define cronograma, participantes, objetivos
- Sistema crea **EVENTO**: "Actividad de socialización CAP creada"

**Paso 2: Ejecución**
- Realización de actividades según cronograma
- Registro de asistentes
- Sistema crea **EVENTO**: "Actividad CAP ejecutada - {nombre_actividad}"

**Paso 3: Actas de Socialización**
- Elaboración de acta post-actividad
- Registro de resultados y evidencias
- Sistema crea **EVENTO**: "Acta de socialización CAP generada"

**Paso 4: Seguimiento y Evaluación**
- Evaluación de impacto
- Registro de indicadores
- Sistema crea **EVENTO**: "Seguimiento CAP actualizado"

---

## 5. Sistema de Eventos y Auditoría

### 5.1 Eventos de Creación

Cada vez que se crea una entidad principal:

- **EVENTO**: "Caso creado por {usuario} el {fecha}"
- **EVENTO**: "Derivación creada por {usuario} a {institución}"
- **EVENTO**: "Plan de Protección creado por {usuario}"
- **EVENTO**: "Contrarreferencia registrada por {institución} - {usuario}"

### 5.2 Eventos de Edición

Cada modificación registrada:

- **EVENTO**: "Caso actualizado por {usuario} - campo: {campo_modificado}"
- **EVENTO**: "Plan de Protección actualizado por {usuario}"
- **Datos guardados**: usuario_id, fecha, campos_anteriores, campos_nuevos, motivo (si aplica)

### 5.3 Eventos de Eliminación (Soft Delete)

Solo SUPER_ADMIN puede eliminar casos:

- **EVENTO**: "Caso eliminado por {SUPER_ADMIN} - razón: {razón}"
- **Datos**: caso_id, usuario_eliminador, fecha_eliminacion, razon_eliminacion
- Los casos eliminados quedan marcados pero no aparecen en búsquedas normales
- Sí aparecen en auditoría y reportes administrativos

**Restauración:**
- Solo SUPER_ADMIN puede restaurar casos eliminados
- Sistema crea **EVENTO**: "Caso restaurado por {SUPER_ADMIN} - caso_id: {id}"

### 5.4 Eventos de Cambios de Gestión

Cuando cambia el gestor principal de un caso:

- **EVENTO**: "Gestión transferida de {usuario_anterior} a {usuario_nuevo} por {autorizador}"
- **Datos**: usuario_anterior_id, usuario_nuevo_id, autorizador_id, caso_id, fecha, motivo

### 5.5 Eventos de Sistema

Eventos automáticos del sistema:

- "Derivación automática creada a {institución}"
- "Alerta SLA generada - {tipo_alert}"
- "Notificación enviada - {canal} - {destinatario}"
- "Backup creado - {timestamp}"
- "Integración ejecutada - {origen} → {destino}"

### 5.6 Consulta de Historial

**Quién puede ver historial:**
- **DOCENTE**: Solo casos propios
- **DIRECCION_UE**: Todos los casos de su U.E.
- **ADMIN_DISTRITO**: Casos de su distrito
- **ADMIN_DDE**: Casos del departamento
- **SUPER_ADMIN**: Todos los casos
- **Instituciones externas**: Solo casos derivados a ellos

---

## 6. Reglas Especiales y Automatizaciones

### 6.1 Derivación Automática de Violencia Sexual

**Condición:**
- Tipo de violencia = "Sexual"
- Edad de víctima registrada

**Acción:**
- Si edad < 18 años → Derivación automática a DNA
- Si edad ≥ 18 años → Derivación automática a SLIM

**Proceso:**
1. Sistema detecta al guardar caso
2. Sistema crea derivación automática
3. Sistema asigna usuario externo correspondiente
4. Sistema notifica a institución
5. DIRECCION_UE recibe notificación de derivación automática creada

### 6.2 SLA de Denuncia (≤ 24 horas)

**Condición:**
- Caso registrado sin derivación/denuncia después de 24 horas

**Acción:**
1. Sistema genera alerta a las 20 horas
2. Sistema genera alerta crítica a las 24 horas
3. Sistema notifica:
   - DIRECCION_UE (todas las alertas)
   - ADMIN_DISTRITO (alertas críticas)
   - ADMIN_DDE (alertas críticas)
4. Sistema registra incumplimiento en métricas

### 6.3 Alerta de Cierre de Jornada (Drogas)

**Condición:**
- Caso tipo "Drogas" → "Presencia" con solicitud FELCN
- Tiempo hasta cierre de jornada < 1 hora

**Acción:**
1. Sistema genera alerta preventiva
2. Sistema genera alerta crítica si no llega FELCN
3. Sistema obliga acta de inventario antes de marcar cierre

### 6.4 Recordatorios de Seguimiento

**Condición:**
- Fecha de control de medida de protección vencida
- Sin actualización de seguimiento

**Acción:**
1. Sistema genera recordatorio diario
2. Sistema genera alerta después de 3 días sin actualizar
3. Sistema escala a ADMIN_DISTRITO si > 7 días

### 6.5 Anonimización Automática en Reportes

**Condición:**
- Exportación de reportes desde niveles superiores a U.E.

**Acción:**
1. Sistema identifica datos sensibles:
   - Nombres de estudiantes
   - Nombres de familiares
   - Información de contacto
2. Sistema reemplaza con códigos o términos genéricos
3. Sistema mantiene metadatos para trazabilidad interna

### 6.6 Asignación Automática de GESTOR_PRINCIPAL

**Reglas:**
- Al crear caso → GESTOR_PRINCIPAL = creador (DOCENTE o DIRECCION_UE)
- Al transferir gestión → GESTOR_PRINCIPAL = nuevo asignado
- Cada cambio registrado en historial de eventos

---

## 7. Consideraciones Adicionales

### 7.1 Soft Delete de Casos

- Los casos **NO** se eliminan físicamente
- Solo SUPER_ADMIN puede marcar como "eliminado"
- Campos agregados:
  - `deletedAt: DateTime?`
  - `deletedBy: String?` (user_id)
  - `deletionReason: String?`
- Casos eliminados:
  - No aparecen en búsquedas normales
  - Sí aparecen en auditoría y reportes administrativos
  - Pueden ser restaurados por SUPER_ADMIN

### 7.2 Tipos de Violencia Expandidos

Se añaden dos nuevos tipos:

1. **Trata de Personas**: Requiere derivación inmediata a MP y DNA/SLIM según edad
2. **Drogas**: Ya existía como submódulo, ahora también como tipo principal

### 7.3 Módulo de Biblioteca - Métricas e IA

**Métricas a capturar:**
- Materiales visualizados
- Materiales descargados
- Cursos iniciados
- Cursos completados
- Tiempo promedio de visualización
- Usuarios únicos por material

**Reportes cualitativos con IA:**
- Análisis mensual de uso
- Identificación de tendencias
- Recomendaciones de contenido
- Resumen narrativo generado automáticamente

### 7.4 Trazabilidad de Gestores

- Cada caso mantiene historial completo de gestores
- Tabla de relación: `CasoGestor`
  - `caso_id`
  - `usuario_id`
  - `fecha_inicio`
  - `fecha_fin`
  - `transferido_por`
  - `motivo`

---

## 8. Resumen de Permisos por Rol

### DOCENTE
- ✅ Crear casos
- ✅ Ver casos de su U.E. (restringido)
- ✅ Editar casos propios
- ✅ Cargar evidencias
- ❌ Derivar/denunciar
- ❌ Eliminar casos
- ✅ Ver materiales de biblioteca
- ✅ Completar cursos

### DIRECCION_UE
- ✅ Gestión completa de casos de su U.E.
- ✅ Derivar y denunciar (obligatorio ≤ 24h)
- ✅ Crear y gestionar Plan de Protección
- ✅ Gestionar Comisiones CAP
- ✅ Crear usuarios de su U.E.
- ✅ Ver dashboard y reportes de su U.E.
- ✅ Ver contrarreferencias

### COMISION_CAP_*
- ✅ Trabajar en su fase específica (construcción/aprobación/socialización)
- ✅ Elaborar actas
- ✅ Ver casos relevantes para contextualizar
- ❌ Gestionar casos directamente

### ADMIN_DISTRITO
- ✅ Ver casos consolidados de su distrito
- ✅ Crear usuarios de su distrito
- ✅ Gestionar U.E. de su distrito
- ✅ Ver reportes y dashboards distritales
- ✅ Escalar alertas

### ADMIN_DDE
- ✅ Ver casos consolidados del departamento
- ✅ Crear usuarios de DDE y Distritos
- ✅ Ver reportes departamentales
- ✅ Supervisar y escalar

### DNA/SLIM/MP/SALUD_LECTURA
- ✅ Ver casos derivados a su institución
- ✅ Registrar contrarreferencias
- ✅ Adjuntar documentos
- ❌ Editar casos originales

### ADMIN_BIBLIOTECA
- ✅ Gestionar materiales y cursos
- ✅ Ver métricas completas
- ✅ Generar reportes cualitativos con IA

### SUPER_ADMIN
- ✅ Acceso total al sistema
- ✅ Eliminar casos (soft delete con auditoría)
- ✅ Restaurar casos eliminados
- ✅ Configurar sistema completo
- ✅ Gestión masiva de usuarios
- ✅ Ver toda la auditoría

---

**Fin del Documento**

Este documento debe ser actualizado conforme avance el desarrollo y se definan nuevos requerimientos o roles.


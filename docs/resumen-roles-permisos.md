# Resumen Rápido - Roles y Permisos

## Roles del Sistema (14 roles)

1. **SUPER_ADMIN** - Administrador máximo (eliminación de casos)
2. **ADMIN** - Administrador del sistema
3. **DOCENTE** - Registro inicial de casos
4. **DIRECCION** - Gestión completa de casos en U.E.
5. **COMISION_CAP_CONSTRUCCION** - Construcción del Plan CAP
6. **COMISION_CAP_APROBACION** - Aprobación del Plan CAP
7. **COMISION_CAP_SOCIALIZACION** - Socialización del Plan CAP
8. **DDE** - Supervisión departamental
9. **DDE_DISTRITO** - Supervisión a nivel distrito
10. **DNA** - Defensoría de la Niñez y Adolescencia
11. **SLIM** - Servicio Legal Integral Municipal
12. **SALUD** - Establecimientos de salud
13. **MP** - Ministerio Público
14. **FELCN** - Fuerza Especial de Lucha Contra el Narcotráfico

---

## Tabla de Permisos Rápida

### Gestión de Casos

| Rol | Crear | Ver | Editar | Derivar | Cerrar | Eliminar |
|-----|-------|-----|--------|---------|--------|----------|
| DOCENTE | ✅ Limitado | ✅ U.E. | ✅ Solo inicial | ❌ | ❌ | ❌ |
| DIRECCION | ✅ | ✅ U.E. | ✅ | ✅ | ✅ | ❌ |
| COMISION_CAP | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DDE | ❌ | ✅ Consolidado | ❌ | ❌ | ✅ Aprobar | ❌ |
| DNA/SLIM | ❌ | ✅ Derivados | ❌ | ❌ | ❌ | ❌ |
| SALUD | ❌ | ✅ Derivados | ❌ | ❌ | ❌ | ❌ |
| MP | ❌ | ✅ Denunciados | ❌ | ❌ | ❌ | ❌ |
| ADMIN | ❌ | ✅ Todo | ❌ | ❌ | ❌ | ❌ |
| SUPER_ADMIN | ✅ | ✅ Todo | ✅ | ✅ | ✅ | ⚠️ Con auditoría |

### Derivaciones y Contrarreferencias

| Rol | Crear Derivación | Recibir Derivación | Crear Contrarreferencia |
|-----|------------------|-------------------|------------------------|
| DOCENTE | ❌ | ❌ | ❌ |
| DIRECCION | ✅ | ✅ | ❌ |
| COMISION_CAP | ❌ | ❌ | ❌ |
| DDE | ❌ | ✅ | ❌ |
| DNA/SLIM | ❌ | ✅ | ✅ |
| SALUD | ❌ | ✅ | ✅ |
| MP | ❌ | ✅ | ✅ |
| ADMIN | ❌ | ✅ | ❌ |
| SUPER_ADMIN | ✅ | ✅ | ✅ |

### Plan CAP

| Rol | Crear Comisión | Construir | Aprobar | Socializar |
|-----|----------------|-----------|---------|------------|
| DOCENTE | ❌ | ❌ | ❌ | ❌ |
| DIRECCION | ✅ | ✅ | ✅ | ✅ |
| COMISION_CAP_CONSTRUCCION | ❌ | ✅ | ❌ | ❌ |
| COMISION_CAP_APROBACION | ❌ | ❌ | ✅ | ❌ |
| COMISION_CAP_SOCIALIZACION | ❌ | ❌ | ❌ | ✅ |
| DDE | ✅ Aprobar | ❌ | ✅ | ❌ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ |

### Bibliotecay Capacitación

| Rol | Ver Material | Subir Material | Ver Métricas |
|-----|--------------|----------------|--------------|
| DOCENTE | ✅ | ❌ | ✅ Propio |
| DIRECCION | ✅ | ❌ | ✅ U.E. |
| COMISION_CAP | ✅ | ❌ | ❌ |
| DDE | ✅ | ❌ | ✅ Consolidado |
| DNA/SLIM | ✅ | ❌ | ❌ |
| SALUD | ✅ | ❌ | ❌ |
| MP | ✅ | ❌ | ❌ |
| ADMIN | ✅ | ✅ | ✅ Todo |
| SUPER_ADMIN | ✅ | ✅ | ✅ Todo |

### Administración

| Rol | Crear Usuarios | Gestionar Catálogos | Configurar Sistema |
|-----|----------------|---------------------|-------------------|
| DOCENTE | ❌ | ❌ | ❌ |
| DIRECCION | ❌ | ❌ | ❌ |
| COMISION_CAP | ❌ | ❌ | ❌ |
| DDE | ⚠️ Su distrito | ❌ | ❌ |
| DNA/SLIM | ❌ | ❌ | ❌ |
| SALUD | ❌ | ❌ | ❌ |
| MP | ❌ | ❌ | ❌ |
| ADMIN | ✅ (hasta ADMIN) | ✅ | ✅ |
| SUPER_ADMIN | ✅ Todos | ✅ | ✅ |

---

## Flujos Principales

### 1. Flujo General de Caso
```
DOCENTE → Registra caso inicial
  ↓
DIRECCION → Recibe notificación
  ↓
DIRECCION → Completa registro, valora riesgo
  ↓
DIRECCION → Deriva/Denuncia (≤24h) → DNA/SLIM/MP/SALUD
  ↓
DNA/SLIM/MP/SALUD → Envía contrarreferencia
  ↓
DIRECCION → Crea plan de protección
  ↓
DIRECCION → Seguimiento
  ↓
DIRECCION/DDE → Cierre
```

### 2. Flujo Violencia Sexual (con derivación automática)
```
DOCENTE/DIRECCION → Registra caso
  ↓
Sistema → Deriva automáticamente:
  - < 18 años → DNA
  - ≥ 18 años → SLIM
  - Siempre → MP (si hay delito)
  ↓
DIRECCION → Plan de protección especial
  ↓
DNA/SLIM/MP → Contrarreferencias
  ↓
DIRECCION → Seguimiento estricto → Cierre
```

### 3. Flujo Submódulo Drogas
```
DOCENTE/DIRECCION → Detecta objeto/sustancia
  ↓
DIRECCION → Notifica FELCN
  ↓
SLA: FELCN debe llegar antes cierre jornada
  ↓
Si no llega: DIRECCION → Inventario + Acta + Custodia
  ↓
FELCN → Retira oficialmente
```

### 4. Flujo CAP
```
DIRECCION → Crea comisión CAP
  ↓
COMISION_CAP_CONSTRUCCION → Construye plan
  ↓
COMISION_CAP_APROBACION → Aprueba plan
  ↓
DIRECCION → Define cronograma
  ↓
COMISION_CAP_SOCIALIZACION → Ejecuta actividades
  ↓
DIRECCION → Evalúa indicadores
```

---

## Creación de Usuarios

| Creador | Puede Crear |
|---------|-------------|
| SUPER_ADMIN | Todos los roles |
| ADMIN | Todos excepto SUPER_ADMIN |
| DDE | DOCENTE, DIRECCION, COMISION_CAP_*, DDE_DISTRITO (solo su distrito) |

---

## Ámbitos de Acceso

| Rol | Ámbito |
|-----|--------|
| DOCENTE | Una U.E. |
| DIRECCION | Una U.E. |
| COMISION_CAP | Una U.E. |
| DDE_DISTRITO | Un distrito |
| DDE | Departamento |
| DNA/SLIM/SALUD/MP/FELCN | Según derivaciones/denuncias recibidas |
| ADMIN | Configurable (generalmente todo) |
| SUPER_ADMIN | Sistema completo |

---

## Eventos y Auditoría

**Todos los eventos incluyen**:
- Usuario responsable
- Fecha/hora
- IP y dispositivo
- Tipo de acción (CREATE/READ/UPDATE/DELETE)
- Valores anteriores/nuevos

**Eliminación de casos**:
- Solo SUPER_ADMIN
- No es borrado físico (marcado como eliminado)
- Registro completo de auditoría con snapshot
- Motivo obligatorio

---

## Nuevos Tipos de Violencia

1. Física
2. Psicológica
3. Sexual
4. Digital/Ciberacoso
5. **Trata de Personas** (NUEVO)
6. **Drogas** (NUEVO)

---

## Funcionalidades Especiales

### Derivación Automática por Edad
- Violencia sexual < 18 años → DNA
- Violencia sexual ≥ 18 años → SLIM
- Siempre → MP (si hay delito)
- Estado: Pendiente de confirmación

### Material de Capacitación
- Métricas: Visitas, descargas, cursos completados
- Relato cualitativo con IA (mensual)
- Reportes de acciones incluyen métricas de capacitación

### Historial de Responsables
- Registro de quién gestiona el caso en cada etapa
- Permite cambios de responsable durante el proceso
- Todos los eventos vinculados al responsable activo


# Flujos y Roles Detallados - Plataforma de Monitoreo de Violencia Escolar

## Tabla de Contenidos
1. [Roles y Descripción](#roles-y-descripción)
2. [Matriz de Permisos por Rol](#matriz-de-permisos-por-rol)
3. [Flujos Detallados por Proceso](#flujos-detallados-por-proceso)
4. [Creación de Usuarios](#creación-de-usuarios)
5. [Accesos por Rol y Ámbito](#accesos-por-rol-y-ámbito)
6. [Gestión de Eventos y Auditoría](#gestión-de-eventos-y-auditoría)

---

## Roles y Descripción

### 1. SUPER_ADMIN
**Descripción**: Administrador máximo del sistema. Tiene acceso completo a todas las funcionalidades y puede realizar cualquier acción, incluyendo eliminación de casos (con registro de auditoría).

**Ámbito**: Sistema completo (sin restricciones).

**Características**:
- Único rol que puede eliminar casos (registro permanente en auditoría)
- Gestiona todos los roles y usuarios
- Acceso a toda la información sin restricciones
- Puede configurar parámetros del sistema
- Gestiona integraciones y conectores externos

---

### 2. ADMIN
**Descripción**: Administrador del sistema con permisos de gestión y configuración, pero sin capacidad de eliminación de casos.

**Ámbito**: Configurable (generalmente DDE o Departamental).

**Características**:
- Gestiona catálogos y estructura orgánica
- Puede crear usuarios con roles inferiores (hasta ADMIN)
- Acceso a analítica consolidada
- Configura parámetros de alertas y plantillas

---

### 3. DOCENTE
**Descripción**: Personal docente que puede registrar casos iniciales de violencia dentro de su unidad educativa.

**Ámbito**: Una Unidad Educativa específica.

**Características**:
- Registra casos de sospecha o revelación
- Adjunta evidencias iniciales
- Acceso de lectura a casos de su U.E. (limitado)
- Puede ver material de capacitación

---

### 4. DIRECCION
**Descripción**: Director o directora de la Unidad Educativa. Responsable de la gestión completa de casos en su U.E.

**Ámbito**: Una Unidad Educativa específica.

**Características**:
- Recibe notificaciones inmediatas de nuevos casos
- Registra y gestiona casos completos en su U.E.
- Valora riesgo y crea planes de protección
- Deriva/denuncia a instituciones externas (DNA, SLIM, MP, Salud)
- Gestiona derivaciones y recibe contrarreferencias
- Acceso completo a casos de su U.E.
- Puede crear y gestionar actas
- Gestiona el Plan CAP (comisiones y actividades)
- Acceso a reportería de su U.E.

---

### 5. COMISION_CAP_CONSTRUCCION
**Descripción**: Miembro de la comisión CAP encargado de la construcción del Plan de Convivencia.

**Ámbito**: Una Unidad Educativa específica.

**Características**:
- Acceso a módulo CAP
- Crea y edita actas de construcción
- Participa en cronogramas de actividades
- Acceso de lectura a casos anonimizados (solo para contexto del CAP)

---

### 6. COMISION_CAP_APROBACION
**Descripción**: Miembro de la comisión CAP encargado de aprobar el Plan de Convivencia.

**Ámbito**: Una Unidad Educativa específica.

**Características**:
- Aprueba actas y planes CAP
- Firma documentos del CAP
- Acceso de lectura a casos anonimizados

---

### 7. COMISION_CAP_SOCIALIZACION
**Descripción**: Miembro de la comisión CAP encargado de socializar el Plan de Convivencia.

**Ámbito**: Una Unidad Educativa específica.

**Características**:
- Registra actividades de socialización
- Crea actas de socialización
- Genera reportes de actividades realizadas
- Acceso de lectura a material de sensibilización

---

### 8. DDE
**Descripción**: Personal de la Dirección Departamental de Educación. Supervisión y analítica consolidada.

**Ámbito**: Nivel departamental (acceso a múltiples distritos y U.E.).

**Características**:
- Acceso de lectura a todos los casos (consolidado)
- Recibe contrarreferencias
- Acceso a dashboards y analítica consolidada
- Puede escalar alertas críticas
- Gestiona estructura orgánica (distritos y U.E.)
- Acceso a reportes con datos anonimizados

---

### 9. DDE_DISTRITO
**Descripción**: Personal de la DDE a nivel de distrito educativo.

**Ámbito**: Un distrito específico (múltiples U.E.).

**Características**:
- Acceso de lectura a casos de su distrito
- Recibe contrarreferencias de casos del distrito
- Acceso a analítica de su distrito
- Puede gestionar usuarios de su distrito (con permisos)

---

### 10. DNA
**Descripción**: Personal de la Defensoría de la Niñez y Adolescencia. Acceso para recibir derivaciones y enviar contrarreferencias.

**Ámbito**: Nivel departamental.

**Características**:
- Recibe derivaciones (casos < 18 años principalmente)
- Crea y envía contrarreferencias
- Acceso de lectura a casos derivados a ellos
- Puede solicitar información adicional

---

### 11. SLIM
**Descripción**: Personal del Servicio Legal Integral Municipal. Acceso para recibir derivaciones y enviar contrarreferencias.

**Ámbito**: Nivel municipal o departamental según configuración.

**Características**:
- Recibe derivaciones (casos > 18 años principalmente)
- Crea y envía contrarreferencias
- Acceso de lectura a casos derivados a ellos
- Puede solicitar información adicional

---

### 12. SALUD
**Descripción**: Personal de establecimientos de salud. Acceso para recibir derivaciones de casos clínicos y enviar contrarreferencias médicas.

**Ámbito**: Establecimiento de salud específico.

**Características**:
- Recibe derivaciones de casos con lesiones/urgencias
- Crea contrarreferencias clínicas (con datos médicos protegidos)
- Acceso de lectura limitado a información clínica relevante
- Puede indicar medidas de protección relacionadas con salud

---

### 13. MP
**Descripción**: Personal del Ministerio Público. Acceso para recibir denuncias y enviar contrarreferencias judiciales.

**Ámbito**: Nivel departamental o según jurisdicción.

**Características**:
- Recibe denuncias de casos penales
- Crea contrarreferencias judiciales
- Acceso de lectura a casos denunciados
- Puede solicitar información adicional para investigación

---

### 14. FELCN
**Descripción**: Fuerza Especial de Lucha Contra el Narcotráfico. Acceso limitado para casos relacionados con drogas.

**Ámbito**: Nivel departamental.

**Características**:
- Recibe notificaciones de casos de drogas ilícitas
- Confirma recepción de objetos/sustancias
- Acceso de lectura limitado a casos de drogas

---

## Matriz de Permisos por Rol

### Gestión de Casos

| Acción | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Registrar caso** | ✅ Crear (limitado) | ✅ Crear/Actualizar | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Todo |
| **Ver caso (su ámbito)** | ✅ Lectura (limitada) | ✅ Lectura completa | ❌ | ✅ Lectura consolidada | ✅ Solo derivados | ✅ Solo derivados clínicos | ✅ Solo denunciados | ✅ Todo | ✅ Todo |
| **Valorar riesgo** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Crear plan de protección** | ❌ | ✅ | ❌ | ❌ | ❌ | ⚠️ Indicaciones | ❌ | ❌ | ✅ |
| **Derivar/Denunciar** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Recibir contrarreferencias** | ❌ | ✅ Recibir | ❌ | ✅ Recibir | ✅ Crear | ✅ Crear | ✅ Crear | ✅ | ✅ |
| **Enviar contrarreferencias** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Editar caso** | ✅ Solo inicial | ✅ Completo | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Todo |
| **Elim脱口OGM caso** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Solo SUPER_ADMIN (auditoría) |
| **Cerrar caso** | ❌ | ✅ | ❌ | ✅ Puede aprobar | ❌ | ❌ | ❌ | ❌ | ✅ |

### Submódulos Especiales

| Submódulo | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|-----------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Violencia sexual** | ✅ Registrar (limitado) | ✅ Gestionar completo | ❌ | ✅ Ver consolidado | ✅ Recibir (<18 DNA, >18 SLIM) | ✅ Recibir (valoración clínica) | ✅ Recibir (delito) | ✅ Todo | ✅ Todo |
| **Lesiones/Urgencias** | ✅ Registrar | ✅ Gestionar | ❌ | ✅ Ver | ❌ | ✅ Recibir (prioritario) | ✅ Si es delito | ✅ | ✅ |
| **Submódulo Drogas** | ✅ Registrar presencia | ✅ Gestionar completo | ❌ | ✅ Ver | ❌ | ✅ Intoxicación | ❌ | ✅ | ✅ |
| **Ciberacoso** | ✅ Registrar | ✅ Gestionar | ❌ | ✅ Ver | ✅ Recibir | ❌ | ✅ Si delito | ✅ | ✅ |
| **Personal U.E. como agresor** | ✅ Registrar (con restricciones) | ✅ Gestionar (con alertas especiales) | ❌ | ✅ Ver (con protocolo especial) | ✅ Recibir | ❌ | ✅ Si delito | ✅ | ✅ |

### Plan CAP

| Acción | DOCENTE | DIRECCION | COMISION_CAP_CONSTRUCCION | COMISION_CAP_APROBACION | COMISION_C conciseSOCIALIZACION | DDE | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|---------------------------|-------------------------|------------------|-----|-------|-------------|
| **Crear comisión** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ Aprobar | ✅ | ✅ |
| **Editar comisión** | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Crear acta de chastrucción** | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ Ver | ✅ | ✅ |
| **Aprobar acta** | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Crear actividad socialización** | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ Ver | ✅ | ✅ |
| **Registrar asistencia** | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Ver cronograma CAP** | ✅ Lectura | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Evaluar indicadores CAP** | ❌ | ✅ | ⚠️ Puede aportar | ⚠️ Puede aportar | ⚠️ Puede aportar | ✅ | ✅ | ✅ |

### Analítica y Reportería

| Acción | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Ver dashboard** | ❌ | ✅ U.E. | ❌ | ✅ Consolidado | ❌ discussions| ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Ver KPIs** | ❌ | ✅ U.E. | ❌ | ✅ Distrito/Departamental | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Exportar reportes** | ❌ | ✅ U.E. (anonymizados) | ❌ | ✅ Consolidado (anonymizados) | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Ver mapa de calor** | ❌ | ✅ U.E. | ❌ | ✅ Distrito/Departamental | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Ver métricas de material** | ✅ Propio | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |

### Biblioteca y Sensibilización

| Acción | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Ver material** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Subir material** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Editar material** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Eliminar material** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Solo ADMIN | ✅ |
| **Ver métricas (visitas, descargas)** | ✅ Propio | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Ver relato cualitativo IA** | ✅ Propio | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |

### Administración

| Acción | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Gestionar catálogos** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gestionar U.E./Distritos** | ❌ | ❌ | ❌ | ✅ Asignar (limitado) | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Crear usuarios** | ❌ | ❌ | ❌ | ⚠️ Usuarios de su distrito | ❌ | ❌ | ❌ | ✅ (hasta ADMIN) | ✅ (todos) |
| **Editar usuarios** | ❌ | ❌ | ❌ | ⚠️ Usuarios de su distrito | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Eliminar usuarios** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Con restricciones | ✅ |
| **Configurar alertas** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gestionar plantillas** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar integraciones** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Ver auditoría completa** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Limitado | ✅ Completo |

### Alertas y SLA

| Acción | DOCENTE | DIRECCION | COMISION_CAP_* | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|----------------|-----|----------|-------|-----|-------|-------------|
| **Recibir alertas** | ⚠️ Alertas de casos propios | ✅ Todas de su U.E. | ❌ | ✅ Escalamiento | ⚠️ Alertas de derivaciones | ⚠️ Alertas de derivaciones | ⚠️ Alertas de denuncias | ✅ Todas | ✅ Todas |
| **Resolver alertas** | ❌ | ✅ Alertas de su U.E. | ❌ | ✅ Puede escalar | ⚠️ Marcar como recibido | ⚠️ Marcar como recibido | ⚠️ Marcar como recibido | ✅ | ✅ |
| **Configurar reglas SLA** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Flujos Detallados por Proceso

### Flujo 1: Sospecha o Revelación (Cualquier Tipo de Violencia)

**Roles participantes**: DOCENTE, DIRECCION, DNA/SLIM, MP, SALUD (según tipo)

**Proceso detallado**:

1. **Rece**: DOCENTE
   - Acción: Escucha activa, sin promesas, registro inicial
   - Crea: Registro inicial de caso (estado: "Recepción")
   - Notifica: DIRECCION de su U.E. (inmediato, in-app)
   - Permisos necesarios: Crear caso (limitado)

2. **Notificación**: Sistema automático
   - Acción: Envía notificación in-app a DIRECCION
   - Crea: Evento de notificación
   - Permisos: Automático

3. **Registro inicial**: DIRECCION
   - Acción: Completa información del caso (tipificación, ámbito, descripción, evidencias)
   - Crea: Caso completo (estado: "Registro inicial")
   - Actualiza: Caso creado por DOCENTE
   - Permisos necesarios: Actualizar caso, adjuntar evidencias

4. **Valoración de riesgo**: DIRECCION
   - Acción: Aplica checklists y reglas de valoración
   - Actualiza: Nivel de riesgo del caso (estado: "Valoración de riesgo")
   - Crea: Valoración de riesgo (registro histórico)
   - Permisos necesarios: Valorar riesgo

5. **Derivación/Denuncia** (≤ 24h): DIRECCION
   - Acción: Selecciona institución destino, completa plantilla, adjunta documentos
   - Crea: Derivación (con SLA de 24h)
   - Sistema automático: 내보내기 automático a DNA/SLIM/MP/Salud según tipo
   - Estado caso: "Derivación/Denuncia"
   - Permisos necesarios: Crear derivación
   - **Regla especial**: Si violencia sexual:
     - < 18 años: Derivación automática a DNA
     - ≥ 18 años: Derivación automática a SLIM
     - Además: Derivación a MP si hay indicios de delito

6. **Acuse de recepción**: DNA/SLIM/MP/SALUD
   - Acción: Confirma recepción de derivación
   - Crea: Acuse de recepción
   - Actualiza: Estado de derivación
   - Permisos necesarios: Crear acuse de recepción

7. **Plan de protección**: DIRECCION
   - Acción: Define medidas (académicas, ambientales, psicosociales), responsables y fechas de control
   - Crea: Plan de protección
   - Estado caso: "Plan de protección"
   - Permisos necesarios: Crear plan de protección

8. **Seguimiento**: DIRECCION
   - Acción: Registra avances, controles de medidas, nuevas situaciones
   - Actualiza: Caso, plan de protección
   - Estado caso: "Seguimiento"
   - Crea: Registros de seguimiento (eventos)
   - Permisos necesarios: Actualizar caso, crear registros de seguimiento

9. **Contrarreferencia**: DNA/SLIM/MP/SALUD
   - Acción: Responde con acciones realizadas, adjunta documentos
   - Crea: Contrarreferencia
   - Notifica: DIRECCION
   - Actualiza: Caso (se añade a línea de tiempo)
   - Permisos necesarios: Crear contrarreferencia

10. **Cierre**: DIRECCION o DDE
    - Acción: Evalúa criterios de cierre, completa999 acta de cierre
    - Actualiza: Estado caso: "Cierre"
    - Crea: Acta de cierre
    - Permisos necesarios: Cerrar caso

**Eventos generados**:
- Caso creado (por DOCENTE)
- Notificación enviada (sistema)
- Caso actualizado (por DIRECCION)
- Valoración de riesgo creada
- Derivación creada
- Acuse de recepción recibido
- Plan de protección creado
- Seguimiento registrado (múltiples)
- Contrarreferencia recibida (puede ser múltiple)
- Caso cerrado

---

### Flujo 2: Violencia Física/Psicológica Entre Estudiantes (Sin Lesiones Graves)

**Roles participantes**: DOCENTE, DIRECCION, DNA/SLIM (si aplica)

**Proceso detallado**:

1. **Contención**: DOCENTE
   - Acción: Separa a los involucrados, asegura seguridad
   - Registra: Incidente inicial
   - Notifica: DIRECCION inmediato

2. **Registro**: DIRECCION
   - Acción: Registra caso completo
   - Tipifica: Física o Psicológica
   - Valora: Nivel de riesgo y afectación
   - Permisos: Crear caso completo

3. **Notificación a familias**: DIRECCION
   - Acción: Comunica a familias involucradas (fuera del sistema, pero registrado)

4. **Decisión de derivación**: DIRECCION
   - Si afectación relevante/reiteración: Deriva a DNA/SLIM
   - Si caso leve: Medidas restaurativas/Plan CAP (sin derivación)

5. **Seguimiento y cierre**: DIRECCION
   - Monitorea cumplimiento de medidas
   - Cierra cuando se resuelve

**Eventos generados**:
- Caso creado
- Medidas aplicadas
- Derivación (si aplica)
- Seguimiento
- Cierre

---

### Flujo 3: Lesiones o Riesgo Alto (Urgencia)

**Roles participantes**: DOCENTE, DIRECCION, SALUD, DNA/SLIM, MP

**Proceso detallado**:

1. **Atención inmediata**: DOCENTE o DIRECCION
   - Acción: Activa respuesta de salud inmediata
   - Notifica: SALUD (prioritario)

2. **Registro paralelo**: DIRECCION
   - Acción: Registra caso mientras se atiende en salud
   - Estado: "Urgencia"

3. **Derivación salud**: DIRECCION → SALUD
   - Acción: Deriva con prioridad
   - SLA: Inmediato (sin 24h)

4. **Derivación/Denuncia** (≤ 24h): DIRECCION
   - Acción: Deriva a DNA/SLIM/MP según corresponda
   - Adjunta: Constancias médicas (cuando estén disponibles)

5. **Contrarreferencia salud**: SALUD
   - Acción: Envía constancia médica y recomendaciones
   - Permisos: Crear contrarreferencia clínica

6. **Plan de protección reforzado**: DIRECCION
   - Acción: Crea plan con medidas más estrictas

7. **Cierre con constancias**: DIRECCION
   - Acción: Cierra con todas las constancias médicas y judiciales

**Eventos generados**:
- Caso creado (urgencia)
- Derivación a salud (inmediata)
- Contrarreferencia de salud
- Derivación/denuncia (≤24h)
- Plan de protección reforzado
- Cierre

---

### Flujo 4: Violencia Sexual (Cualquier Indicio)

**Roles participantes**: DOCENTE, DIRECCION, MP, DNA/SLIM, SALUD

**Proceso detallado**:

1. **Protección inmediata**: DOCENTE o DIRECCION
   - Acción: Protege y contiene, no interroga, no promete resultados
   - Registra: Caso inicial con máxima confidencialidad

2. **Denuncia inmediata** (≤ 24h): DIRECCION
   - Acción: Denuncia automática a:
     - MP (siempre)
     - DNA (si < 18 años) - **AUTOMÁTICO**
     - SLIM (si ≥ 18 años) - **AUTOMÁTICO**
   - Sistema: Genera derivaciones automáticas según edad del afectado
   - Estado: "Derivación/Denuncia"

3. **Derivación a salud**: DIRECCION → SALUD
   - Acción: Deriva para valoración clínica y cadena de custodia
   - Prioridad: Máxima

4. **Medidas escolares**: DIRECCION
   - Acción: Aplica medidas inmediatas:
     - Confidencialidad estricta
     - Ajustes académicos
     - Restricción de contacto
   - Crea: Plan de protección especial

5. **Contrarreferencias**: MP, DNA/SLIM, SALUD
   - Acción: Envían respuestas y acciones realizadas
   - DIRECCION: Registra todas las contrarreferencias

6. **Seguimiento estricto**: DIRECCION
   - Acción: Seguimiento continuo hasta cierre con todas las contrarreferencias

**Eventos generados**:
- Caso creado (violencia sexual)
- Denuncia automática a MP
- Derivación automática a DNA/SLIM (según edad)
- Derivación a salud
- Plan de protección especial
- Contrarreferencias (múltiples)
- Seguimiento estricto
- Cierre

---

### Flujo 5: Ciberacoso / Violencia Digital

**Roles participantes**: DOCENTE, DIRECCION, DNA/SLIM, MP

**Proceso detallado**:

1. **Conservación de evidencias**: DOCENTE o DIRECCION
   - Acción: Captura pantallas, guarda enlaces, sin difundir
   - Adjunta: Evidencias digitales (con hash para integridad)

2. **Registro**: DIRECCION
   - Acción: Registra caso de ciberacoso
   - Tipifica: Violencia Digital

3. **Derivación**: DIRECCION
   - Acción: Deriva a DNA/SLIM
   - Si hay delito (pornografía, grooming, amenazas): También deriva a MP

4. **Protección y educación**: DIRECCION
   - Acción: Educa a familias sobre protección digital
   - Crea: Plan de protección digital

5. **Seguimiento y cierre**: DIRECCION

**Eventos generados**:
- Caso creado (ciberacoso)
- Evidencias adjuntadas
- Derivación a DNA/SLIM/MP
- Plan de protección digital
- Seguimiento
- Cierre

---

### Flujo 6: Submódulo Drogas (Objetos o Sustancias)

**Roles participantes**: DOCENTE, DIRECCION, SALUD (si intoxicación), FELCN

**Escenario A: Presencia de objeto/sustancia (nadie posee)**

1. **Detección**: DOCENTE
   - Acción: Detecta objeto/sustancia, NO manipula sin guantes
   - Registra: Caso inicial

2. **Resguardo**: DIRECCION
   - Acción: Resguarda objeto de forma segura
   - Si sustancia lícita: Crea acta + depósito
   - Si sospecha ilícita: Notifica a FELCN

3. **Espera FELCN**: DIRECCION
   - SLA: FELCN debe llegar antes del cierre de jornada
   - Si FELCN no llega: Crea inventario con testigos + acta, custodia hasta retiro oficial
   - Sistema: Genera alerta si FELCN no llega antes del cierre

4. **Retiro oficial**: FELCN
   - Acción: Confirma recepción
   - Crea: Acuse de recepción

**Escenario B: Consumo/Intoxicación**

1. **Detección**: DOCENTE o DIRECCION
   - Acción: Escucha activa, identifica consumo/intoxicación
   - Si intoxicación: Activa salud inmediato

2. **Registro y acta**: DIRECCION
   - Acción: Crea acta de consumo/intoxicación
   - Notifica: Familia

3. **Derivación salud** (si intoxicación): DIRECCION → SALUD
   - Acción: Deriva con prioridad
   - SALUD: Atiende y envía contrarreferencia

4. **Referencia a DNA**: DIRECCIONOccasion
   - Acción: Deriva para apoyo psicosocial

5. **Reporte estadístico**: DIRECCION
   - Acción: Genera reporte para estadísticas

**Eventos generados**:
- Caso creado (drogas)
- Notificación a FELCN
- Alerta si FELCN no llega (cierre de jornada)
- Acta de inventario (si aplica)
- Acuse de FELCN
- Derivación a salud (si intoxicación)
- Contrarreferencia de salud
- Referencia a DNA
- Reporte estadístico

---

### Flujo 7: Personal de la U.E. como Presunto Agresor

**Roles participantes**: DOCENTE, DIRECCION, DDE, MP

**Proceso detallado** (con protocolo especial):

1. **Registro con restricciones**: DOCENTE
   - Acción documenting: Registra caso con alerta especial
   - Sistema: Activa protocolo especial (menor acceso, más auditoría)

2. **Notificación múltiple**: Sistema
   - Acción: Notifica a DIRECCION y DDE simultáneamente
   - Nivel: Crítico

3. **Gestión con protocolo**: DIRECCION
   - Acción: Gestiona con protocolo especial (más restricciones de acceso)
   - Todas las acciones: Con auditoría adicional

4. **Supervisión DDE**: DDE
   - Acción: Supervisa caso directamente
   - Puede tomar control del caso

5. **Derivación judicial**: DIRECCION o DDE
   - Acción: Deriva a MP (siempre, por ser personal de U.E.)

6. **Seguimiento especial**: DDE + DIRECCION
   - Acción: Seguimiento coordinado

**Eventos generados**:
- Caso creado (protocolo especial activado)
- Notificación múltiple (DIRECCION + DDE)
- Todas las acciones con auditoría adicional
- Derivación a MP
- Contrarreferencias
- Cierre

---

### Flujo 8: Gestión del Plan CAP (Convivencia)

**Roles participantes**: DIRECCION, COMISION_CAP_*, DDE

**Proceso detallado**:

1. **Creación de comisión**: DIRECCION
   - Acción: Crea comisión CAP (construcción, aprobación, socialización)
   - Asigna: Integrantes con roles específicos
   - Permisos: Crear comisión

2. **Construcción del plan**: COMISION_CAP_CONSTRUCCION
   - Acción: Trabaja en la construcción del plan
   - Crea: Actas de construcción
   - Permisos: Crear actas de construcción

3. **Aprobación**: COMISION_CAP_APROBACION
   - Acción: Revisa y aprueba el plan
   - Crea: Acta de aprobación con firmas
   - Permisos: Aprobar actas

4. **Cronograma**: DIRECCION
   - Acción: Define cronograma de actividades de socialización
   - Permisos: Gestionar cronograma

5. **Socialización**: COMISION_CAP_SOCIALIZACION
   - Acción: Ejecuta actividades de socialización
   - Crea: Actas de actividades con asistentes
   - Registra: Participación y materiales entregados
   - Permisos: Crear actividades de socialización

6. **Seguimiento y evaluación**: DIRECCION
   - Acción: Evalúa indicadores de cumplimiento
   - Genera: Reportes de evaluación
   - Permisos: Evaluar indicadores

**Eventos generados**:
- Comisión CAP creada
- Actas de construcción
- Acta de aprobación
- Cronograma creado
- Actividades de socialización (múltiples)
- Actas de actividades
- Evaluación de indicadores

---

### Flujo 9: Biblioteca y Material de Capacitación

**Roles participantes**: Todos (lectura), ADMIN/SUPER_ADMIN (gestión)

**Proceso de subida de material**:

1. **Subida**: ADMIN o SUPER_ADMIN
   - Acción: Sube material (protocolos, guías, materiales de prevención)
   - Crea: Registro de material con metadatos (versión, etiquetas, tipo)
   - Permisos: Crear material

2. **Versionado**: Sistema automático
   - Acción: Mantiene versiones anteriores del material
   - Permisos: Automático

**Proceso de consumo**:

1. **Acceso**: Cualquier usuario autenticado
   - Acción: Busca y visualiza material
   - Sistema: Registra acceso (métrica)

2. **Descarga**: Usuario
   - Acción: Descarga material
   - Sistema: Registra descarga (métrica)

3. **Completar curso** (si aplica): Usuario
   - Acción: Completa curso o capacitación
   - Sistema: Registra finalización (métrica)

**Proceso de métricas y reportes**:

1. **Recolección**: Sistema automático
   - Métricas: Visitas, descargas, finalizaciones de cursos, usuarios únicos
   - Periodicidad: Diaria

2. **Análisis con IA**: Sistema (mensual)
   - Acción: Genera relato cualitativo en base a métricas
   - Permisos: ADMIN/SUPER_ADMIN/DDE pueden ver

3. **Reportes**: ADMIN/SUPER_ADMIN/DDE
   - Acción: Visualiza y exporta reportes de métricas
   - Permisos: Ver métricas según ámbito

**Eventos generados**:
- Material creado
- Material actualizado (con versionado)
- Material eliminado (solo ADMIN/SUPER_ADMIN, con auditoría)
- Acceso a material (métrica)
- Descarga de material (métrica)
- Curso completado (métrica)
- Relato cualitativo generado (mensual)

---

## Creación de Usuarios

### Quién puede crear qué usuarios

| Rol Creador | Puede crear |
|-------------|-------------|
| **SUPER_ADMIN** | Todos los roles |
| **ADMIN** | DOCENTE, DIRECCION, COMISION_CAP_*, DDE, DDE_DISTRITO, DNA, SLIM, SALUD, MP, FELCN, ADMIN |
| **DDE** | DOCENTE, DIRECCION, COMISION_CAP_*, DDE_DISTRITO (solo de su distrito/departamento) |
| Otros roles | ❌ No pueden crear usuarios |

### Reglas de creación

1. **Ámbito**: 
   - SUPER_ADMIN: Sin restricciones de ámbito
   - ADMIN: Puede crear usuarios de cualquier ámbito
   - DDE: Solo puede crear usuarios de su distrito/departamento

2. **Jerarquía de roles**:
   - SUPER_ADMIN puede crear cualquier rol
   - ADMIN no puede crear SUPER_ADMIN
   - DDE solo puede crear roles operativos (DOCENTE, DIRECCION, COMISION_CAP_*, DDE_DISTRITO)

3. **Asignación de U.E./Distrito**:
   - SUPER_ADMIN y ADMIN: Sin restricciones
   - DDE: Solo puede asignar a U.E./Distritos bajo su jurisdicción

4. **Fuerza cambio de contraseña**:
   - Todos los usuarios nuevos: `forcePasswordChange = true`
   - Contraseña temporal: Generada automáticamente y enviada por email

---

## Accesos por Rol y Ámbito

### Restricciones por Ámbito (ABAC - Attribute-Based Access Control)

| Rol | Ámbito | Alcance de Acceso |
|-----|--------|-------------------|
| **DOCENTE** | Una U.E. | Solo casos de su U.E. |
| **DIRECCION** | Una U.E. | Todos los casos de su U.E. |
| **COMISION_CAP_*** | Una U.E. | Módulo CAP de su U.E. |
| **DDE_DISTRITO** | Un distrito | Casos consolidados de su distrito |
| **DDE** | Departamento | Casos consolidados departamentales |
| **DNA** | Departamental | Solo casos derivados a ellos (filtrado automático) |
| **SLIM** | Municipal/Departamental | Solo casos derivados a ellos |
| **SALUD** | Establecimiento | Solo casos derivados a ellos (información clínica) |
| **MP** | Jurisdicción | Solo casos denunciados a ellos |
| **FELCN** | Departamental | Solo casos de drogas |
| **ADMIN** | Configurable | Según configuración (generalmente todo el sistema) |
| **SUPER_ADMIN** | Sistema completo | Sin restricciones |

### Row-Level Security (RLS)

**Implementación**:
- Cada consulta filtra por ámbito del usuario
- Los casos solo son visibles según:
  - U.E. del usuario
  - Distrito del usuario
  - Departamental (si corresponde)
  - Derivaciones/Denuncias recibidas (para DNA/SLIM/MP/SALUD)

**Excepciones**:
- SUPER_ADMIN: Sin filtros
- ADMIN: Sin filtros (configurable)
- DDE: Filtro por departamento

### Segregación de Datos Sensibles Keywords

1. **Datos clínicos**: Solo SALUD y DIRECCION (casos derivados) pueden ver
2. **Datos penales**: Solo MP y DIRECCION (casos denunciados) pueden ver
3. **Datos de identidad**: Restringidos según necesidad
4. **Reportes**: Siempre anonimizados cuando se exportan

---

## Gestión de Eventos y Auditoría

### Eventos CRUD Generados

**Todos los eventos se registran con**:
- Usuario que realizó la acción
- Fecha y hora
- IP y dispositivo
- Tipo de acción (CREATE, READ, UPDATE, DELETE)
- Entidad afectada
- Valores anteriores (si UPDATE/DELETE)
- Valores nuevos (si CREATE/UPDATE)

### Eventos por Entidad

#### Caso
- `CASE_CREATED`: Cuando se crea un caso (DOCENTE o DIRECCION)
- `CASE_UPDATED`: Cada actualización del caso
- `CASE_STATUS_CHANGED`: Cambio de estado del caso
- `CASE_DELETED`: Solo SUPER_ADMIN (con valores completos guardados)
- `CASE_VIEWED`: Acceso de lectura (registrado para auditoría)

#### Derivación
- `DERIVATION_CREATED`: Creación de derivación
- `DERIVATION_SENT`: Envío de derivación
- `DERIVATION_ACKNOWLEDGED`: Acuse de recepción
- `DERIVATION_VIEWED`: Acceso de lectura

#### Contrarreferencia
- `COUNTERREFERENCE_CREATED`: Creación de contrarreferencia
- `COUNTERREFERENCE_RECEIVED`: Recepción de contrarreferencia
- `COUNTERREFERENCE_VIEWED`: Acceso de lectura

#### Plan de Protección
- `PROTECTION_PLAN_CREATED`: Creación del plan
- `PROTECTION_PLAN_UPDATED`: Actualización
- `PROTECTION_PLAN_MEASURE_COMPLETED`: Medida completada
- `PROTECTION_PLAN_MEASURE_OVERDUE`: Medida vencida (alerta)

#### Evidencia
- `EVIDENCE_UPLOADED`: Subida de evidencia
- `EVIDENCE_VIEWED`: Acceso a evidencia (auditoría estricta)
- `EVIDENCE_DELETED`: Eliminación (solo con permisos especiales)

#### Acta
- `ACTA_CREATED`: Creación de acta
- `ACTA_SIGNED`: Firma de acta
- `ACTA_VIEWED`: Acceso de lectura

#### CAP
- `CAP_COMMISSION_CREATED`: Comisión creada
- `CAP_ACTIVITY_CREATED`: Actividad creada
- `CAP_ACTIVITY_COMPLETED`: Actividad completada
- `CAP_EVALUATED`: Evaluación realizada

#### Usuario
- `USER_CREATED`: Usuario creado
- `USER_UPDATED`: Usuario actualizado
- `USER_DELETED`: Usuario eliminado (con datos guardados)
- `USER_ROLE_CHANGED`: Cambio de rol
- `USER_PASSWORD_CHANGED`: Cambio de contraseña

#### Material de Biblioteca
- `MATERIAL_CREATED`: Material creado
- `MATERIAL_UPDATED`: Material actualizado
- `MATERIAL_DELETED`: Material eliminado
- `MATERIAL_VIEWED`: Visualización (métrica)
- `MATERIAL_DOWNLOADED`: Descarga (métrica)
- `MATERIAL_COURSE_COMPLETED`: Curso completado (métrica)

### Registro de Gestión de Casos (Punto 4 del requerimiento)

**Problema**: Las personas responsables pueden cambiar durante el proceso.

**Solución**: Registro histórico de responsables por etapa.

#### Modelo de Historial de Gestión

Cada caso mantiene un historial de responsables por etapa:

```
Caso → HistorialResponsable[]
  - etapa: "Registro inicial" | "Valoración" | "Derivación" | "Seguimiento" | ...
  - responsableId: ID del usuario
  - responsableNombre: Nombre (snapshot)
  - fechaInicio: Fecha de asignación
  - fechaFin: Fecha de cambio (null si actual)
  - eventosAsociados: IDs de eventos realizados por este responsable
```

**Implementación**:
- Cada vez que un usuario realiza una acción importante en un caso, se registra como responsable de esa etapa
- Si cambia el responsable, se cierra el registro anterior y se crea uno nuevo
- Todos los eventos están vinculados al responsable activo en ese momento

**Visualización**:
- Línea de tiempo del caso muestra quién fue responsable en cada etapa
- Reportes incluyen responsables históricos

---

## Eliminación de Casos (Requerimiento Especial)

### Reglas de Eliminación

1. **Solo SUPER_ADMIN puede eliminar casos**
2. **Eliminación no es borrado físico**: 
   - El caso se marca como `deleted = true`
   - Todos los datos se mantienen en base de datos
   - Se crea registro de auditoría completo con:
     - Usuario que eliminó
     - Fecha y hora
     - Motivo de eliminación (obligatorio)
     - Snapshot completo del caso antes de eliminar

3. **Acceso post-eliminación**:
   - Solo SUPER_ADMIN puede ver casos eliminados
   - En reportes normales, los casos eliminados NO aparecen
   - Reportes de auditoría SÍ incluyen casos eliminados

### Evento de Eliminación

```
EVENT_CASE_DELETED:
  - caseId
  - deletedBy (SUPER_ADMIN id)
  - deletedAt
  - reason (obligatorio)
  - snapshot (JSON completo del caso antes de eliminar)
  - relatedEntities (derivaciones, contrarreferencias, evidencias, etc.)
```

---

## Tipos de Violencia Actualizados

Según requerimiento, se añaden:

1. **Física** (existente)
2. **Psicológica** (existente)
3. **Sexual** (existente)
4. **Digital/Ciberacoso** (existente)
5. **Trata de Personas** (NUEVO)
6. **Drogas** (NUEVO - ya manejado como submódulo, ahora también como tipo)

---

## Resumen de Flujos por Rol

### DOCENTE
**Puede**:
- Crear registros iniciales de casos (limitado)
- Ver casos de su U.E. (lectura limitada)
- Ver material de capacitación
- Ver sus propias métricas de capacitación

**No puede**:
- Derivar casos
- Cerrar casos
- Gestionar planes de protección
- Eliminar casos

### DIRECCION
**Puede**:
- Gestionar casos completos de su U.E.
- Derivar y denunciar
- Crear planes de protección
- Gestionar CAP
- Cerrar casos
- Ver reportería de su U.E.

**No puede**:
- Ver casos de otras U.E.
- Eliminar casos
- Gestionar usuarios (excepto en algunos casos DDE puede asignar)

### COMISION_CAP_*
**Puede**:
- Trabajar en su módulo CAP específico
- Ver material de capacitación
- Ver cronograma CAP

**No puede**:
- Ver casos completos (solo anonimizados para contexto)
- Derivar casos
- Gestionar casos

### DDE / DDE_DISTRITO
**Puede**:
- Ver casos consolidados de su ámbito
- Recibir contrarreferencias
- Ver analítica calibrēda
- Gestionar estructura orgánica (según permisos)
- Crear usuarios de su ámbito (DDE)
- Aprobar cierres de casos
- Escalar alertas

**No puede**:
- Crear casos directamente
- Eliminar casos

### DNA / SLIM
**Puede**:
- Recibir derivaciones (filtrado automático)
- Crear contrarreferencias
- Ver casos derivados a ellos

**No puede**:
- Ver casos no derivados a ellos
- Crear casos

### SALUD
**Puede**:
- Recibir derivaciones clínicas
- Crear contrarreferencias clínicas
- Ver información clínica de casos derivados
- Indicar medidas de protección relacionadas con salud

**No puede**:
- Ver información no clínica (restricción de datos sensibles)
- Crear casos

### MP
**Puede**:
- Recibir denuncias
- Crear contrarreferencias judiciales
- Ver casos denunciados

**No puede**:
- Ver casos no denunciados

### ADMIN
**Puede**:
- Gestionar catálogos
- Gestionar estructura orgánica
- Crear usuarios (hasta ADMIN)
- Configurar alertas y plantillas
- Ver toda la información
- Ver auditoría (limitada)

**No puede**:
- Eliminar casos
- Crear SUPER_ADMIN

### SUPER_ADMIN
**Puede**:
- **TODO** (acceso completo)
- Eliminar casos (con registro de auditoría)
- Crear cualquier rol
- Ver auditoría completa
- Configurar integraciones

---

## Flujo de Derivación Automática por Edad (Requerimiento)

**Regla**: Casos de violencia sexual se derivan automáticamente según edad:
- **< 18 años**: Derivación automática a DNA
- **≥ 18 años**: Derivación automática a SLIM
- **Además**: Siempre se deriva a MP si hay indicios de delito

**Implementación**:
1. DIRECCION registra caso de violencia sexual
2. Sistema detecta tipo "Violencia Sexual"
3. Sistema obtiene edad del afectado
4. Sistema crea derivaciones automáticas:
   - A DNA (si edad < 18)
   - A SLIM (si edad ≥ 18)
   - A MP (si hay indicios de delito - campo booleano)
5. Sistema notifica a DIRECCION de las derivaciones automáticas
6. DIRECCION puede revisar y confirmar antes del envío (opcional, según configuración)

**Estado**: Pendiente de confirmación con DDE/CEMSE

---

## Matriz de Permisos Resumida (Tabla General)

| Módulo | DOCENTE | DIRECCION | COMISION_CAP | DDE | DNA/SLIM | SALUD | MP | ADMIN | SUPER_ADMIN |
|--------|---------|-----------|--------------|-----|----------|-------|-----|-------|-------------|
| **Casos** |
| Crear | ✅ Limitado | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver (su ámbito) | ✅ Limitado | ✅ Completo | ❌ | ✅ Consolidado | ✅ Solo derivados | ✅ Solo derivados | ✅ Solo denunciados | ✅ Todo | ✅ Todo |
| Editar | ✅ Solo inicial | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Eliminar | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ Con auditoría |
| Derivar | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cerrar | ❌ | ✅ | ❌ | ✅ Aprobar | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Derivaciones** |
| Crear | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Recibir | ❌ | ✅ | ✅ (DNA/SLIM) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contrarreferencias | ❌ | ✅ Recibir | ✅ Crear | ✅ Recibir | ✅ Crear | ✅ Crear | ✅ Crear | ✅ | ✅ |
| **CAP** |
| Gestionar | ❌ | ✅ | ⚠️ Por tipo | ✅ Ver | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Analítica** |
| Dashboard | ❌ | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| Reportes | ❌ | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Biblioteca** |
| Ver | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subir | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Métricas | ✅ Propio | ✅ U.E. | ❌ | ✅ Consolidado | ❌ | ❌ | ❌ | ✅ Todo | ✅ Todo |
| **Administración** |
| Usuarios | ❌ | ❌ | ❌ | ⚠️ Su distrito | ❌ | ❌ | ❌ | ✅ (hasta ADMIN) | ✅ Todo |
| Catálogos | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Integraciones | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Auditoría** |
| Ver eventos | ❌ | ✅ Casos propios | ❌ | ✅ Su ámbito | ❌ | ❌ | ❌ | ✅ Limitado | ✅ Completo |

---

**Fin del Documento**


# HISTORIAS DE USUARIO - SISTEMA SIRPO
## Sistema de Registro de Postulantes - DEVIDA

---

## MÓDULO 1: AUTENTICACIÓN Y ACCESO

### HU-001: Registro de Usuario
**Como** postulante nuevo  
**Quiero** poder registrarme en el sistema SIRPO  
**Para** acceder a las convocatorias laborales de DEVIDA

**Criterios de Aceptación:**
- El formulario solicita: Tipo de Documento, Número de Documento, Apellido Paterno, Apellido Materno, Nombres, Correo Electrónico, Contraseña, Confirmar Contraseña
- El sistema valida que el número de documento no esté registrado previamente
- El sistema valida que el correo electrónico no esté registrado previamente
- El sistema valida que las contraseñas coincidan
- El sistema valida el formato del correo electrónico
- Al registrarse exitosamente, el usuario es redirigido al panel principal
- Se muestra un mensaje de confirmación de registro exitoso

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-002: Inicio de Sesión
**Como** postulante registrado  
**Quiero** iniciar sesión en el sistema  
**Para** acceder a mi perfil y gestionar mis postulaciones

**Criterios de Aceptación:**
- El formulario solicita: Número de Documento y Contraseña
- El sistema valida las credenciales ingresadas
- Si las credenciales son incorrectas, se muestra un mensaje de error
- Si las credenciales son correctas, el usuario accede al panel principal
- El sistema mantiene la sesión del usuario hasta que cierre sesión
- Se muestra el logo de DEVIDA y el nombre del sistema

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-003: Recuperación de Contraseña
**Como** postulante que olvidó su contraseña  
**Quiero** poder recuperarla  
**Para** volver a acceder al sistema

**Criterios de Aceptación:**
- El formulario solicita: Tipo de Documento, Número de Documento y Correo Electrónico
- El sistema valida que los datos coincidan con un usuario registrado
- El sistema envía instrucciones de recuperación al correo registrado
- Se muestra un mensaje confirmando el envío de instrucciones
- Existe un enlace para volver al inicio de sesión

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-004: Cerrar Sesión
**Como** usuario autenticado  
**Quiero** cerrar sesión de forma segura  
**Para** proteger mi información personal

**Criterios de Aceptación:**
- Existe un botón "Cerrar Sesión" visible en el sidebar
- Al hacer clic, el sistema cierra la sesión del usuario
- El usuario es redirigido a la pantalla de inicio de sesión
- Se limpian los datos de sesión del navegador

**Prioridad:** Alta  
**Estimación:** 1 punto

---

## MÓDULO 2: NAVEGACIÓN Y ESTRUCTURA

### HU-005: Navegación por Sidebar
**Como** usuario autenticado  
**Quiero** navegar entre las diferentes secciones del sistema mediante un menú lateral  
**Para** acceder rápidamente a las funcionalidades disponibles

**Criterios de Aceptación:**
- El sidebar muestra las opciones: Convocatorias Vigentes, Registro de Hoja de Vida, Mis Postulaciones
- Cada opción tiene un icono representativo
- La opción activa se resalta visualmente
- El sidebar es responsive en dispositivos móviles
- Se puede colapsar/expandir el sidebar
- Muestra el logo de DEVIDA en la parte superior
- Incluye opción de "Cerrar Sesión"

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-006: Colapsar/Expandir Sidebar
**Como** usuario autenticado  
**Quiero** poder colapsar o expandir el menú lateral  
**Para** tener más espacio de visualización del contenido principal

**Criterios de Aceptación:**
- Existe un botón para colapsar/expandir el sidebar
- Al colapsar, solo se muestran los iconos de las opciones
- Al expandir, se muestran los iconos y textos de las opciones
- El contenido principal se ajusta al ancho disponible
- La animación de transición es suave
- El estado del sidebar se mantiene al navegar entre secciones

**Prioridad:** Baja  
**Estimación:** 2 puntos

---

## MÓDULO 3: CONVOCATORIAS VIGENTES

### HU-007: Visualizar Lista de Convocatorias
**Como** postulante  
**Quiero** ver todas las convocatorias disponibles  
**Para** conocer las oportunidades laborales en DEVIDA

**Criterios de Aceptación:**
- Se muestra una tabla con todas las convocatorias
- Cada convocatoria muestra: Nombre, Oficina Zonal, Oficina de Coordinación, Perfil, Fecha Inicio, Fecha Fin, Días Restantes, Estado
- Los estados se visualizan con badges de colores: Abierta (verde), Cerrada (gris), Próxima (amarillo)
- Los días restantes se muestran con códigos de color según urgencia: Rojo (≤3 días), Naranja (≤7 días), Verde (>7 días)
- Se muestra el total de convocatorias encontradas
- La tabla es responsive

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-008: Filtrar Convocatorias
**Como** postulante  
**Quiero** filtrar las convocatorias según mis criterios  
**Para** encontrar las oportunidades que mejor se ajusten a mi perfil

**Criterios de Aceptación:**
- Existe un card de filtros con las opciones: Oficina Zonal, Oficina de Coordinación, Perfil, Estado, Búsqueda por palabra clave
- Los filtros se pueden combinar entre sí
- El botón "Buscar" aplica los filtros seleccionados
- El botón "Limpiar Filtros" restaura todos los filtros a su estado inicial
- Los resultados se actualizan inmediatamente después de aplicar filtros
- Se muestra el número de convocatorias encontradas

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-009: Buscar Convocatorias por Palabra Clave
**Como** postulante  
**Quiero** buscar convocatorias ingresando palabras clave  
**Para** encontrar rápidamente convocatorias específicas

**Criterios de Aceptación:**
- Existe un campo de búsqueda en el card de filtros
- La búsqueda se realiza en los campos: Nombre, Oficina Zonal, Oficina de Coordinación, Perfil
- La búsqueda no distingue entre mayúsculas y minúsculas
- Los resultados se filtran en tiempo real
- Se puede combinar con otros filtros

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-010: Ver Bases de Convocatoria
**Como** postulante  
**Quiero** descargar o visualizar las bases de cada convocatoria  
**Para** conocer los requisitos y condiciones detalladas

**Criterios de Aceptación:**
- Cada convocatoria tiene un botón con icono de descarga
- Al hacer clic, se abre el PDF de las bases en una nueva pestaña
- El botón muestra un tooltip explicativo al pasar el mouse
- El documento se descarga correctamente

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-011: Postular a Convocatoria con Hoja de Vida Completa
**Como** postulante con hoja de vida completa  
**Quiero** postular a una convocatoria abierta  
**Para** participar en el proceso de selección

**Criterios de Aceptación:**
- Solo las convocatorias con estado "Abierta" tienen el botón "Postular" habilitado
- Al hacer clic en "Postular", se muestra un modal de confirmación
- El modal muestra la información de la convocatoria
- El modal pregunta si desea continuar
- Al confirmar, se muestra la interfaz de postulación con la información de la convocatoria y vista previa de la hoja de vida
- El usuario puede revisar la información antes de enviar

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-012: Intentar Postular con Hoja de Vida Incompleta
**Como** postulante con hoja de vida incompleta  
**Quiero** recibir una alerta al intentar postular  
**Para** conocer qué información me falta completar

**Criterios de Aceptación:**
- Al hacer clic en "Postular" sin tener la hoja de vida completa, se muestra un modal de advertencia
- El modal muestra el título "Hoja de Vida Incompleta"
- El modal lista las secciones requeridas: Datos Personales, Formación Académica, Experiencia Profesional, Declaraciones Juradas
- Se muestra un botón "Ir a Registro de Hoja de Vida" que redirige a la pestaña de Datos Personales
- Se muestra un botón "Cancelar" para cerrar el modal
- El mensaje es claro sobre la acción requerida

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-013: Ver Estado de Convocatorias Cerradas
**Como** postulante  
**Quiero** ver las convocatorias cerradas  
**Para** conocer las oportunidades que ya no están disponibles

**Criterios de Aceptación:**
- Las convocatorias cerradas se muestran en la tabla con badge gris "Cerrada"
- El botón "Postular" está deshabilitado
- Al pasar el mouse sobre el botón deshabilitado, muestra tooltip "Esta convocatoria ha finalizado"
- Los días restantes muestran badge "Finalizada"

**Prioridad:** Baja  
**Estimación:** 2 puntos

---

### HU-014: Ver Estado de Convocatorias Próximas
**Como** postulante  
**Quiero** ver las convocatorias próximas  
**Para** conocer las oportunidades que pronto estarán disponibles

**Criterios de Aceptación:**
- Las convocatorias próximas se muestran con badge amarillo "Próxima"
- El botón "Postular" está deshabilitado
- Al pasar el mouse sobre el botón deshabilitado, muestra tooltip "Esta convocatoria aún no está abierta"
- Los días restantes muestran badge "Por iniciar"

**Prioridad:** Baja  
**Estimación:** 2 puntos

---

## MÓDULO 4: REGISTRO DE HOJA DE VIDA

### HU-015: Navegación por Pestañas de Hoja de Vida
**Como** postulante  
**Quiero** navegar entre las diferentes secciones de mi hoja de vida mediante pestañas  
**Para** organizar y completar mi información de forma estructurada

**Criterios de Aceptación:**
- Se muestran 5 pestañas: Datos Personales, Formación, Experiencia, Declaraciones Juradas, Vista Previa
- La pestaña activa se resalta visualmente
- Se puede navegar entre pestañas haciendo clic en ellas
- Existen botones "Anterior" y "Continuar" para navegar secuencialmente
- El botón "Anterior" no se muestra en la primera pestaña
- El botón "Continuar" cambia en la última pestaña

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-016: Registrar Datos Personales
**Como** postulante  
**Quiero** registrar mis datos personales  
**Para** completar mi perfil en el sistema

**Criterios de Aceptación:**
- El formulario incluye secciones: Datos de Identidad, Datos de Nacimiento, Datos de Contacto, Información Bancaria, Información Complementaria, Datos de Ubicación
- **Datos de Identidad:** Tipo de Documento, Número de Documento, Apellido Paterno, Apellido Materno, Nombres, Sexo, Estado Civil
- **Datos de Nacimiento:** Fecha de Nacimiento, Nacionalidad
- **Datos de Contacto:** Teléfono Fijo, Teléfono Celular, Correo Electrónico
- **Información Bancaria:** CCI del Banco de la Nación, Comprobante de Cuenta (archivo PDF)
- **Información Complementaria:** Licenciado de FF.AA., Seguro Actual, Tipo de Seguro, Persona con Discapacidad, Tipo de Discapacidad, Tiene SCTR
- **Datos de Ubicación:** Dirección, Referencia, Departamento, Provincia, Distrito
- Los campos obligatorios están marcados con asterisco (*)
- El sistema valida el formato de los datos ingresados
- Se puede guardar el formulario como borrador
- Existe un botón "Guardar Cambios" que persiste la información

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-017: Cargar Comprobante de Cuenta Bancaria
**Como** postulante  
**Quiero** cargar mi comprobante de cuenta del Banco de la Nación  
**Para** validar mi información bancaria

**Criterios de Aceptación:**
- Existe un campo de carga de archivos para el comprobante
- Solo se aceptan archivos PDF
- El tamaño máximo del archivo es de 2MB
- Se muestra una vista previa del archivo cargado
- Se puede reemplazar el archivo cargado
- Se valida el formato del archivo antes de subirlo

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-018: Registrar Formación Académica
**Como** postulante  
**Quiero** registrar mi formación académica  
**Para** mostrar mis estudios completados

**Criterios de Aceptación:**
- Se muestra una tabla con la formación académica registrada
- Existe un botón "Agregar Formación" que abre un formulario modal
- El formulario incluye: Nivel de Estudio, Carrera, Tipo de Institución, Tipo de Entidad, Institución, RUC, Departamento, Provincia, Distrito, Fecha de Obtención, Documento de Evidencia
- Se pueden registrar múltiples estudios
- Cada registro muestra: Nivel de Estudio, Carrera, Institución, Fecha
- Existen botones "Editar" y "Eliminar" para cada registro
- Los registros se muestran ordenados por fecha descendente

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-019: Editar Formación Académica
**Como** postulante  
**Quiero** editar un registro de formación académica  
**Para** corregir o actualizar la información

**Criterios de Aceptación:**
- Al hacer clic en "Editar", se abre el formulario modal con los datos del registro
- Los campos se pre-llenan con la información existente
- Se pueden modificar todos los campos
- Al guardar, se actualizan los datos en la tabla
- Se muestra un mensaje de confirmación

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-020: Eliminar Formación Académica
**Como** postulante  
**Quiero** eliminar un registro de formación académica  
**Para** remover información incorrecta o no relevante

**Criterios de Aceptación:**
- Al hacer clic en "Eliminar", se muestra un mensaje de confirmación
- El mensaje pregunta si está seguro de eliminar el registro
- Al confirmar, el registro se elimina de la tabla
- Se muestra un mensaje de éxito
- Al cancelar, no se realiza ninguna acción

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-021: Registrar Cursos y Capacitaciones
**Como** postulante  
**Quiero** registrar mis cursos y capacitaciones  
**Para** mostrar mi formación complementaria

**Criterios de Aceptación:**
- Se muestra una tabla con los cursos registrados
- Existe un botón "Agregar Curso" que abre un formulario modal
- El formulario incluye: Tipo de Estudio, Descripción del Curso, Tipo de Institución, Institución, RUC, Departamento, Provincia, Distrito, Fecha de Inicio, Fecha de Fin, Horas Lectivas, Documento de Evidencia
- Se pueden registrar múltiples cursos
- Cada registro muestra: Tipo de Estudio, Descripción, Institución, Fecha Inicio, Fecha Fin, Horas
- Existen botones "Editar" y "Eliminar" para cada registro

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-022: Editar Cursos y Capacitaciones
**Como** postulante  
**Quiero** editar un registro de curso  
**Para** corregir o actualizar la información

**Criterios de Aceptación:**
- Al hacer clic en "Editar", se abre el formulario modal con los datos del registro
- Los campos se pre-llenan con la información existente
- Se pueden modificar todos los campos
- Al guardar, se actualizan los datos en la tabla
- Se muestra un mensaje de confirmación

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-023: Eliminar Cursos y Capacitaciones
**Como** postulante  
**Quiero** eliminar un registro de curso  
**Para** remover información incorrecta o no relevante

**Criterios de Aceptación:**
- Al hacer clic en "Eliminar", se muestra un mensaje de confirmación
- El mensaje pregunta si está seguro de eliminar el registro
- Al confirmar, el registro se elimina de la tabla
- Se muestra un mensaje de éxito
- Al cancelar, no se realiza ninguna acción

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-024: Registrar Experiencia Profesional
**Como** postulante  
**Quiero** registrar mi experiencia profesional  
**Para** mostrar mi trayectoria laboral

**Criterios de Aceptación:**
- Se muestra una tabla con la experiencia registrada
- Existe un botón "Agregar Experiencia" que abre un formulario modal
- El formulario incluye: Tipo de Experiencia, Tipo de Entidad, Nombre de Entidad, Departamento, Provincia, Distrito, Área, Cargo, Funciones Principales, Motivo de Cese, Fecha de Inicio, Fecha de Fin, Certificado de Trabajo
- Se pueden registrar múltiples experiencias
- Cada registro muestra: Cargo, Entidad, Área, Fecha Inicio, Fecha Fin
- Existen botones "Editar" y "Eliminar" para cada registro

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-025: Editar Experiencia Profesional
**Como** postulante  
**Quiero** editar un registro de experiencia  
**Para** corregir o actualizar la información

**Criterios de Aceptación:**
- Al hacer clic en "Editar", se abre el formulario modal con los datos del registro
- Los campos se pre-llenan con la información existente
- Se pueden modificar todos los campos
- Al guardar, se actualizan los datos en la tabla
- Se muestra un mensaje de confirmación

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-026: Eliminar Experiencia Profesional
**Como** postulante  
**Quiero** eliminar un registro de experiencia  
**Para** remover información incorrecta o no relevante

**Criterios de Aceptación:**
- Al hacer clic en "Eliminar", se muestra un mensaje de confirmación
- El mensaje pregunta si está seguro de eliminar el registro
- Al confirmar, el registro se elimina de la tabla
- Se muestra un mensaje de éxito
- Al cancelar, no se realiza ninguna acción

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-027: Cargar Certificado de Trabajo
**Como** postulante  
**Quiero** cargar el certificado de trabajo de cada experiencia  
**Para** validar mi experiencia profesional

**Criterios de Aceptación:**
- Existe un campo de carga de archivos en el formulario de experiencia
- Solo se aceptan archivos PDF
- El tamaño máximo del archivo es de 2MB
- Se muestra una vista previa del archivo cargado
- Se puede reemplazar el archivo cargado
- Se valida el formato del archivo antes de subirlo

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-028: Registrar Declaraciones Juradas
**Como** postulante  
**Quiero** registrar mis declaraciones juradas  
**Para** cumplir con los requisitos legales del proceso de postulación

**Criterios de Aceptación:**
- Se muestra una lista de declaraciones juradas predefinidas
- Cada declaración incluye: Nombre, Descripción, Campo de carga de archivo
- Solo se aceptan archivos PDF
- Se pueden cargar múltiples declaraciones
- Se muestra el estado de cada declaración (Pendiente/Cargada)
- Existen botones para ver y eliminar declaraciones cargadas

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-029: Cargar Archivo de Declaración Jurada
**Como** postulante  
**Quiero** cargar el archivo PDF de cada declaración jurada  
**Para** adjuntar la documentación requerida

**Criterios de Aceptación:**
- Existe un campo de carga para cada declaración
- Solo se aceptan archivos PDF firmados
- El tamaño máximo del archivo es de 2MB
- Se muestra el nombre del archivo cargado
- Se puede reemplazar el archivo
- Se valida el formato antes de cargar

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-030: Ver Vista Previa de Hoja de Vida
**Como** postulante  
**Quiero** ver una vista previa consolidada de mi hoja de vida  
**Para** verificar que toda mi información esté completa y correcta antes de postular

**Criterios de Aceptación:**
- Se muestra un resumen completo de toda la información registrada
- Incluye secciones: Datos Personales, Formación Académica, Cursos y Capacitaciones, Experiencia Profesional, Declaraciones Juradas
- Los datos se muestran en formato de lectura, no editable
- Se muestra un mensaje si falta información en alguna sección
- Existe un botón "Ir a Convocatorias Vigentes" para proceder a postular
- El diseño es limpio y profesional, similar a un CV impreso

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-031: Navegar desde Vista Previa a Convocatorias
**Como** postulante que completó su hoja de vida  
**Quiero** ir directamente a la sección de convocatorias desde la vista previa  
**Para** iniciar el proceso de postulación

**Criterios de Aceptación:**
- En la pestaña "Vista Previa" existe un botón "Ir a Convocatorias Vigentes"
- Al hacer clic, el usuario es redirigido a la sección de Convocatorias Vigentes
- Se mantiene la información de la hoja de vida guardada
- La navegación es instantánea

**Prioridad:** Media  
**Estimación:** 1 punto

---

## MÓDULO 5: PROCESO DE POSTULACIÓN

### HU-032: Ver Interfaz de Postulación
**Como** postulante que confirmó postular a una convocatoria  
**Quiero** ver una interfaz de postulación con la información de la convocatoria y mi hoja de vida  
**Para** revisar toda la información antes de enviar mi postulación

**Criterios de Aceptación:**
- Se muestra el header "Postular a Convocatoria"
- Se muestra un card con la información completa de la convocatoria seleccionada
- El card incluye: Nombre, Oficina Zonal, Oficina de Coordinación, Perfil, Fechas
- Se muestra la vista previa de la hoja de vida sin el header
- No se incluye el botón "Descargar PDF" en la vista previa
- Existe un botón "Volver" para cancelar y regresar a convocatorias
- Existe un botón "Ir a Convocatorias Vigentes" para enviar la postulación

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-033: Revisar Información de Convocatoria en Postulación
**Como** postulante en proceso de postulación  
**Quiero** revisar la información detallada de la convocatoria  
**Para** confirmar que estoy postulando a la convocatoria correcta

**Criterios de Aceptación:**
- El card de convocatoria muestra: Nombre, Perfil, Oficina Zonal, Oficina de Coordinación, Fecha Inicio, Fecha Fin
- La información se presenta de forma clara y organizada
- El diseño utiliza los colores institucionales de DEVIDA
- Se muestra con iconos representativos para cada campo

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-034: Revisar Hoja de Vida en Postulación
**Como** postulante en proceso de postulación  
**Quiero** revisar mi hoja de vida que será enviada  
**Para** asegurarme de que la información esté completa y correcta

**Criterios de Aceptación:**
- Se muestra la sección "Información de tu Hoja de Vida"
- Se incluyen todas las secciones: Datos Personales, Formación Académica, Cursos, Experiencia Profesional, Declaraciones Juradas
- La información se muestra en formato de solo lectura
- El diseño es claro y profesional
- No se incluye el botón "Descargar PDF"

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-035: Cancelar Postulación en Proceso
**Como** postulante en proceso de postulación  
**Quiero** cancelar y volver a la lista de convocatorias  
**Para** revisar otras opciones antes de postular

**Criterios de Aceptación:**
- Existe un botón "Volver" visible en la interfaz
- Al hacer clic, se muestra un mensaje de confirmación
- El mensaje pregunta si está seguro de cancelar
- Al confirmar, el usuario regresa a la sección "Convocatorias Vigentes"
- No se guarda ninguna postulación
- Al cancelar el mensaje, permanece en la interfaz de postulación

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-036: Enviar Postulación
**Como** postulante que revisó toda la información  
**Quiero** enviar mi postulación a la convocatoria  
**Para** participar en el proceso de selección

**Criterios de Aceptación:**
- Existe un botón "Ir a Convocatorias Vigentes" al final de la interfaz
- Al hacer clic, se registra la postulación en el sistema
- Se asigna un número de postulación único
- Se guarda la fecha y hora de postulación
- El estado inicial es "En Revisión"
- Se muestra un mensaje de confirmación de postulación exitosa
- El usuario es redirigido a la sección "Convocatorias Vigentes"
- Se envía un correo de confirmación al postulante

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

## MÓDULO 6: MIS POSTULACIONES

### HU-037: Ver Estadísticas de Postulaciones
**Como** postulante  
**Quiero** ver estadísticas resumidas de mis postulaciones  
**Para** conocer el estado general de mis aplicaciones

**Criterios de Aceptación:**
- Se muestran 4 cards con estadísticas: Total, En Revisión, Preseleccionado, No Seleccionado
- Cada card muestra un número y una etiqueta descriptiva
- Cada card tiene un icono representativo y color según el tipo
- Los números se actualizan automáticamente según las postulaciones del usuario
- El diseño es limpio y profesional

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-038: Ver Historial de Postulaciones
**Como** postulante  
**Quiero** ver el historial completo de mis postulaciones  
**Para** hacer seguimiento de mis aplicaciones

**Criterios de Aceptación:**
- Se muestra una tabla con todas las postulaciones realizadas
- Cada postulación incluye: Convocatoria, Oficina Zonal, Perfil, Fecha de Postulación, Estado, Acciones
- Los estados se muestran con badges de colores: En Revisión (amarillo), Preseleccionado (azul), Finalista (verde), No Seleccionado (gris)
- Las postulaciones se ordenan por fecha descendente (más recientes primero)
- Se muestra el número total de postulaciones
- Existe un botón "Ver Detalles" para cada postulación

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-039: Ver Detalle de Postulación
**Como** postulante  
**Quiero** ver el detalle completo de una postulación específica  
**Para** revisar la información que fue enviada y el estado actual

**Criterios de Aceptación:**
- Al hacer clic en "Ver Detalles", se abre una nueva vista con el detalle completo
- Se muestra la información de la convocatoria: Nombre, Perfil, Oficina Zonal, Oficina de Coordinación, Fecha de Postulación, Fechas de la Convocatoria, Estado
- Se muestra la sección "Hoja de Vida Enviada" con toda la información que fue enviada en ese momento
- Incluye: Formación Académica, Cursos y Capacitaciones, Experiencia Profesional
- El card de convocatoria tiene un diseño destacado con gradiente verde
- Existe un botón "Volver" para regresar al historial
- El estado de la postulación se muestra con badge de color

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-040: Volver al Historial desde Detalle
**Como** postulante viendo el detalle de una postulación  
**Quiero** volver al historial de postulaciones  
**Para** ver mis otras postulaciones

**Criterios de Aceptación:**
- Existe un botón "Volver" en la parte superior
- Existe un botón "Volver al historial" en la parte inferior
- Al hacer clic en cualquiera, el usuario regresa a la vista del historial
- Se mantiene el estado de la tabla (scroll, filtros si los hubiera)
- La navegación es instantánea

**Prioridad:** Baja  
**Estimación:** 1 punto

---

### HU-041: Ver Estado "En Revisión"
**Como** postulante  
**Quiero** ver que mi postulación está en revisión  
**Para** saber que está siendo evaluada por el comité de selección

**Criterios de Aceptación:**
- El estado se muestra con badge amarillo con icono de reloj
- El texto es "En Revisión"
- Se mantiene visible en el historial y en el detalle de postulación

**Prioridad:** Media  
**Estimación:** 1 punto

---

### HU-042: Ver Estado "Preseleccionado"
**Como** postulante  
**Quiero** ver que he sido preseleccionado  
**Para** saber que pasé a la siguiente etapa del proceso

**Criterios de Aceptación:**
- El estado se muestra con badge azul con icono de check
- El texto es "Preseleccionado"
- Se mantiene visible en el historial y en el detalle de postulación

**Prioridad:** Media  
**Estimación:** 1 punto

---

### HU-043: Ver Estado "Finalista"
**Como** postulante  
**Quiero** ver que he sido seleccionado como finalista  
**Para** saber que estoy en la etapa final del proceso

**Criterios de Aceptación:**
- El estado se muestra con badge verde con icono de check
- El texto es "Finalista"
- Se mantiene visible en el historial y en el detalle de postulación

**Prioridad:** Media  
**Estimación:** 1 punto

---

### HU-044: Ver Estado "No Seleccionado"
**Como** postulante  
**Quiero** ver que no he sido seleccionado  
**Para** conocer el resultado de mi postulación

**Criterios de Aceptación:**
- El estado se muestra con badge gris con icono de X
- El texto es "No Seleccionado"
- Se mantiene visible en el historial y en el detalle de postulación

**Prioridad:** Media  
**Estimación:** 1 punto

---

## MÓDULO 7: VALIDACIONES Y REGLAS DE NEGOCIO

### HU-045: Validar Información Obligatoria
**Como** sistema  
**Quiero** validar que todos los campos obligatorios estén completos  
**Para** asegurar la integridad de los datos

**Criterios de Aceptación:**
- Los campos obligatorios están marcados con asterisco (*)
- No se puede guardar un formulario con campos obligatorios vacíos
- Se muestran mensajes de error específicos para cada campo
- Los mensajes se muestran en tiempo real al perder el foco del campo
- El botón de guardar se deshabilita si hay errores de validación

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-046: Validar Formato de Correo Electrónico
**Como** sistema  
**Quiero** validar que el correo electrónico tenga un formato válido  
**Para** asegurar que se puedan enviar notificaciones correctamente

**Criterios de Aceptación:**
- El campo de correo valida el formato estándar (usuario@dominio.com)
- Se muestra un mensaje de error si el formato es inválido
- No se puede guardar con un correo en formato incorrecto
- La validación se ejecuta al perder el foco del campo

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-047: Validar Formato de Número de Documento
**Como** sistema  
**Quiero** validar que el número de documento tenga el formato correcto según el tipo  
**Para** asegurar la validez de la identificación

**Criterios de Aceptación:**
- DNI: debe tener 8 dígitos numéricos
- Carnet de Extranjería: debe tener 12 caracteres alfanuméricos
- Pasaporte: debe tener entre 8 y 12 caracteres alfanuméricos
- Se muestra un mensaje de error si el formato es inválido
- La validación se ejecuta al perder el foco del campo

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-048: Validar Tamaño de Archivos
**Como** sistema  
**Quiero** validar que los archivos cargados no excedan el tamaño máximo permitido  
**Para** optimizar el almacenamiento y rendimiento del sistema

**Criterios de Aceptación:**
- El tamaño máximo permitido es de 2MB por archivo
- Se muestra un mensaje de error si el archivo excede el tamaño
- No se permite cargar archivos que excedan el límite
- El mensaje indica claramente el tamaño máximo permitido

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-049: Validar Formato de Archivos
**Como** sistema  
**Quiero** validar que los archivos cargados sean del tipo permitido  
**Para** asegurar la compatibilidad y seguridad del sistema

**Criterios de Aceptación:**
- Solo se permiten archivos PDF para documentos de evidencia
- Se valida la extensión del archivo antes de cargar
- Se muestra un mensaje de error si el formato no es válido
- El campo de carga solo muestra archivos PDF en el selector

**Prioridad:** Alta  
**Estimación:** 2 puntos

---

### HU-050: Prevenir Postulación Duplicada
**Como** sistema  
**Quiero** prevenir que un usuario postule dos veces a la misma convocatoria  
**Para** evitar duplicación de registros

**Criterios de Aceptación:**
- El sistema verifica si el usuario ya postuló a la convocatoria
- Si ya postuló, se muestra un mensaje informativo
- El botón "Postular" se deshabilita para convocatorias ya postuladas
- Se muestra un tooltip explicativo sobre el botón deshabilitado

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-051: Validar Fechas de Formación Académica
**Como** sistema  
**Quiero** validar que las fechas de formación académica sean coherentes  
**Para** asegurar la validez de la información

**Criterios de Aceptación:**
- La fecha de obtención no puede ser futura
- La fecha debe tener formato válido (DD/MM/AAAA)
- Se muestra un mensaje de error si la fecha es inválida
- La validación se ejecuta al perder el foco del campo

**Prioridad:** Media  
**Estimación:** 2 puntos

---

### HU-052: Validar Fechas de Experiencia Profesional
**Como** sistema  
**Quiero** validar que las fechas de experiencia sean coherentes  
**Para** asegurar la validez de la información

**Criterios de Aceptación:**
- La fecha de inicio debe ser anterior a la fecha de fin
- La fecha de fin no puede ser futura (excepto si es trabajo actual)
- Las fechas deben tener formato válido (DD/MM/AAAA)
- Se muestra un mensaje de error si las fechas son incoherentes
- La validación se ejecuta al perder el foco de los campos

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-053: Validar Fechas de Cursos
**Como** sistema  
**Quiero** validar que las fechas de cursos sean coherentes  
**Para** asegurar la validez de la información

**Criterios de Aceptación:**
- La fecha de inicio debe ser anterior a la fecha de fin
- La fecha de fin no puede ser futura
- Las fechas deben tener formato válido (DD/MM/AAAA)
- Se muestra un mensaje de error si las fechas son incoherentes
- La validación se ejecuta al perder el foco de los campos

**Prioridad:** Media  
**Estimación:** 3 puntos

---

## MÓDULO 8: INTERFAZ DE USUARIO Y EXPERIENCIA

### HU-054: Diseño Responsive
**Como** usuario  
**Quiero** que el sistema se adapte a diferentes tamaños de pantalla  
**Para** poder acceder desde cualquier dispositivo

**Criterios de Aceptación:**
- El sistema es completamente funcional en escritorio (>1024px)
- El sistema es completamente funcional en tablet (768px-1024px)
- El sistema es completamente funcional en móvil (<768px)
- Las tablas se adaptan para móviles (scroll horizontal o formato vertical)
- El sidebar se adapta o se oculta en móviles
- Los formularios se adaptan a una columna en móviles
- Las imágenes y contenido se escalan apropiadamente

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-055: Paleta de Colores Institucional
**Como** administrador de DEVIDA  
**Quiero** que el sistema use los colores institucionales  
**Para** mantener la identidad visual de la organización

**Criterios de Aceptación:**
- Verde institucional #16a34a se usa en elementos principales
- Títulos principales usan color #04a25c
- Subtítulos usan color #108cc9 con negrita
- Los colores se aplican consistentemente en todo el sistema
- El diseño transmite profesionalismo y confianza

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-056: Iconografía Clara
**Como** usuario  
**Quiero** que los elementos visuales incluyan iconos representativos  
**Para** facilitar la comprensión de las funcionalidades

**Criterios de Aceptación:**
- Cada sección del menú tiene un icono representativo
- Los botones de acción incluyen iconos (Guardar, Editar, Eliminar, etc.)
- Los badges de estado incluyen iconos
- Los iconos son de la librería Lucide React
- Los iconos son simples y fáciles de interpretar

**Prioridad:** Baja  
**Estimación:** 2 puntos

---

### HU-057: Mensajes de Confirmación
**Como** usuario  
**Quiero** recibir mensajes de confirmación al realizar acciones importantes  
**Para** saber que mis acciones fueron exitosas

**Criterios de Aceptación:**
- Se muestra mensaje al guardar información
- Se muestra mensaje al eliminar registros
- Se muestra mensaje al enviar postulación
- Los mensajes desaparecen automáticamente después de 3-5 segundos
- Los mensajes son claros y específicos

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-058: Mensajes de Error
**Como** usuario  
**Quiero** recibir mensajes de error claros cuando algo falle  
**Para** saber qué corrección debo realizar

**Criterios de Aceptación:**
- Los mensajes de error son específicos y descriptivos
- Se indica claramente qué campo o acción causó el error
- Se sugiere cómo corregir el error cuando sea posible
- Los mensajes usan un color diferenciado (rojo)
- Los errores de validación se muestran junto al campo correspondiente

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-059: Tooltips Informativos
**Como** usuario  
**Quiero** ver tooltips al pasar el mouse sobre elementos  
**Para** obtener información adicional sin saturar la interfaz

**Criterios de Aceptación:**
- Los botones de acción muestran tooltips descriptivos
- Los campos de formulario pueden mostrar ayuda contextual
- Los tooltips aparecen al pasar el mouse (hover)
- Los tooltips desaparecen al quitar el mouse
- El texto es breve y claro

**Prioridad:** Baja  
**Estimación:** 2 puntos

---

### HU-060: Loading States
**Como** usuario  
**Quiero** ver indicadores de carga cuando el sistema está procesando  
**Para** saber que mi solicitud está siendo atendida

**Criterios de Aceptación:**
- Se muestra un spinner o loading cuando se cargan datos
- Se muestra feedback visual al enviar formularios
- Los botones se deshabilitan durante el procesamiento
- Se muestra el estado de carga en las transiciones de página
- El indicador desaparece cuando la acción se completa

**Prioridad:** Media  
**Estimación:** 3 puntos

---

## MÓDULO 9: SEGURIDAD Y PRIVACIDAD

### HU-061: Sesión Segura
**Como** usuario  
**Quiero** que mi sesión sea segura  
**Para** proteger mi información personal

**Criterios de Aceptación:**
- Las contraseñas se almacenan encriptadas
- La sesión expira después de 30 minutos de inactividad
- Se muestra un mensaje antes de cerrar la sesión por inactividad
- El usuario puede extender la sesión antes de que expire
- No se almacenan contraseñas en texto plano

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-062: Privacidad de Datos
**Como** usuario  
**Quiero** que mis datos personales estén protegidos  
**Para** asegurar mi privacidad

**Criterios de Aceptación:**
- Solo el usuario puede ver su propia información
- Los datos sensibles no se muestran en logs o errores
- Se cumple con las normativas de protección de datos
- Los archivos cargados son privados para cada usuario

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-063: Validación de Contraseña Segura
**Como** sistema  
**Quiero** validar que las contraseñas sean seguras  
**Para** proteger las cuentas de usuario

**Criterios de Aceptación:**
- La contraseña debe tener mínimo 8 caracteres
- Debe incluir al menos una letra mayúscula
- Debe incluir al menos una letra minúscula
- Debe incluir al menos un número
- Se muestra un indicador de fortaleza de contraseña
- Se muestran mensajes indicando los requisitos no cumplidos

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

## MÓDULO 10: ADMINISTRACIÓN

### HU-064: Login Administrativo
**Como** administrador de DEVIDA  
**Quiero** iniciar sesión en el panel administrativo  
**Para** gestionar convocatorias y postulaciones

**Criterios de Aceptación:**
- El formulario solicita: Usuario y Contraseña
- El sistema valida las credenciales ingresadas
- Existen dos roles: Gestor de Convocatorias (admin/admin123) y Super Admin (super/super123)
- El rol se asigna automáticamente según las credenciales
- Si las credenciales son incorrectas, se muestra un mensaje de error
- Se muestra el logo institucional con escudo
- Se incluye copyright de DEVIDA

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

### HU-065: Panel de Control Administrativo
**Como** administrador autenticado  
**Quiero** acceder a un panel de control con el menú de opciones  
**Para** navegar entre las funcionalidades administrativas

**Criterios de Aceptación:**
- Se muestra el rol del usuario en el header
- Gestor de Convocatorias tiene acceso a: Gestión de Postulaciones, Gestión de Convocatorias, Plantillas de Correo
- Super Admin tiene acceso a todo lo anterior más: Gestión de Usuarios Administrativos
- Cada opción tiene un ícono representativo
- Se muestra estadísticas generales en cards
- Incluye opción de "Cerrar Sesión"

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-066: Ver Todas las Postulaciones (Admin)
**Como** administrador de DEVIDA  
**Quiero** ver todas las postulaciones recibidas para cada convocatoria  
**Para** gestionar el proceso de selección

**Criterios de Aceptación:**
- Se muestra una tabla con todas las postulaciones
- Se pueden filtrar por convocatoria
- Se pueden filtrar por estado
- Se muestra información del postulante (nombre, DNI, email, teléfono)
- Se puede acceder al detalle completo de cada postulación
- Se puede cambiar el estado de la postulación
- Se incluyen botones de acción (Ver Detalle, Cambiar Estado)

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-067: Actualizar Estado de Postulación (Admin)
**Como** administrador de DEVIDA  
**Quiero** actualizar el estado de las postulaciones  
**Para** informar a los postulantes sobre su progreso en el proceso

**Criterios de Aceptación:**
- Se puede cambiar el estado de una postulación desde la tabla
- Los estados disponibles son: En Revisión, Preseleccionado, Finalista, No Seleccionado
- Se muestra un modal de confirmación antes de cambiar el estado
- El cambio se refleja inmediatamente en la tabla
- Se incluye badge visual del estado con colores distintivos

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-068: Crear Nueva Convocatoria (Admin)
**Como** administrador de DEVIDA  
**Quiero** crear nuevas convocatorias  
**Para** publicar oportunidades laborales

**Criterios de Aceptación:**
- El formulario incluye: código, título, perfil, tipo de contrato, ubicación, oficina, número de vacantes
- Se puede establecer fechas de inicio y fin
- Se puede ingresar requisitos mínimos y funciones principales
- Se puede establecer rango salarial
- El estado inicial es "Borrador" hasta que se publique
- Se valida que las fechas sean coherentes (fecha fin > fecha inicio)
- Navegación por pasos del formulario

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-069: Editar Convocatoria (Admin)
**Como** administrador de DEVIDA  
**Quiero** editar convocatorias existentes  
**Para** corregir información o actualizar fechas

**Criterios de Aceptación:**
- Se pueden modificar todos los campos de la convocatoria
- Se puede cambiar el estado (Borrador, Publicada, Cerrada)
- Se puede extender la fecha de cierre
- Los cambios se guardan y reflejan inmediatamente
- Se incluye validación de fechas coherentes
- Navegación similar a crear convocatoria

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

### HU-070: Eliminar Convocatoria (Admin)
**Como** administrador de DEVIDA  
**Quiero** eliminar convocatorias  
**Para** mantener el sistema organizado

**Criterios de Aceptación:**
- Se muestra un modal de confirmación antes de eliminar
- Se muestra el código y título de la convocatoria a eliminar
- El modal advierte que la acción no se puede deshacer
- Al confirmar, la convocatoria se elimina permanentemente
- Se cierra el modal automáticamente después de eliminar

**Prioridad:** Media  
**Estimación:** 3 puntos

---

### HU-071: Gestionar Plantillas de Correo (Admin)
**Como** administrador de DEVIDA  
**Quiero** gestionar las plantillas de correo electrónico  
**Para** personalizar las comunicaciones con los postulantes

**Criterios de Aceptación:**
- Se muestran plantillas predefinidas: Confirmación de Postulación, Actualización de Estado, Bienvenida
- Cada plantilla muestra: nombre, asunto y contenido
- Se puede editar el asunto y contenido de cada plantilla
- Se pueden usar variables dinámicas: {nombre}, {convocatoria}, {estado}, {fecha}
- Se incluye previsualización del contenido
- Los cambios se guardan y se aplican a futuros correos

**Prioridad:** Media  
**Estimación:** 5 puntos

---

### HU-072: Gestionar Usuarios Administrativos (Super Admin)
**Como** Super Admin  
**Quiero** gestionar los usuarios administrativos del sistema  
**Para** controlar quién tiene acceso al panel administrativo

**Criterios de Aceptación:**
- Solo el Super Admin puede acceder a esta funcionalidad
- Se muestra una tabla con todos los usuarios administrativos
- Se pueden crear nuevos usuarios con: nombre completo, email, usuario, contraseña, rol
- Se pueden editar usuarios existentes
- Se pueden eliminar usuarios (con confirmación)
- Los roles disponibles son: Gestor de Convocatorias y Super Admin
- Se valida que el email y usuario sean únicos
- Se muestra la fecha de creación de cada usuario

**Prioridad:** Alta  
**Estimación:** 8 puntos

---

### HU-073: Ver Detalle Completo de Postulación (Admin)
**Como** administrador de DEVIDA  
**Quiero** ver el detalle completo de una postulación  
**Para** evaluar al candidato de manera integral

**Criterios de Aceptación:**
- Se muestra pantalla de detalle completo navegable
- Se incluyen secciones: Datos Personales, Información Complementaria, Formación Académica, Experiencia Profesional
- Se muestra el estado actual de la postulación
- Se puede regresar a la lista de postulaciones
- Toda la información del candidato es visible de forma organizada
- Se incluyen badges visuales para mejor lectura

**Prioridad:** Alta  
**Estimación:** 5 puntos

---

## MÓDULO 11: SELECCIÓN DE TIPO DE ACCESO

### HU-074: Seleccionar Tipo de Acceso
**Como** usuario del sistema  
**Quiero** seleccionar el tipo de acceso al ingresar  
**Para** acceder a la interfaz correspondiente (Postulante o Administrativo)

**Criterios de Aceptación:**
- Se muestra pantalla inicial con dos opciones: Acceso Postulante y Panel Administrativo
- Se incluye logo institucional de DEVIDA con ícono de usuarios
- Título "SIRPO" y subtítulo "SISTEMA DE REGISTRO DE POSTULANTES" en mayúsculas
- Cada opción es una card con ícono representativo
- Al seleccionar "Acceso Postulante" se redirige al login/registro de postulantes
- Al seleccionar "Panel Administrativo" se redirige al login administrativo
- Diseño responsive y profesional con colores institucionales

**Prioridad:** Alta  
**Estimación:** 3 puntos

---

## RESUMEN DE HISTORIAS DE USUARIO

**Total de Historias de Usuario:** 70

**Distribución por Módulo:**
- Autenticación y Acceso: 4 HU
- Navegación y Estructura: 2 HU
- Convocatorias Vigentes: 8 HU
- Registro de Hoja de Vida: 17 HU
- Proceso de Postulación: 5 HU
- Mis Postulaciones: 8 HU
- Validaciones y Reglas de Negocio: 9 HU
- Interfaz de Usuario y Experiencia: 7 HU
- Seguridad y Privacidad: 3 HU
- Administración: 7 HU
- Selección de Tipo de Acceso: 1 HU

**Distribución por Prioridad:**
- Alta: 42 HU
- Media: 21 HU
- Baja: 7 HU

**Estimación Total:** 247 puntos de historia

---

## NOTAS ADICIONALES

### Convenciones Utilizadas:
- **Formato de HU:** Como [rol] quiero [funcionalidad] para [beneficio]
- **Puntos de Historia:** Basados en complejidad (1=simple, 2=fácil, 3=moderado, 5=complejo, 8=muy complejo)
- **Prioridad:** Alta (debe implementarse), Media (importante pero no crítico), Baja (deseable)

### Dependencias Críticas:
1. Las HU de Autenticación deben completarse primero
2. La HU-016 (Datos Personales) es requisito para HU-018 a HU-029
3. Las HU de Hoja de Vida completa son requisito para HU-032 a HU-036
4. Las HU-032 a HU-036 son requisito para HU-037 a HU-044

### Consideraciones de Desarrollo:
- Las historias están ordenadas según el flujo natural del usuario
- Cada módulo puede desarrollarse de forma semi-independiente
- Las validaciones (Módulo 7) deben implementarse en paralelo con sus funcionalidades
- Las funcionalidades de administración están marcadas como "Futura" pero documentadas para planificación

---

**Documento generado para:** DEVIDA - Sistema SIRPO  
**Fecha:** Enero 2026  
**Versión:** 1.0
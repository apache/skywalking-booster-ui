/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const msg = {
  general: "Servicio General",
  services: "Servicios",
  service: "Servicio",
  traces: "Trazas",
  metrics: "Métricas",
  serviceMesh: "Malla de Servicios",
  infrastructure: "Infraestructura",
  virtualMachine: "Máquina Virtual",
  dashboardNew: "Nuevo Panel",
  dashboardList: "Listado Paneles",
  logs: "Logs",
  events: "Eventos",
  alerts: "Alertas",
  settings: "Ajustes",
  dashboards: "Paneles",
  profiles: "Perfiles",
  database: "Base de Datos",
  mySQL: "MySQL/MariaDB",
  serviceName: "Nombre Servicio",
  technologies: "Tecnologías",
  generalServicePanel: "Panel Servicio General",
  health: "Salud",
  groupName: "Nombre Grupo",
  topologies: "Topologías",
  dataPanel: "Plano de Datos",
  controlPanel: "Plano de Control",
  eventList: "Listado Eventos",
  newDashboard: "Crear panel nuevo",
  dashboardEdit: "Editar el panel",
  edit: "Editar",
  delete: "Eliminar",
  confirm: "Confirmar",
  layer: "Capa",
  endpoint: "Endpoint",
  instance: "Instancia",
  create: "Crear",
  loading: "Cargando",
  selectVisualization: "Visualiza tus métricas",
  visualization: "Visualizaciones",
  graphStyles: "Estilo de gráficas",
  widgetOptions: "Opciones widget",
  standardOptions: "Opciones estandar",
  max: "Máx",
  min: "Mín",
  mean: "Promedio",
  plus: "Más",
  minus: "Menoss",
  multiply: "Multiplcar",
  total: "Todo",
  divide: "Dividir",
  convertToMilliseconds: "Convertir Unix Timestamp(milisegundos)",
  convertToSeconds: "Convertir Unix Timestamp(segundos)",
  smooth: "Suabe",
  showSymbol: "Mostrar Símbolo",
  step: "Paso",
  showValues: "Mostrar Valores",
  fontSize: "Tamaño Fuente",
  showBackground: "Mostrar Fondo",
  areaOpacity: "Opacidad Área",
  editGraph: "Editar Opciones",
  dashboardName: "Selecciona Nombre del Panel",
  linkDashboard: "Nombre del panel relacionado con llamadas de la topología",
  linkServerMetrics: "Métricas de servidor relacionadas con llamadas de la topología",
  linkClientMetrics: "Métricas de cliente relacionadas con llamadas de la topología",
  nodeDashboard: "Nombre del panel relacionado con nodos de la topología",
  nodeMetrics: "Mêtricas relacionas con nodos de la topología",
  instanceDashboard: "Nombre del panel relacionado con instancias de servicio",
  endpointDashboard: "Nombre del panel relacionado con endpoints",
  callSettings: "Ajustes Llamada",
  nodeSettings: "Ajustes Nodo",
  conditions: "Condiciones",
  legendSettings: "Ajustes Leyenda",
  setLegend: "Poner Leyenda",
  backgroundColors: "Colores Fondo",
  fontColors: "Colores Fuente",
  iconTheme: "Tema Iconos",
  default: "Por Defecto",
  topSlow: "Top 5 lentos",
  topChildren: "Top 5 hijos",
  taskList: "Listado Tareas",
  sampledTraces: "Trazas Muestreadas",
  editTab: "Habilitar edición nombre pestanyas",
  label: "Nombre Servicio",
  id: "ID Servicio",
  setRoot: "Ponerlo a raíz",
  setNormal: "Ponerlo a normal",
  export: "Exportar Plantilla Panel",
  import: "Importar Plantilla Panel",
  yes: "Sí",
  no: "No",
  tableHeaderCol1: "Nombre de la primera columna de la tabla",
  tableHeaderCol2: "Nombre de la segunda columna de la tabla",
  showXAxis: "Mostrar Eje X",
  showYAxis: "Mostrar Eje Y",
  nameError: "El nombre del panel no puede ser duplicado",
  nameEmptyError: "El nombre del panel no puede estar vacío",
  showGroup: "Mostrar Grupo",
  noRoot: "Por favor ponga la raíz del panel",
  noWidget: "Por favor añada widgets.",
  rename: "Renombrar",
  deleteTitle: "¿Está seguro que quiere eliminarlo?",
  rootTitle: "¿Está seguro que quiere establecerlo?",
  selfObservability: "Autoobservabilidad",
  satellite: "Satéllite",
  skyWalkingServer: "Servidor SkyWalking",
  functions: "Funciones",
  browser: "Navegador",
  linux: "Linux",
  editWarning: "Estás entrando en modo edición",
  viewWarning: "Estás entrando en modo visualización",
  virtualDatabase: "Base de Datos Virtual",
  virtualCache: "Caché virtual",
  reloadDashboards: "Recargar Panel",
  kubernetesService: "Servicio",
  kubernetesCluster: "Cluster",
  kubernetes: "Kubernetes",
  textUrl: "Hipervínculo de Texto",
  textAlign: "Alineación de Texto",
  metricLabel: "Etiqueta de Métrica",
  showUnit: "Mostrar Unidad",
  noGraph: "Ningún Gráfico",
  taskId: "ID Tarea",
  triggerType: "Tipo de Disparador",
  targetType: "Tipo de Objetivo",
  ebpfTip: "Le falta el proceso para perfilar",
  processSelect: "Click para seleccionar proceso",
  page: "Página",
  interval: "Intervalo de actualización",
  pause: "Pausa",
  begin: "Inicio",
  associateOptions: "Opciones de asociación",
  associateMetrics: "Índice de correlación",
  widget: "Dispositivo pequeño",
  text: "Texto",
  duplicateName: "Nombre duplicado",
  nameTip:
    "El nombre sólo admite chino e inglés, líneas horizontales y subrayado, y la longitud del nombre no excederá de 300 caracteres",
  enableAssociate: "Activar asociación",
  query: "Consulta",
  postgreSQL: "PostgreSQL",
  endpointTips: "Aquí, la tabla muestra hasta 20 punto final.",
  apisix: "APISIX",
  queryOrder: "Consulta por duración",
  setOrder: "Orden de consulta",
  latency: "Retraso",
  metricValues: "Valor métrico",
  legendValues: "Valor de la leyenda",
  iframeWidgetTip: "Añadir enlaces a los gadgets",
  iframeSrc: "Enlace Iframe",
  generateLink: "Generar enlaces",
  setDuration: "Duración de la consulta de bloqueo",
  openFunction: "OpenFunction",
  seconds: "Segundos",
  hourTip: "Seleccione Hora",
  minuteTip: "Seleccione Minuto",
  secondTip: "Seleccione Segundo",
  viewTrace: "Ver trazas relacionadas",
  relatedTraceOptions: "Opciones de seguimiento relacionadas",
  setLatencyDuration: "Índice de correlación retardada",
  enableRelatedTrace: "Activar trazas relacionadas",
  queryConditions: "Condiciones de consulta",
  maxTraceDuration: "Duración máxima",
  minTraceDuration: "Duración mínima",
  legendOptions: "Opciones de leyenda",
  showLegend: "Mostrar leyenda",
  asTable: "Como tabla",
  toTheRight: "Derecha",
  minDuration: "Duración mínima de la solicitud",
  when4xx: "Ejemplo de solicitud y respuesta http con seguimiento cuando el Código de respuesta está entre 400 y 499",
  when5xx: "Ejemplo de solicitud y respuesta http con seguimiento cuando el Código de respuesta está entre 500 y 599",
  taskTitle: "Reglas de recolección de peticiones y respuestas HTTP",
  period: "Period",
  windows: "Windows",
  second: "s",
  yearSuffix: "Año",
  monthsHead: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Set_Oct_Nov_Dic",
  months: "Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Set_Oct_Nov_Dic",
  weeks: "Lun_Mar_Mier_Jue_Vie_Sáb_Dom",
  username: "Usuario",
  password: "Contraseña",
  title: "Título",
  width: "Ancho",
  height: "Alto",
  dashboard: "Panel",
  topology: "Topología",
  trace: "Traza",
  alarm: "Recordatorio en curso",
  auto: "Auto Fresh",
  reload: "Recargar",
  version: "Versión",
  copy: "Copiar",
  reset: "Resetear",
  apply: "Aplicar",
  template: "Plantilla",
  cancel: "Cancelar",
  createTab: "Crear Pestanya",
  tabName: "Nombre de la Pestaña",
  detectPoint: "Detectar Punto",
  name: "Nombre",
  types: "Tipos",
  all: "Todo",
  endpoints: "Endpoints",
  cache: "Cache",
  serviceinstance: "InstanciaServicio",
  databaseaccess: "AccesoBaseDeDatos",
  servicerelation: "RelaciónServicio",
  serviceinstancerelation: "RelaciónInstanciaServicio",
  endpointrelation: "RelaciónEndpoint",
  status: "Estado",
  endpointName: "Nombre Endpoint",
  search: "Buscar",
  clear: "Limpiar",
  more: "Más",
  traceID: "ID Traza",
  range: "Rango",
  timeRange: "Rango de Tiempo",
  duration: "Duración",
  startTime: "Hora Inicio",
  start: "Incio",
  spans: "Lapso",
  spanInfo: "Info Lapso",
  spanType: "Tipo de Lapso",
  time: "Tiempo",
  tags: "Etiquetas",
  component: "Componente",
  table: "Tabla",
  list: "Lista",
  tree: "Árbol",
  filterScope: "Alcance de Filtro",
  searchKeyword: "Palabra Clave",
  quarterHourCutTip: "Últimos 15 mins",
  halfHourCutTip: "Últimos 30 mins",
  hourCutTip: "Última 1 hora",
  dayCutTip: "Último 1 día",
  weekCutTip: "Última 1 semana",
  monthCutTip: "Última 1 mes",
  serverZone: "Zona Horaria Servidor OAP",
  exportImage: "Exportar imagen",
  object: "Objecto",
  profile: "Perfil",
  newTask: "Nueva Tarea",
  monitorTime: "Tiempo Monitorización",
  monitorDuration: "Duración Monitorización",
  minThreshold: "Mínn Umbral Duración",
  dumpPeriod: "Volcar Periodo",
  createTask: "Crear Tarea",
  maxSamplingCount: "Máx Cantidad Mostreo",
  analyze: "Analizar",
  noData: "Ningún Dato",
  taskInfo: "Información Tarea",
  task: "Tarea",
  operationType: "Tipo Operación",
  operationTime: "Tiempo Operación",
  taskView: "Ver Tarea",
  includeChildren: "Incluir Hijos",
  excludeChildren: "Excluir Hijos",
  view: "Ver",
  timeTips: "Intervalo de tiempo no puede excedir 60 dias",
  entityType: "Tipo Entidad",
  maxItemNum: "Máx número artículos",
  unknownMetrics: "Métrica desconocida",
  labels: "Etiquetas",
  aggregation: "Cálculo",
  unit: "Unidad",
  labelsIndex: "Subíndice Etiqueta",
  group: "Grupo Servicio",
  browserView: "Navegador",
  sortOrder: "Orden de clasificación",
  chartType: "Tipo Gráfico",
  currentDepth: "Profundidad actual",
  showDepth: "Mostrar Selector Profundidad",
  defaultDepth: "Profundidad Por Defecto",
  traceTagsTip: `Solamente etiquetas definidas en core/default/searchableTracesTags pueden ser buscadas.
  Más información en la página de Vocabulario de Configuración`,
  logTagsTip: `Solamente etiquetas definidas en core/default/searchableLogsTags pueden ser buscadas.
  Más información en la página de Vocabulario de Configuración`,
  alarmTagsTip: `Solamente etiquetas definidas en core/default/searchableAlarmTags pueden ser buscadas.
  Más información en la página de Vocabulario de Configuración`,
  tagsLink: "Página de Vocabulario de Configuración",
  addTag: "Por favor introduzca una etiqueta",
  log: "Registro de Datos",
  logCategory: "Categoría Registro de Datos",
  errorCatalog: "Catálogo de Errores",
  logDetail: "Detalle Registro de Datos",
  timeReload: "Aviso: El intervalo de tiempo tiene que ser mayor que 0",
  errorInfo: "Info Error",
  stack: "Pila",
  serviceVersion: "Versión Servicio",
  errorPage: "Página de Error",
  category: "Categoría",
  grade: "Grado",
  relatedTraceLogs: "Registro de Datos Relacionados",
  setConditions: "Más Condiciones",
  metricName: "Seleccionar Nombre Métrica",
  keywordsOfContent: "Claves de Contenido",
  excludingKeywordsOfContent: "Excluir Claves de Contenido",
  return: "Volver",
  isError: "Error",
  contentType: "Tipo de Contenido",
  content: "Contenido",
  viewLogs: "Ver Registro de Datos",
  logsTagsTip: `Solamente etiquetas definidas en core/default/searchableLogsTags pueden ser buscadas.
  Más información en la página de Vocabulario de Configuración`,
  keywordsOfContentLogTips: "El almacenamiento actual del servidor SkyWalking OAP no lo soporta.",
  setEvent: "Establecer Evento",
  viewAttributes: "Ver",
  serviceEvents: "Eventos Servico",
  select: "Seleccionar",
  eventID: "ID Evento",
  eventName: "Nombre Evento",
  endTime: "Hora Finalización",
  instanceEvents: "Eventos Instancia",
  endpointEvents: "Eventos Endpoint",
  enableEvents: "Habilitar Eventos",
  disableEvents: "Deshabilitar Eventos",
  eventSeries: "Serie de Eventos",
  eventsType: "Tipo de Evento",
  eventsMessage: "Mensaje del Evento",
  eventsParameters: "Parámetro del Evento",
  eventDetail: "Detalle del Evento",
  value: "Valor",
  key: "Clave",
  show: "Mostrar",
  hide: "Oculatr",
  statistics: "Estadísticas",
  message: "Mensaje",
  tooltipsContent: "Contenido de Información de Herramienta",
  alarmDetail: "Detalle Alarma",
  scope: "Alcance",
  destService: "Servicio Destinación",
  destServiceInstance: "Instancia Servicio Destinación",
  destEndpoint: "Endpoint Destinación",
  eventSource: "Fuente Envento",
  modalTitle: "Inspección",
  selectRedirectPage: "Quiere inspeccionar las Trazas or Registros de datos del servicio %s?",
  logAnalysis: "Lenguaje de Análisis de Registro de Datos",
  logDataBody: "Contenido del Registro de Datos",
  addType: "Por favor introduzca un tipo",
  traceContext: "Registro de datos con contexto de traza",
  traceSegmentId: "ID Segmento Traza",
  spanId: "ID Lapso",
  inputTraceSegmentId: "Por favor introduzca el ID del segmento de la traza",
  inputSpanId: "Por favor introduzca el ID del lapso",
  inputTraceId: "Por favor introduzca el ID de la traza",
  dsl: "Entrada de guión para LAL",
  logContentType: "Tipo del registro de datos",
  logRespContent: "Contenido Registro de Datos",
  analysis: "Análisis",
  waitLoading: "Cargando",
  dslEmpty: "Entrada de guión de LAL no puede estar vacio",
  logContentEmpty: "El contenido del registro de datos no puede estar vacio.",
  debug: "Debugar",
  addTraceID: "Por favor introduzca el ID de la traza",
  addTags: "Por favor introduzaca una etiqueta",
  addKeywordsOfContent: "Por favor introduzca una clave de contenido",
  addExcludingKeywordsOfContent: "Por favor introduzca una clave excluyente de contenido",
  noticeTag: "Por favor presione Intro después de introducir una etiqueta(clave=valor).",
  conditionNotice:
    "Aviso: Por favor presione Intro después de introducir una clave de contenido, excluir clave de contenido(clave=valor).",
  language: "Lenguaje",
  gateway: "Puerta",
  virtualMQ: "MQ virtual",
  AWSCloud: "AWS Cloud",
  AWSCloudEKS: "EKS",
  AWSCloudS3: "S3",
  AWSCloudDynamoDB: "DynamoDB",
  AWSGateway: "AWS API Gateway",
  APIGateway: "API Gateway",
  redis: "Redis",
  elasticsearch: "Elasticsearch",
  mq: "MQ",
  rabbitMQ: "RabbitMQ",
  save: "Salvar",
  editStrategy: "Estrategia editorial",
  policyList: "Lista de políticas",
};
export default msg;

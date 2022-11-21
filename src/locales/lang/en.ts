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
  general: "General Service",
  services: "Services",
  service: "Service",
  traces: "Traces",
  metrics: "Metrics",
  serviceMesh: "Service Mesh",
  infrastructure: "Infrastructure",
  virtualMachine: "Virtual Machine",
  dashboardNew: "New Dashboard",
  dashboardList: "Dashboard List",
  logs: "Logs",
  events: "Events",
  alerts: "Alerts",
  settings: "Settings",
  dashboards: "Dashboards",
  profiles: "Profiles",
  database: "Database",
  mySQL: "MySQL",
  serviceName: "Service Name",
  technologies: "Technologies",
  generalServicePanel: "General Service Panel",
  health: "Health",
  groupName: "Group Name",
  topologies: "Topologies",
  dataPanel: "Data Plane",
  controlPanel: "Control Plane",
  eventList: "Event List",
  newDashboard: "Create a new dashboard",
  dashboardEdit: "Edit the dashboard",
  edit: "Edit",
  delete: "Delete",
  confirm: "Confirm",
  layer: "Layer",
  endpoint: "Endpoint",
  instance: "Instance",
  create: "Create",
  loading: "Loading",
  selectVisualization: "Visualize Metrics",
  visualization: "Visualization",
  graphStyles: "Graph Styles",
  widgetOptions: "Widget Options",
  standardOptions: "Standard Options",
  max: "Max",
  min: "Min",
  plus: "Plus",
  mean: "Mean",
  minus: "Minus",
  multiply: "Multiply",
  divide: "Divide",
  total: "Total",
  convertToMilliseconds: "Convert Unix Timestamp(milliseconds)",
  convertToSeconds: "Convert Unix Timestamp(seconds)",
  smooth: "Smooth",
  showSymbol: "Show Symbol",
  step: "Step",
  showValues: "Show Values",
  fontSize: "Font Size",
  showBackground: "Show Background",
  areaOpacity: "Area Opacity",
  editGraph: "Edit Options",
  dashboardName: "Select Dashboard Name",
  linkDashboard: "Dashboard name related with topology calls",
  linkServerMetrics: "Server metrics related with topology calls",
  linkClientMetrics: "Client metrics related with topology calls",
  nodeDashboard: "Dashboard name related with topology nodes",
  nodeMetrics: "Metrics related with topology nodes",
  instanceDashboard: "Dashboard name related with service instances",
  endpointDashboard: "Dashboard name related with endpoints",
  callSettings: "Call settings",
  nodeSettings: "Node Settings",
  conditions: "Conditions",
  legendSettings: "Legend Settings",
  setLegend: "Set Legend",
  backgroundColors: "Background Colors",
  fontColors: "Font Colors",
  iconTheme: "Icon Theme",
  default: "Default",
  topSlow: "Top 5 of slow",
  topChildren: "Top 5 of children",
  taskList: "Task List",
  sampledTraces: "Sampled Traces",
  editTab: "Enable editing tab names",
  label: "Service Name",
  id: "Service ID",
  setRoot: "Set this to root",
  setNormal: "Set this to normal",
  export: "Export Dashboard Templates",
  import: "Import Dashboard Templates",
  yes: "Yes",
  no: "No",
  tableHeaderCol1: "Name of the first column of the table",
  tableHeaderCol2: "Name of the second column of the table",
  showXAxis: "Show X Axis",
  showYAxis: "Show Y Axis",
  nameError: "The dashboard name cannot be duplicate",
  nameEmptyError: "The dashboard name cannot be empty",
  showGroup: "Show Group",
  noRoot: "Please set a root dashboard for",
  noWidget: "Please add widgets.",
  rename: "Rename",
  deleteTitle: "Are you sure you want to delete this?",
  rootTitle: "Are you sure you want to set this?",
  selfObservability: "Self Observability",
  satellite: "Satellite",
  skyWalkingServer: "SkyWalking Server",
  functions: "Functions",
  browser: "Browser",
  linux: "Linux",
  editWarning: "You are entering edit mode",
  viewWarning: "You are entering view mode",
  virtualDatabase: "Virtual Database",
  virtualCache: "Virtual Cache",
  reloadDashboards: "Reload dashboards",
  kubernetesService: "Service",
  kubernetesCluster: "Cluster",
  kubernetes: "Kubernetes",
  textUrl: "Text Hyperlink",
  textAlign: "Text Align",
  metricLabel: "Metric Label",
  showUnit: "Show Unit",
  noGraph: "No Graph",
  taskId: "Task ID",
  triggerType: "Trigger Type",
  targetType: "Target Type",
  ebpfTip: "Don't have a process for profiling",
  processSelect: "Click to select processes",
  container: "Container",
  limit: "Limit",
  page: "Page",
  interval: "Refresh Interval",
  pause: "Pause",
  begin: "Start",
  associateOptions: "Association Options",
  associateMetrics: "Association Metrics",
  widget: "Widget",
  nameTip:
    "The name only supports Chinese and English, horizontal lines and underscores. The length of the name is limited to 300 characters",
  duplicateName: "Duplicate name",
  enableAssociate: "Enable association",
  text: "Text",
  query: "Query",
  postgreSQL: "PostgreSQL",
  endpointTips: "The table shows up to 20 pieces of endpoints.",
  apisix: "APISIX",
  viewTrace: "View Related Traces",
  relatedTraceOptions: "Related Trace Options",
  setLatencyDuration: "Delay Related Metrics",
  queryOrder: "Query Order",
  latency: "Latency",
  metricValues: "Metric Values",
  queryConditions: "Query Conditions",
  enableRelatedTrace: "Enable Related Trace",
  maxTraceDuration: "Maximum Duration",
  minTraceDuration: "Minimum Duration",
  legendOptions: "Legend Options",
  showLegend: "Show Legend",
  asTable: "As Table",
  toTheRight: "To The Right",
  legendValues: "Legend Values",
  seconds: "Seconds",
  hourTip: "Select Hour",
  minuteTip: "Select Minute",
  secondTip: "Select Second",
  second: "s",
  yearSuffix: "Year",
  monthsHead: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec",
  months: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec",
  weeks: "Mon_Tue_Wed_Thu_Fri_Sat_Sun",
  username: "Username",
  password: "Password",
  title: "Title",
  width: "Width",
  height: "Height",
  dashboard: "Dashboard",
  topology: "Topology",
  trace: "Trace",
  alarm: "Alerting",
  auto: "Auto",
  reload: "Reload",
  version: "Version",
  copy: "Copy",
  reset: "Reset",
  apply: "Apply",
  template: "Template",
  cancel: "Cancel",
  createTab: "Create Tab",
  tabName: "Tab Name",
  detectPoint: "Detect Point",
  name: "Name",
  types: "Types",
  all: "All",
  endpoints: "Endpoints",
  cache: "Cache",
  serviceinstance: "ServiceInstance",
  databaseaccess: "DatabaseAccess",
  servicerelation: "ServiceRelation",
  serviceinstancerelation: "ServiceInstanceRelation",
  endpointrelation: "EndpointRelation",
  status: "Status",
  endpointName: "Endpoint Name",
  search: "Search",
  clear: "Clear",
  more: "More",
  traceID: "Trace ID",
  range: "Range",
  timeRange: "Time Range",
  duration: "Duration",
  startTime: "Start Time",
  start: "Start",
  spans: "Spans",
  spanInfo: "Span Info",
  spanType: "Span Type",
  time: "Time",
  tags: "Tags",
  component: "Component",
  table: "Table",
  list: "List",
  tree: "Tree",
  filterScope: "Filter Scope",
  searchKeyword: "Keyword",
  quarterHourCutTip: "Last 15 mins",
  halfHourCutTip: "Last 30 mins",
  hourCutTip: "Last 1 hour",
  dayCutTip: "Last 1 day",
  weekCutTip: "Last 1 week",
  monthCutTip: "Last 1 month",
  serverZone: "OAP Server Time Zone",
  exportImage: "Export image",
  object: "Object",
  profile: "Profile",
  newTask: "New Task",
  monitorTime: "Monitor Time",
  monitorDuration: "Monitor Duration",
  minThreshold: "Min Duration Threshold",
  dumpPeriod: "Dump Period",
  createTask: "Create Task",
  maxSamplingCount: "Max Sampling Count",
  analyze: "Analyze",
  noData: "No Data",
  taskInfo: "Task Information",
  task: "Task",
  operationType: "Operation Type",
  operationTime: "Operation Time",
  taskView: "View Task",
  includeChildren: "Include Children",
  excludeChildren: "Exclude Children",
  view: "View",
  timeTips: "Time interval cannot exceed 60 days",
  entityType: "Entity Type",
  maxItemNum: "Max number of Item",
  unknownMetrics: "Unknown Metrics",
  labels: "Label",
  aggregation: "Calculation",
  unit: "Unit",
  labelsIndex: "Label Subscript",
  group: "Service Group",
  browserView: "Browser",
  sortOrder: "Sort Order",
  chartType: "Chart Type",
  currentDepth: "Current Depth",
  showDepth: "Show Depth Selector",
  defaultDepth: "Default Depth",
  traceTagsTip: `Only tags defined in the core/default/searchableTracesTags are searchable.
  Check more details on the Configuration Vocabulary page`,
  logTagsTip: `Only tags defined in the core/default/searchableLogsTags are searchable.
  Check more details on the Configuration Vocabulary page`,
  alarmTagsTip: `Only tags defined in the core/default/searchableAlarmTags are searchable.
  Check more details on the Configuration Vocabulary page`,
  tagsLink: "Configuration Vocabulary page",
  addTag: "Please input a tag",
  log: "Log",
  logCategory: "Log Category",
  errorCatalog: "Error Catalog",
  logDetail: "Log Detail ",
  timeReload: "Notice: The time interval must be greater than 0",
  errorInfo: "Error Info",
  stack: "Stack",
  serviceVersion: "Service Version",
  errorPage: "Error Page",
  category: "Category",
  grade: "Grade",
  relatedTraceLogs: "Related Logs",
  setConditions: "More Conditions",
  metricName: "Select Metric Names",
  keywordsOfContent: "Keys Of Content",
  excludingKeywordsOfContent: "Exclude Keys Of Content",
  return: "Return",
  isError: "Error",
  contentType: "Content Type",
  content: "Content",
  viewLogs: "View Logs",
  logsTagsTip: `Only tags defined in the core/default/searchableLogsTags are searchable.
  Check more details on the Configuration Vocabulary page`,
  keywordsOfContentLogTips:
    "Current storage of SkyWalking OAP server does not support this.",
  setEvent: "Set Event",
  viewAttributes: "View",
  serviceEvents: "Service Events",
  select: "Select",
  eventID: "Event ID",
  eventName: "Event Name",
  endTime: "End Time",
  instanceEvents: "Instance Events",
  endpointEvents: "Endpoint Events",
  enableEvents: "Enable Events",
  disableEvents: "Disable Events",
  eventSeries: "Events Series",
  eventsType: "Event Type",
  eventsMessage: "Event Message",
  eventsParameters: "Event Parameters",
  eventDetail: "Event Detail",
  value: "Value",
  key: "Key",
  show: "Show",
  hide: "Hide",
  statistics: "Statistics",
  message: "Message",
  tooltipsContent: "Tooltip Content",
  alarmDetail: "Alarm Detail",
  scope: "Scope",
  destService: "Destination Service",
  destServiceInstance: "Destination Service Instance",
  destEndpoint: "Destination Endpoint",
  eventSource: "Event Source",
  modalTitle: "Inspection",
  selectRedirectPage: "Do you want to inspect Traces or Logs of %s service?",
  logAnalysis: "Log Analysis Language",
  logDataBody: "The content of the log",
  addType: "Please input a type",
  traceContext: "Logs with trace context",
  traceSegmentId: "Trace Segment ID",
  spanId: "Span ID",
  inputTraceSegmentId: "Please input the trace segment ID",
  inputSpanId: "Please input the span ID",
  inputTraceId: "Please input the trace ID",
  dsl: "Script input for LAL",
  logContentType: "The type of the log content",
  logRespContent: "Log Content",
  analysis: "Analysis",
  waitLoading: "Loading",
  dslEmpty: "Script input of LAL should not be empty",
  logContentEmpty: "The content of the log should not be empty.",
  debug: "Debug",
  addTraceID: "Please input a trace ID",
  addTags: "Please input a tag",
  addKeywordsOfContent: "Please input a keyword of content",
  addExcludingKeywordsOfContent: "Please input a keyword of excluding content",
  noticeTag: "Please press Enter after inputting a tag(key=value).",
  conditionNotice:
    "Notice: Please press Enter after inputting a key of content, exclude key of content(key=value).",
  language: "Language",
  gateway: "Gateway",
  virtualMQ: "Virtual MQ",
};
export default msg;

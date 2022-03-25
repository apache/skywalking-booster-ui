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
  general: "普通服务",
  services: "服务",
  traces: "跟踪",
  metrics: "指标",
  serviceMesh: "服务网格",
  infrastructure: "基础结构",
  virtualMachine: "虚拟机",
  dashboardNew: "新建仪表板",
  dashboardHome: "仪表盘首页",
  dashboardList: "仪表盘列表",
  log: "日志",
  events: "事件",
  alerts: "警告",
  settings: "设置",
  dashboards: "仪表盘",
  profiles: "性能剖析",
  database: "数据库",
  serviceName: "服务名称",
  technologies: "技术",
  health: "健康",
  groupName: "群名称",
  generalServicePanel: "普通服务面板",
  topologies: "拓扑图",
  dataPanel: "数据面板",
  controlPanel: "控制面板",
  eventList: "事件列表",
  databasePanel: "数据库面板",
  meshServicePanel: "服务面板",
  newDashboard: "新增仪表盘",
  dashboardEdit: "编辑仪表盘",
  edit: "编辑",
  delete: "删除",
  layer: "层",
  endpoint: "端点",
  create: "新建",
  loading: "加载中",
  selectVisualization: "可视化指标",
  visualization: "可视化",
  graphStyles: "图形样式",
  widgetOptions: "组件选项",
  standardOptions: "标准选项",
  max: "最大值",
  min: "最小值",
  plus: "加法",
  minus: "减法",
  multiply: "乘法",
  divide: "除法",
  convertToMilliseconds: "转换Unix时间戳（毫秒）",
  convertToSeconds: "转换Unix时间戳（秒）",
  smooth: "光滑的",
  showSymbol: "显示符号",
  step: "台阶",
  showValues: "显示值",
  fontSize: "字体大小",
  showBackground: "显示背景",
  areaOpacity: "透明度",
  editGraph: "选项编辑",
  dashboardName: "选择仪表板名称",
  linkDashboard: "拓扑线关联的仪表板名称",
  linkServerMetrics: "拓扑线服务端关联的指标",
  linkClientMetrics: "拓扑线客户端关联的指标",
  nodeDashboard: "拓节点关联的仪表板名称",
  nodeMetrics: "拓扑节点关联的指标",
  instanceDashboard: "拓节点关联的实例的仪表板名称",
  endpointDashboard: "拓节点端点的实例的仪表板名称",
  callSettings: "拓扑线设置",
  nodeSettings: "拓扑点设置",
  conditions: "条件",
  legendSettings: "图例设置",
  setLegend: "设置图例",
  backgroundColors: "背景颜色",
  fontColors: "字体颜色",
  iconTheme: "图标主题",
  default: "默认",
  topSlow: "迟缓的前5名",
  topChildren: "小孩数量的前5名",
  showDepth: "展示深度选择器",
  taskList: "任务列表",
  sampledTraces: "采样的追踪",
  editTab: "开启编辑Tab的名称",
  label: "服务名称",
  id: "服务编号",
  setRoot: "设置成为根",
  setNormal: "设置成为普通",
  export: "导出仪表板模板",
  import: "导入仪表板模板",
  yes: "是",
  no: "否",
  tableHeaderCol1: "表格的第一列的名称",
  tableHeaderCol2: "表格的第二列的名称",
  showXAxis: "显示X轴",
  showYAxis: "显示Y轴",
  nameError: "仪表板名称不能重复",
  noRoot: "请设置根仪表板，为",
  showGroup: "显示分组",
  noWidget: "请添加组件",
  rename: "重命名",
  selfObservability: "自观性",
  satellite: "Satellite",
  skyWalkingServer: "SkyWalking服务",
  functions: "Functions",
  linux: "Linux",
  browser: "浏览器",
  editWarning: "你正在进入编辑模式",
  viewWarning: "你正在进入预览模式",
  virtualDatabase: "虚拟数据库",
  reloadDashboards: "重新加载仪表盘",
  kubernetesService: "服务",
  kubernetesCluster: "集群",
  kubernetes: "Kubernetes",
  textUrl: "文本超链接",
  textAlign: "文本对齐",
  hourTip: "选择小时",
  minuteTip: "选择分钟",
  secondTip: "选择秒数",
  second: "秒",
  yearSuffix: "年",
  monthsHead: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月",
  months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月",
  weeks: "一_二_三_四_五_六_日",
  hello: "你好",
  helloMessage: "欢迎来到, Apache SkyWalking APM 系统 !",
  username: "用户名",
  password: "密码",
  title: "标题",
  width: "宽度",
  height: "高度",
  login: "登录",
  signout: "登出",
  topology: "拓扑图",
  trace: "追踪",
  alarm: "告警",
  event: "事件",
  auto: "自动",
  reload: "刷新",
  usermode: "用户模式",
  editmode: "编辑模式",
  currentVersion: "当前版本",
  currentPage: "当前页面",
  version: "版本",
  page: "页面",
  currentDatabase: "当前数据库",
  templateConfig: "模版配置",
  copy: "拷贝",
  reset: "重制",
  apply: "应用",
  createTemplate: "创建模板",
  templateType: "模板类型",
  templateName: "模板名称",
  template: "模版",
  confirm: "确定",
  cancel: "取消",
  createTab: "创建分页",
  tabName: "分页名",
  nouse: "不使用",
  allServices: "所有服务",
  serviceDetail: "服务详情",
  detectPoint: "侦察端",
  callType: "调用类型",
  server: "服务端",
  client: "客户端",
  name: "名称",
  types: "类型",
  cpm: "每分钟请求量",
  sla: "SLA",
  latency: "延迟",
  avgResponseTime: "平均响应时间",
  avgThroughput: "平均吞吐量",
  avgSLA: "平均SLA",
  all: "全部",
  success: "成功",
  error: "失败",
  service: "服务",
  instance: "实例",
  endpoints: "端点",
  cache: "存储器",
  global: "全局",
  serviceendpoint: "服务端点",
  serviceinstance: "服务实例",
  databaseaccess: "数据库存取",
  servicerelation: "服务关系",
  serviceinstancerelation: "服务实例关系",
  endpointrelation: "服务端点关系",
  status: "状态",
  endpointName: "端点名称",
  search: "搜索",
  clear: "清空",
  more: "更多",
  traceID: "追踪ID",
  range: "范围",
  timeRange: "时间范围",
  duration: "持续时间",
  startTime: "开始时间",
  start: "起始点",
  spans: "跨度",
  spanInfo: "跨度信息",
  spanType: "跨度类型",
  time: "时间",
  tags: "标记",
  logs: "日志",
  component: "组件",
  table: "表格",
  list: "列表",
  tree: "树结构",
  filterScope: "过滤范围",
  searchKeyword: "关键字",
  quarterHourCutTip: "最近15分钟",
  halfHourCutTip: "最近30分钟",
  hourCutTip: "最近1小时",
  dayCutTip: "最近1天",
  weekCutTip: "最近1周",
  monthCutTip: "最近1月",
  serverZone: "服务器时区",
  percentResponse: "百分比响应",
  exportImage: "导出为图片",
  queryData: "数据查询",
  previousService: "上一个服务",
  nextService: "下一个服务",
  object: "粒度",
  ShowInstanceDependency: "展示实例依赖",
  InstanceDependencyTitle: "实例依赖",
  profile: "性能剖析",
  newTask: "新建任务",
  monitorTime: "监控时间",
  monitorDuration: "监控持续时间",
  minThreshold: "起始监控时间",
  dumpPeriod: "监控间隔",
  createTask: "新建任务",
  maxSamplingCount: "最大采样数",
  analyze: "分析",
  noData: "数据为空",
  taskInfo: "任务详情",
  task: "任务",
  operationType: "操作类型",
  operationTime: "操作时间",
  taskView: "查看任务详情",
  includeChildren: "包含子部分",
  excludeChildren: "不包含子部分",
  view: "查看",
  timeTips: "时间区间不能超过60天",
  standardAPM: "标准APM",
  entityType: "实体类型",
  maxItemNum: "最多条目数",
  independentSelector: "独立选择器",
  unknownMetrics: "未知指标",
  labels: "标签",
  aggregation: "数据计算",
  unit: "单位",
  labelsIndex: "标签下标",
  parentService: "父级服务",
  isParentService: "设置父服务",
  noneParentService: "不设置父服务",
  group: "服务组",
  endpointFilter: "端点过滤器",
  databaseView: "数据库视图",
  browserView: "浏览器视图",
  metricsView: "大屏视图",
  sortOrder: "排序方式",
  descendOrder: "递减顺序",
  increaseOrder: "递增顺序",
  defaultOrder: "默认顺序",
  chartType: "图表类型",
  currentDepth: "当前深度",
  defaultDepth: "默认深度",
  traceTagsTip:
    "只有core/default/searchableTracesTags中定义的标记才可搜索。查看配置词汇表页面上的更多详细信息。",
  tagsLink: "配置词汇页",
  addTag: "请添加标签",
  logCategory: "日志类别",
  errorCatalog: "错误类目",
  logDetail: "日志详情",
  timeReload: "注意：时间间隔必须大于0",
  errorInfo: "错误信息",
  stack: "堆栈",
  serviceVersion: "服务版本",
  errorPage: "错误页面",
  category: "类别",
  grade: "等级",
  relatedTraceLogs: "相关的日志",
  setConditions: "更多条件",
  metricName: "选择指标名称",
  keywordsOfContent: "内容关键词",
  excludingKeywordsOfContent: "内容不包含的关键词",
  return: "返回",
  isError: "错误",
  contentType: "内容类型",
  content: "内容",
  viewLogs: "查看日志",
  logsTagsTip:
    "只有core/default/searchableLogsTags中定义的标记才可搜索。查看配置词汇表页面上的更多详细信息。",
  keywordsOfContentLogTips: "SkyWalking OAP服务器的当前存储不支持此操作",
  setEvent: "设置事件",
  viewAttributes: "实例属性",
  serviceEvents: "服务事件",
  select: "选择",
  eventID: "事件ID",
  eventName: "事件名称",
  endTime: "结束时间",
  instanceEvents: "实例事件",
  endpointEvents: "端点事件",
  enableEvents: "启动事件",
  disableEvents: "禁用事件",
  eventSeries: "事件系列",
  eventsType: "事件类型",
  eventsMessage: "事件消息",
  eventsParameters: "事件参数",
  eventDetail: "事件详情",
  value: "数值",
  tableHeader: "表头名称",
  tableValues: "表值",
  show: "展示",
  hide: "隐藏",
  statistics: "统计",
  message: "信息",
  tooltipsContent: "提示内容",
  alarmDetail: "警告详情",
  scope: "范围",
  destService: "终点服务",
  destServiceInstance: "终点实例",
  destEndpoint: "终点端点",
  eventSource: "事件资源",
  modalTitle: "查看",
  selectRedirectPage: "查看 %s 服务的追踪或日志？",
  logAnalysis: "日志分析语言",
  logDataBody: "日志数据的内容",
  addType: "请输入一个类型",
  traceContext: "具有跟踪上下文的日志",
  traceSegmentId: "跟踪段ID",
  spanId: "跨度ID",
  inputTraceSegmentId: "请输入跟踪段ID",
  inputSpanId: "请输入跨度ID",
  inputTraceId: "请输入跟踪ID",
  dsl: "LAL的脚本输入",
  logContentType: "日志内容的类型",
  logRespContent: "日志内容",
  analysis: "分析",
  waitLoading: "加载中",
  dslEmpty: "LAL的脚本输入不应该是空",
  logContentEmpty: "日志数据的内容不应该是空。",
  debug: "调试",
  addTraceID: "请输入一个Trace ID",
  addTags: "请输入一个标签",
  addKeywordsOfContent: "请输入一个内容关键词",
  addExcludingKeywordsOfContent: "请输入一个内容不包含的关键词",
  noticeTag: "请输入一个标签(key=value)之后回车",
  conditionNotice:
    "请输入一个标签、内容关键词或者内容不包含的关键词(key=value)之后回车",
  cacheModalTitle: "清除缓存提醒",
  cacheReminderContent: "SkyWalking检测到仪表板模板更新，是否需要更新？",
  language: "语言",
};
export default msg;

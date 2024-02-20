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
const titles = {
  // General Service
  general_service: "常规服务",
  general_service_desc: "通过从SkyWalking代理收集的遥测数据来观察服务和相对直接的依赖关系。",
  general_service_services: "服务",
  general_service_services_desc: "通过SkyWalking Agent收集的遥测数据观察服务。",
  general_service_virtual_database: "虚拟数据库",
  general_service_virtual_database_desc: "观察语言代理通过各种插件推测的虚拟数据库。",
  general_service_virtual_cache: "虚拟缓存",
  general_service_virtual_cache_desc: "观察语言代理通过各种插件推测的虚拟缓存服务器。",
  general_service_virtual_mq: "虚拟消息队列",
  general_service_virtual_mq_desc: "观察语言代理通过各种插件推测的虚拟消息队列服务器。",
  // Service Mesh
  service_mesh: "服务网格",
  service_mesh_desc: "服务网格（Istio）通过分布式或微服务架构解决了开发人员和运营商面临的挑战。",
  service_mesh_service: "服务",
  service_mesh_service_desc: "通过从Envoy访问日志服务（ALS）收集的遥测数据观察服务网格。",
  service_mesh_control_plane: "控制平面",
  service_mesh_control_plane_desc: "通过Istio的自我监控指标提供对其行为的监控。",
  service_mesh_data_plane: "数据平面",
  service_mesh_data_plane_desc: "通过Envoy Metrics Service观察Envoy Proxy。",
  // Kubernetes
  kubernetes: "Kubernetes",
  kubernetes_desc: "Kubernetes是一个开源的容器编排系统，用于自动化软件部署、扩展和管理。",
  kubernetes_cluster: "集群",
  kubernetes_cluster_desc: "提供对K8S集群的状态和资源的监控。",
  kubernetes_service: "服务",
  kubernetes_service_desc: "从Kubernetes中观察服务状态和资源。",
  // Infrastructure
  infrastructure: "基础设施",
  infrastructure_desc: "操作系统是整个IT系统的基础设施。它的可观察性为所有分布式和现代复杂系统的运行提供了基础。",
  infrastructure_linux: "Linux",
  infrastructure_linux_desc: "提供Linux操作系统（OS）监控。",
  infrastructure_windows: "Windows",
  infrastructure_windows_desc: "提供Windows操作系统（OS）监控。",
  // AWS Cloud
  aws_cloud: "AWS云服务",
  aws_cloud_desc: "亚马逊网络服务（AWS）提供可靠、可扩展且价格低廉的云计算服务。",
  aws_cloud_eks: "EKS",
  aws_cloud_eks_desc: "通过AWS Container Insights Receiver提供AWS Cloud EKS监控。",
  aws_cloud_s3: "S3",
  aws_cloud_s3_desc: "通过AWS FireHose Receiver提供AWS Cloud S3监控",
  aws_cloud_dynamodb: "DynamoDB",
  aws_cloud_dynamodb_desc: "通过AWS FireHose Receiver提供DynamoDB监控。",
  aws_cloud_api_gateway: "API Gateway",
  aws_cloud_api_gateway_desc: "通过AWS FireHose Receiver提供AWS Cloud API网关监控。",
  // Browser
  browser: "Browser",
  browser_desc: "通过Apache SkyWalking Client JS提供Web应用程序、版本和页面的浏览器端监控。",
  // Gateway
  gateway: "网关",
  gateway_desc: "API网关是位于客户端和后端服务集合之间的API管理工具。",
  gateway_nginx: "Nginx",
  gateway_nginx_desc: "通过OpenTelemetry的Prometheus接收器提供Nginx监控。",
  gateway_apisix: "APISIX",
  gateway_apisix_desc: "通过OpenTelemetry的Prometheus接收器提供APISIX监控。",
  gateway_aws_api_gateway: "AWS API Gateway",
  gateway_aws_api_gateway_desc: "通过AWS FireHose Receiver提供AWS Cloud API网关监控。",
  // Database
  database: "数据库",
  database_desc: "数据库是结构化信息或数据的有组织的集合，通常以电子方式存储在计算机系统中。",
  database_mysql_mariadb: "MySQL/MariaDB",
  database_mysql_mariadb_desc: "通过OpenTelemetry的Prometheus接收器提供MySQL和MariaDB服务器监控。",
  database_postgresql: "PostgreSQL",
  database_postgresql_desc: "通过OpenTelemetry的Prometheus接收器提供PostgreSQL监控。",
  database_dynamodb: "DynamoDB",
  database_dynamodb_desc: "通过AWS FireHose Receiver提供DynamoDB监控。",
  database_redis: "Redis",
  database_redis_desc: "通过OpenTelemetry的Prometheus接收器提供Redis监控。",
  database_elasticsearch: "Elasticsearch",
  database_elasticsearch_desc: "通过OpenTelemetry的Prometheus接收器提供Elasticsearch服务器监控。",
  database_mongodb: "MongoDB",
  database_mongodb_desc: "通过OpenTelemetry的Prometheus接收器提供MongoDB监控。",
  // Message Queue
  mq: "消息队列",
  mq_desc: "消息队列是无服务器和微服务架构中使用的异步服务对服务通信的一种形式。",
  mq_rabbitmq: "RabbitMQ",
  mq_rabbitmq_desc: "通过OpenTelemetry的Prometheus接收器提供RabbitMQ监控。",
  mq_kafka: "Kafka",
  mq_Kafka_desc: "通过OpenTelemetry的Prometheus接收器提供Kafka监控。",
  mq_pulsar: "Pulsar",
  mq_Pulsar_desc: "通过OpenTelemetry的Prometheus接收器提供Pulsar监控。",
  mq_rocketmq: "RocketMQ",
  mq_rocketmq_desc: "通过OpenTelemetry的Prometheus接收器提供RocketMQ监控。",
  // self observability
  self_observability: "自监控",
  self_observability_desc: "自观察性为运行SkyWalking生态系统中的组件和服务器提供了可观察性。",
  self_observability_oap: "SkyWalking服务",
  self_observability_oap_desc: "OAP后端集群本身是一个分布式流处理系统，这是对OAP后端本身的监控。",
  self_observability_satellite: "Satellite",
  self_observability_satellite_desc:
    "Satellite：为云原生基础设施设计的开源代理，提供了一种低成本、高效、更安全的遥测数据收集方式。它是遥测采集的推荐负载均衡器。",
};

export default titles;

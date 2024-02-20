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
  general_service: "Servicio General",
  general_service_desc:
    "Observar el servicio y las dependencias relativamente directas a través de los datos de telemetría recopilados del agente skywalking.",
  general_service_services: "Servicios",
  general_service_services_desc: "Observe services through telemetry data collected from SkyWalking Agent.",
  general_service_virtual_database: "Base de Datos Virtual",
  general_service_virtual_database_desc:
    "Observe the virtual databases which are conjectured by language agents through various plugins.",
  general_service_virtual_cache: "Caché virtual",
  general_service_virtual_cache_desc:
    "Observe the virtual cache servers which are conjectured by language agents through various plugins.",
  general_service_virtual_mq: "MQ virtual",
  general_service_virtual_mq_desc:
    "Observe the virtual message queue servers which are conjectured by language agents through various plugins.",
  // Service Mesh
  service_mesh: "Malla de Servicios",
  service_mesh_desc:
    "La red de servicios (istio) resuelve los desafíos que enfrentan los desarrolladores y operadores a través de una arquitectura distribuida o de microservicio.",
  service_mesh_service: "Servicios",
  service_mesh_service_desc:
    "Observe Service Mesh through telemetry data collected from Envoy Access Log Service (ALS).",
  service_mesh_control_plane: "Plano de Control",
  service_mesh_control_plane_desc: "Provide monitoring of the behavior of Istio through its self-monitoring metrics.",
  service_mesh_data_plane: "Plano de Datos",
  service_mesh_data_plane_desc: "Observe Envoy Proxy through Envoy Metrics Service.",
  // Kubernetes
  kubernetes: "Kubernetes",
  kubernetes_desc:
    "Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management.",
  kubernetes_cluster: "Cluster",
  kubernetes_cluster_desc: "Provide monitoring of the status and resources of the K8S Cluster.",
  kubernetes_service: "Servicio",
  kubernetes_service_desc: "Observe Service status and resources from Kubernetes.",
  // Infrastructure
  infrastructure: "Infraestructura",
  infrastructure_desc:
    "Operation Systems act as the infrastructure of the whole IT system. Its observabilities provide the fundamentals for all distributed and modern complex systems running.",
  infrastructure_linux: "Linux",
  infrastructure_linux_desc: "Provide Linux Operation System(OS) monitoring.",
  infrastructure_windows: "Windows",
  infrastructure_windows_desc: "Provide Windows Operation System(OS) monitoring.",
  // AWS Cloud
  aws_cloud: "AWS Cloud",
  aws_cloud_desc: "Amazon Web Services(AWS) offers reliable, scalable, and inexpensive cloud computing services.",
  aws_cloud_eks: "EKS",
  aws_cloud_eks_desc: "Provide AWS Cloud EKS monitoring through AWS Container Insights Receiver.",
  aws_cloud_s3: "S3",
  aws_cloud_s3_desc: "Provide AWS Cloud S3 monitoring through AWS FireHose Receiver.",
  aws_cloud_dynamodb: "DynamoDB",
  aws_cloud_dynamodb_desc: "Provide DynamoDB monitoring through Amazon CloudWatch.",
  aws_cloud_api_gateway: "API Gateway",
  aws_cloud_api_gateway_desc: "Provide AWS Cloud API Gateway monitoring through AWS FireHose Receiver.",
  // Browser
  browser: "Navegador",
  browser_desc: "Provide Browser-Side monitoring of Web-App, Versions and Pages, through Apache SkyWalking Client JS.",
  // Gateway
  gateway: "Puerta",
  gateway_desc:
    "API gateway is an API management tool that sits between a client and a collection of backend services.",
  gateway_nginx: "Nginx",
  gateway_nginx_desc: "Provide Nginx monitoring through OpenTelemetry's Prometheus Receiver.",
  gateway_apisix: "APISIX",
  gateway_apisix_desc: "Provide APISIX monitoring through OpenTelemetry's Prometheus Receiver.",
  gateway_aws_api_gateway: "AWS API Gateway",
  gateway_aws_api_gateway_desc: "Provide AWS Cloud API Gateway monitoring through AWS FireHose Receiver.",
  // Database
  database: "Base de Datos",
  database_desc:
    "The database is the organized collection of structured information, or data, typically stored electronically in a computer system.",
  database_mysql_mariadb: "MySQL/MariaDB",
  database_mysql_mariadb_desc:
    "Provide MySQL and MariaDB Server monitoring through OpenTelemetry's Prometheus Receiver.",
  database_postgresql: "PostgreSQL",
  database_postgresql_desc: "Provide PostgreSQL monitoring through OpenTelemetry's Prometheus Receiver.",
  database_dynamodb: "DynamoDB",
  database_dynamodb_desc: "Provide DynamoDB monitoring through Amazon CloudWatch.",
  database_redis: "Redis",
  database_redis_desc: "Provide Redis monitoring through OpenTelemetry's Prometheus Receiver.",
  database_elasticsearch: "Elasticsearch",
  database_elasticsearch_desc: "Provide Elasticsearch Server monitoring through OpenTelemetry's Prometheus Receiver.",
  database_mongodb: "MongoDB",
  database_mongodb_desc: "Provide MongoDB monitoring through OpenTelemetry's Prometheus Receiver.",
  // Message Queue
  mq: "Message Queue",
  mq_desc:
    "A message queue is a form of asynchronous service-to-service communication used in serverless and microservices architectures.",
  mq_rabbitmq: "RabbitMQ",
  mq_rabbitmq_desc: "Provide RabbitMQ monitoring through OpenTelemetry's Prometheus Receiver.",
  mq_kafka: "Kafka",
  mq_kafka_desc: "Provide Kafka monitoring through OpenTelemetry's Prometheus Receiver.",
  mq_pulsar: "Pulsar",
  mq_pulsar_desc: "Provide Pulsar monitoring through OpenTelemetry's Prometheus Receiver.",
  mq_rocketmq: "RocketMQ",
  mq_rocketmq_desc: "Provide RocketMQ monitoring through OpenTelemetry's Prometheus Receiver.",
  // self observability
  self_observability: "Self Observability",
  self_observability_desc:
    "Self Observability provides the observabilities for running components and servers from the SkyWalking ecosystem.",
  self_observability_oap: "SkyWalking Server",
  self_observability_oap_desc:
    "The OAP backend cluster itself is a distributed streaming process system, this is the monitoring for the OAP backend itself.",
  self_observability_satellite: "Satellite",
  self_observability_satellite_desc:
    "Satellite: an open-source agent designed for the cloud-native infrastructures, which provides a low-cost, high-efficient, and more secure way to collect telemetry data. It is the recommended load balancer for telemetry collecting.",
};

export default titles;

export const listTrace = {
  data: {
    trace: {
      spans: [
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580000",
          spanId: 0,
          parentSpanId: -1,
          refs: [],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795558,
          endTime: 1713140795570,
          endpointName: "POST:/order",
          type: "Entry",
          peer: "",
          component: "SpringMVC",
          isError: false,
          layer: "Http",
          tags: [
            { key: "url", value: "http://localhost:10070/order" },
            { key: "http.method", value: "POST" },
            { key: "woo.order.id", value: "-8091796425484786187" },
            { key: "http.status_code", value: "200" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795560,
          endTime: 1713140795562,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795562,
          endTime: 1713140795568,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_order ( order_id,\nuser_id,\norder_amout ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795568,
          endTime: 1713140795568,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959580000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.78.17131407932360001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.78.17131407932360000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.69.17131407934730001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.69.17131407934730000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.70.17131407938430001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.70.17131407938430000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.71.17131407941930001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.71.17131407941930000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
          ],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795958,
          endTime: 1713140795961,
          endpointName: "MessageBatch",
          type: "Local",
          peer: "",
          component: "rocketMQ-producer",
          isError: false,
          layer: "Unknown",
          tags: [
            { key: "woo.order.id", value: "8873320518912571848" },
            { key: "woo.order.id", value: "-7101405034217239298" },
            { key: "woo.order.id", value: "-5222549140468995052" },
            { key: "woo.order.id", value: "7133984305775220946" },
            { key: "woo.order.id", value: "1687867387336546237" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959580000",
              parentSpanId: 0,
              type: "CROSS_THREAD",
            },
          ],
          serviceCode: "OrderCenterApplication",
          serviceInstanceName: "cc56ac798a984e4c8631bf95c12ec2a4@10.182.9.30",
          startTime: 1713140795961,
          endTime: 1713140795966,
          endpointName: "RocketMQ/points/Producer",
          type: "Exit",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-producer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "mq.broker", value: "10.182.9.30:10911" },
            { key: "mq.topic", value: "points" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
              parentSpanId: 0,
              type: "CROSS_PROCESS",
            },
          ],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795983,
          endTime: 1713140796001,
          endpointName: "RocketMQ/points/Consumer",
          type: "Entry",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-consumer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "transmission.latency", value: "23" },
            { key: "mq.topic", value: "points" },
            { key: "mq.broker", value: "10.182.9.30:10911" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795991,
          endTime: 1713140795992,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795994,
          endTime: 1713140795996,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            { key: "db.statement", value: "SELECT points_id,order_id,points FROM s_points \n \n WHERE (order_id = ?)" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795996,
          endTime: 1713140795996,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 4,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140795997,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 5,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140796001,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_points ( points_id,\norder_id,\npoints ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.101.17131407959810000",
          spanId: 6,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140796001,
          endTime: 1713140796001,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
              parentSpanId: 0,
              type: "CROSS_PROCESS",
            },
          ],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795983,
          endTime: 1713140796002,
          endpointName: "RocketMQ/points/Consumer",
          type: "Entry",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-consumer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "transmission.latency", value: "23" },
            { key: "mq.topic", value: "points" },
            { key: "mq.broker", value: "10.182.9.30:10911" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795991,
          endTime: 1713140795992,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795994,
          endTime: 1713140795996,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            { key: "db.statement", value: "SELECT points_id,order_id,points FROM s_points \n \n WHERE (order_id = ?)" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795996,
          endTime: 1713140795996,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 4,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140795997,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 5,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140796002,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_points ( points_id,\norder_id,\npoints ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.99.17131407959810000",
          spanId: 6,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140796002,
          endTime: 1713140796002,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
              parentSpanId: 0,
              type: "CROSS_PROCESS",
            },
          ],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795983,
          endTime: 1713140796002,
          endpointName: "RocketMQ/points/Consumer",
          type: "Entry",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-consumer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "transmission.latency", value: "23" },
            { key: "mq.topic", value: "points" },
            { key: "mq.broker", value: "10.182.9.30:10911" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795991,
          endTime: 1713140795992,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795994,
          endTime: 1713140795996,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            { key: "db.statement", value: "SELECT points_id,order_id,points FROM s_points \n \n WHERE (order_id = ?)" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795996,
          endTime: 1713140795996,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 4,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140795997,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 5,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140796002,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_points ( points_id,\norder_id,\npoints ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.100.17131407959810000",
          spanId: 6,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140796002,
          endTime: 1713140796002,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
              parentSpanId: 0,
              type: "CROSS_PROCESS",
            },
          ],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795983,
          endTime: 1713140796002,
          endpointName: "RocketMQ/points/Consumer",
          type: "Entry",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-consumer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "transmission.latency", value: "23" },
            { key: "mq.topic", value: "points" },
            { key: "mq.broker", value: "10.182.9.30:10911" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795991,
          endTime: 1713140795993,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795994,
          endTime: 1713140795996,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            { key: "db.statement", value: "SELECT points_id,order_id,points FROM s_points \n \n WHERE (order_id = ?)" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795996,
          endTime: 1713140795996,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 4,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140795997,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 5,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140796002,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_points ( points_id,\norder_id,\npoints ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.102.17131407959810000",
          spanId: 6,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140796002,
          endTime: 1713140796002,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 0,
          parentSpanId: -1,
          refs: [
            {
              traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
              parentSegmentId: "87d7dec5feb34659a4088de3d6a918a3.89.17131407959610002",
              parentSpanId: 0,
              type: "CROSS_PROCESS",
            },
          ],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795983,
          endTime: 1713140796002,
          endpointName: "RocketMQ/points/Consumer",
          type: "Entry",
          peer: "127.0.0.1:9876",
          component: "rocketMQ-consumer",
          isError: false,
          layer: "MQ",
          tags: [
            { key: "transmission.latency", value: "23" },
            { key: "mq.topic", value: "points" },
            { key: "mq.broker", value: "10.182.9.30:10911" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 1,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795991,
          endTime: 1713140795993,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 2,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795994,
          endTime: 1713140795996,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            { key: "db.statement", value: "SELECT points_id,order_id,points FROM s_points \n \n WHERE (order_id = ?)" },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 3,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795996,
          endTime: 1713140795996,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 4,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140795997,
          endpointName: "HikariCP/Connection/getConnection",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 5,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140795997,
          endTime: 1713140796002,
          endpointName: "Mysql/JDBC/PreparedStatement/execute",
          type: "Exit",
          peer: "localhost:3306",
          component: "mysql-connector-java",
          isError: false,
          layer: "Database",
          tags: [
            { key: "db.type", value: "Mysql" },
            { key: "db.instance", value: "orderdb" },
            {
              key: "db.statement",
              value: "INSERT INTO s_points ( points_id,\norder_id,\npoints ) VALUES ( ?,\n?,\n? )",
            },
          ],
          logs: [],
          attachedEvents: [],
        },
        {
          traceId: "87d7dec5feb34659a4088de3d6a918a3.72.17131407955580001",
          segmentId: "b46a850dcbc546b6abeee07472c3f97d.98.17131407959810000",
          spanId: 6,
          parentSpanId: 0,
          refs: [],
          serviceCode: "PointsCenterApplication",
          serviceInstanceName: "c45c96ecdea4430787ee2931c9793bae@10.182.9.30",
          startTime: 1713140796002,
          endTime: 1713140796002,
          endpointName: "HikariCP/Connection/close",
          type: "Local",
          peer: "",
          component: "HikariCP",
          isError: false,
          layer: "Unknown",
          tags: [],
          logs: [],
          attachedEvents: [],
        },
      ],
    },
  },
};

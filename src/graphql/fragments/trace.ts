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

export const Traces = {
  variable: "$condition: TraceQueryCondition",
  query: `
  data: queryBasicTraces(condition: $condition) {
    traces {
      key: segmentId
      endpointNames
      duration
      start
      isError
      traceIds
    }
  }`,
};

/**
 * @param { traceId } { string }
 */
export const TraceSpans = {
  variable: "$traceId: ID!",
  query: `
  trace: queryTrace(traceId: $traceId) {
    spans {
      traceId
      segmentId
      spanId
      parentSpanId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      serviceCode
      serviceInstanceName
      startTime
      endTime
      endpointName
      type
      peer
      component
      isError
      layer
      tags {
        key
        value
      }
      logs {
        time
        data {
          key
          value
        }
      }
      attachedEvents {
        startTime {
          seconds
          nanos
        }
        event
        endTime {
          seconds
          nanos
        }
        tags {
          key
          value
        }
        summary {
          key
          value
        }
      }
    }
  }
  `,
};
export const TraceTagKeys = {
  variable: "$duration: Duration!",
  query: `
  tagKeys: queryTraceTagAutocompleteKeys(duration: $duration)`,
};

export const TraceTagValues = {
  variable: "$tagKey: String!, $duration: Duration!",
  query: `
  tagValues: queryTraceTagAutocompleteValues(tagKey: $tagKey, duration: $duration)`,
};

export const TraceSpansFromColdStage = {
  variable: "$traceId: ID!, $duration: Duration!, $debug: Boolean",
  query: `
  trace: queryTrace(traceId: $traceId, duration: $duration, debug: $debug) {
    spans {
      traceId
      segmentId
      spanId
      parentSpanId
      refs {
        traceId
        parentSegmentId
        parentSpanId
        type
      }
      serviceCode
      serviceInstanceName
      startTime
      endTime
      endpointName
      type
      peer
      component
      isError
      layer
      tags {
        key
        value
      }
      logs {
        time
        data {
          key
          value
        }
      }
      attachedEvents {
        startTime {
          seconds
          nanos
        }
        event
        endTime {
          seconds
          nanos
        }
        tags {
          key
          value
        }
        summary {
          key
          value
        }
      }
    }
  }
  `,
};

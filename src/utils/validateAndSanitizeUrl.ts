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

// URL validation function to prevent XSS
export function validateAndSanitizeUrl(url: string): { isValid: boolean; sanitizedUrl: string; error: string } {
  if (!url.trim()) {
    return { isValid: true, sanitizedUrl: "", error: "" };
  }
  try {
    let inputUrl = url;
    if (!url.includes("http")) {
      inputUrl = `${location.origin}${url}`;
    }
    // Create URL object to validate the URL format
    const urlObj = new URL(inputUrl);

    // Only allow HTTP and HTTPS protocols to prevent XSS
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return {
        isValid: false,
        sanitizedUrl: "",
        error: "Only HTTP and HTTPS URLs are allowed",
      };
    }

    // Additional security checks
    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "le:"];
    const lowerUrl = inputUrl.toLowerCase();

    for (const protocol of dangerousProtocols) {
      if (lowerUrl.includes(protocol)) {
        return {
          isValid: false,
          sanitizedUrl: "",
          error: "Dangerous protocols are not allowed",
        };
      }
    }

    // Return the sanitized URL (using the URL object to normalize it)
    return {
      isValid: true,
      sanitizedUrl: urlObj.href,
      error: "",
    };
  } catch (error) {
    console.error(error);
    return {
      isValid: false,
      sanitizedUrl: "",
      error: "Please enter a valid URL",
    };
  }
}

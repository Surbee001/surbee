"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Cipher: () => Cipher,
  VERSION: () => VERSION
});
module.exports = __toCommonJS(index_exports);

// src/cipher.ts
var DEFAULT_CONFIG = {
  tier: 3,
  thresholds: {
    fail: 0.4,
    review: 0.7
  },
  debug: false,
  endpoint: "https://api.surbee.com/v1/cipher"
};
var TIER_INFO = {
  1: {
    name: "Basic",
    description: "Essential fraud detection with behavioral heuristics",
    checksCount: 6
  },
  2: {
    name: "Standard",
    description: "Adds device fingerprinting and automation detection",
    checksCount: 15
  },
  3: {
    name: "Enhanced",
    description: "Adds AI-powered content quality analysis",
    checksCount: 22
  },
  4: {
    name: "Advanced",
    description: "Full behavioral analysis with network validation",
    checksCount: 30
  },
  5: {
    name: "Maximum",
    description: "All 43 checks with cross-respondent fraud detection",
    checksCount: 43
  }
};
var Cipher = class {
  config;
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("API key is required. Get one from Settings > API Keys in your Surbee dashboard.");
    }
    if (!config.apiKey.startsWith("cipher_sk_") && !config.apiKey.startsWith("cipher_pk_")) {
      throw new Error("Invalid API key format. Keys should start with cipher_sk_ or cipher_pk_");
    }
    this.config = {
      apiKey: config.apiKey,
      tier: config.tier ?? DEFAULT_CONFIG.tier,
      thresholds: {
        fail: config.thresholds?.fail ?? DEFAULT_CONFIG.thresholds.fail,
        review: config.thresholds?.review ?? DEFAULT_CONFIG.thresholds.review
      },
      debug: config.debug ?? DEFAULT_CONFIG.debug,
      endpoint: config.endpoint ?? DEFAULT_CONFIG.endpoint
    };
  }
  /**
   * Validate a single response
   */
  async validate(input) {
    const response = await this.request("/validate", {
      tier: this.config.tier,
      thresholds: this.config.thresholds,
      input
    });
    return response;
  }
  /**
   * Validate multiple responses in batch
   */
  async validateBatch(input) {
    const response = await this.request("/validate/batch", {
      tier: this.config.tier,
      thresholds: this.config.thresholds,
      submissions: input.submissions,
      crossAnalysis: input.crossAnalysis ?? this.config.tier === 5
    });
    return response;
  }
  /**
   * Get tier information
   */
  getTierInfo(tier) {
    const t = tier ?? this.config.tier;
    return TIER_INFO[t];
  }
  /**
   * Get all available tiers
   */
  getAllTiers() {
    return Object.entries(TIER_INFO).map(([tier, info]) => ({
      tier: Number(tier),
      ...info
    }));
  }
  /**
   * Check API key validity and credits
   */
  async checkStatus() {
    const response = await this.request("/status", {});
    return response;
  }
  /**
   * Make API request to Surbee
   */
  async request(path, body) {
    const url = `${this.config.endpoint}${path}`;
    if (this.config.debug) {
      console.log(`[Cipher] POST ${url}`);
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "X-Cipher-SDK": "0.1.0"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }
      return response.json();
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }
      throw this.createError(0, { message: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  /**
   * Create a typed error
   */
  createError(status, data) {
    let code;
    let message;
    switch (status) {
      case 401:
        code = "INVALID_API_KEY";
        message = "Invalid API key. Check your key in Settings > API Keys.";
        break;
      case 402:
        code = "INSUFFICIENT_CREDITS";
        message = "Insufficient credits. Add more credits in your Surbee dashboard.";
        break;
      case 429:
        code = "RATE_LIMITED";
        message = "Rate limited. Please slow down your requests.";
        break;
      case 400:
        code = "INVALID_INPUT";
        message = data.message || "Invalid input data.";
        break;
      case 403:
        code = "TIER_NOT_AVAILABLE";
        message = "This tier is not available on your plan. Upgrade to access higher tiers.";
        break;
      default:
        code = status === 0 ? "NETWORK_ERROR" : "SERVER_ERROR";
        message = data.message || "An error occurred.";
    }
    return { code, message, details: data };
  }
};

// src/index.ts
var VERSION = "0.1.0";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cipher,
  VERSION
});

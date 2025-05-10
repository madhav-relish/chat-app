/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    publicRuntimeConfig: {
        // Will be available on both server and client
        APP_URL: process.env.APP_URL || "http://localhost:3000",
        WS_URL: process.env.WS_URL || "ws://localhost:3001",
      },
};

export default config;

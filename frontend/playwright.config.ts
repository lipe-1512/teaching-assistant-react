import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:3004',
    headless: true,
  },
  testDir: './e2e',
};

export default config;

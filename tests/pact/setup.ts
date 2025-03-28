import { beforeAll, afterAll, afterEach } from 'vitest';
import axios from 'axios';

// Reset axios base configuration before each test
beforeAll(() => {
  axios.defaults.baseURL = '';
  axios.defaults.headers.common = {};
});

// Clean up after each test
afterEach(() => {
  axios.defaults.headers.common = {};
});

// Global teardown
afterAll(() => {
  // Any global cleanup needed
});
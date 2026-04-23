import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Jest compatibility shim for existing test files
(globalThis as any).jest = vi;

// react-router v7 requires TextEncoder/TextDecoder which jsdom 16 doesn't provide
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

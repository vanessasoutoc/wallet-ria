import { VersioningType, ValidationPipe } from '@nestjs/common';

// Flush enough microtask rounds for the bootstrap async chain to complete
const flushBootstrap = async () => {
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
};

const buildMockApp = () => ({
  enableVersioning: jest.fn(),
  useGlobalPipes: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
});

describe('bootstrap (main.ts)', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.PORT;
  });

  it('should create the NestJS app and call listen', async () => {
    const mockApp = buildMockApp();

    jest.isolateModules(() => {
      jest.doMock('@nestjs/core', () => ({
        NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
        VersioningType,
      }));
      jest.doMock('../src/common/utils/delay', () => ({
        __esModule: true,
        default: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock('../src/common/utils/random-between', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue(3),
      }));
      require('../src/main');
    });

    await flushBootstrap();

    expect(mockApp.listen).toHaveBeenCalledTimes(1);
  });

  it('should enable URI versioning', async () => {
    const mockApp = buildMockApp();

    jest.isolateModules(() => {
      jest.doMock('@nestjs/core', () => ({
        NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
        VersioningType,
      }));
      jest.doMock('../src/common/utils/delay', () => ({
        __esModule: true,
        default: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock('../src/common/utils/random-between', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue(3),
      }));
      require('../src/main');
    });

    await flushBootstrap();

    expect(mockApp.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
    });
  });

  it('should register a ValidationPipe with whitelist and forbidNonWhitelisted', async () => {
    const mockApp = buildMockApp();

    jest.isolateModules(() => {
      jest.doMock('@nestjs/core', () => ({
        NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
        VersioningType,
      }));
      jest.doMock('../src/common/utils/delay', () => ({
        __esModule: true,
        default: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock('../src/common/utils/random-between', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue(3),
      }));
      require('../src/main');
    });

    await flushBootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledTimes(1);
    const pipe: ValidationPipe = mockApp.useGlobalPipes.mock.calls[0][0];
    expect(pipe.constructor.name).toBe('ValidationPipe');
    expect((pipe as any).validatorOptions?.whitelist).toBe(true);
    expect((pipe as any).validatorOptions?.forbidNonWhitelisted).toBe(true);
  });

  it('should listen on PORT env variable when set', async () => {
    process.env.PORT = '4000';
    const mockApp = buildMockApp();

    jest.isolateModules(() => {
      jest.doMock('@nestjs/core', () => ({
        NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
        VersioningType,
      }));
      jest.doMock('../src/common/utils/delay', () => ({
        __esModule: true,
        default: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock('../src/common/utils/random-between', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue(3),
      }));
      require('../src/main');
    });

    await flushBootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
  });

  it('should listen on port 3000 by default when PORT is not set', async () => {
    const mockApp = buildMockApp();

    jest.isolateModules(() => {
      jest.doMock('@nestjs/core', () => ({
        NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
        VersioningType,
      }));
      jest.doMock('../src/common/utils/delay', () => ({
        __esModule: true,
        default: jest.fn().mockResolvedValue(undefined),
      }));
      jest.doMock('../src/common/utils/random-between', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue(3),
      }));
      require('../src/main');
    });

    await flushBootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });
});

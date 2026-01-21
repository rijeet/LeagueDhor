import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Test utilities for creating test modules and mocks
 */

export class TestUtils {
  /**
   * Create a mock repository for testing
   */
  static createMockRepository<T extends object>(): Partial<Repository<T>> {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
  }

  /**
   * Create a test module with mocked dependencies
   */
  static async createTestingModule(moduleMetadata: any): Promise<TestingModule> {
    return Test.createTestingModule(moduleMetadata).compile();
  }

  /**
   * Get repository token for dependency injection
   */
  static getRepositoryToken(entity: any): string | Function {
    return getRepositoryToken(entity);
  }
}

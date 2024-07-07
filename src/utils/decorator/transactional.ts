import { DataSource, QueryRunner } from 'typeorm';

let dataSource: DataSource;

// Define the decorator function
export function Transactional(): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let queryRunner: QueryRunner;
      // TODO: Remove this with existing
      try {
        if (!dataSource) {
          dataSource = await new DataSource({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'mydatabase',
          }).initialize();
        }

        console.log('dataSource::', dataSource);
        queryRunner = dataSource.createQueryRunner();
        console.log('queryRunner::', queryRunner);
        await queryRunner.startTransaction();
        // Call the original method and await its result
        const result = await originalMethod.apply(this, args);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        if (queryRunner) {
          await queryRunner.rollbackTransaction();
        }
        throw error;
      } finally {
        if (queryRunner) {
          await queryRunner.release();
        }
      }
    };

    return descriptor;
  };
}

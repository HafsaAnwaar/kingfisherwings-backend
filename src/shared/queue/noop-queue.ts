import { Logger } from '@nestjs/common';
import type { Queue } from 'bull';

const logger = new Logger('NoopQueue');

/** Stub queue when REDIS_ENABLED=false — jobs are not processed in the background. */
export function createNoopQueue(queueName: string): Pick<Queue, 'add'> {
  return {
    add: async (...args: unknown[]) => {
      logger.warn(
        `Redis disabled — "${queueName}" job not queued. Enable Redis for background processing.`,
      );
      return { id: 'noop', data: args[0] } as Awaited<ReturnType<Queue['add']>>;
    },
  };
}

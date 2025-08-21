import { Logger } from "@nestjs/common";

export function Retry(retries: number = 3, delay: number = 1000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      let attempt = 0;

      while (attempt < retries) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          attempt++;

          if (attempt >= retries) {
            logger.error(
              `Method ${propertyName} failed after ${retries} attempts`,
              error.stack
            );
            throw error;
          }

          logger.warn(
            `Method ${propertyName} failed, attempt ${attempt}/${retries}. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };
  };
}

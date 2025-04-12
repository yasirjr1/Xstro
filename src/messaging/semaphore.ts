/**
 * A Semaphore implementation that controls access to limited resources.
 * This class implements the classic semaphore concurrency primitive with a
 * waiting queue for fairness.
 */
export class Semaphore {
 private current: number;
 private readonly max: number;
 private queue: Array<{ resolve: () => void; reject: (error: Error) => void }> =
  [];

 /**
  * Creates a new Semaphore instance.
  *
  * @param max The maximum number of concurrent permits allowed.
  * @throws {Error} If max is less than 1.
  */
 constructor(max: number) {
  if (max < 1) {
   throw new Error('Semaphore max value must be at least 1');
  }
  this.current = 0;
  this.max = max;
 }

 /**
  * Acquires a permit from this semaphore, blocking until one is available.
  *
  * @returns A promise that resolves when a permit is acquired.
  */
 async acquire(): Promise<void> {
  if (this.current < this.max) {
   this.current++;
   return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
   this.queue.push({ resolve, reject });
  });
 }

 /**
  * Releases a permit, returning it to the semaphore.
  * If there are waiting acquirers, one will be unblocked.
  */
 release(): void {
  if (this.current <= 0) {
   throw new Error(
    'Cannot release semaphore - no permits are currently acquired',
   );
  }

  this.current--;

  const next = this.queue.shift();
  if (next) {
   this.current++;
   next.resolve();
  }
 }
}

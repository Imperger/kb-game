import { isRejectedResponse, RejectedResponse } from '@/services/api-service/rejected-response';
import { Component, Vue } from 'vue-property-decorator';
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

type RemovePromiseAndRejection<T> = Exclude<T extends Promise<infer U> ? U : T, RejectedResponse>;

class Task<T> {
  private execTimestamp!: number;

  constructor (public readonly target: () => T,
    public readonly listener: (data: RemovePromiseAndRejection<T>) => unknown,
    public readonly interval: number) {
    this.updateExecTimestamp();
  }

  public updateExecTimestamp (): void {
    this.execTimestamp = Date.now() + this.interval;
  }

  public isExecutedAfter (task: Task<unknown>): boolean {
    return this.execTimestamp > task.execTimestamp;
  }

  public get ets (): number {
    return this.execTimestamp;
  }
}

@Component
export default class WatchMixin extends Vue {
  private tasks = new MinPriorityQueue<Task<unknown>>(x => x.ets);

  private nextTaskTimer = -1;

  destroyed (): void {
    this.resetTaskTimer();
  }

  public async watch<T> (target: () => T, listener: (data: RemovePromiseAndRejection<T>) => unknown, interval: number): Promise<void> {
    await this.execute(target, listener);

    this.scheduleNext(target, listener, interval);
  }

  private async execute<T> (target: () => T, listener: (data: RemovePromiseAndRejection<T>) => unknown) {
    const targetResult = target();

    const result = targetResult instanceof Promise
      ? await targetResult
      : targetResult;

    if (!isRejectedResponse(result)) {
      listener(result as RemovePromiseAndRejection<T>);
    }
  }

  private scheduleNext<T> (target: () => T, listener: (data: RemovePromiseAndRejection<T>) => unknown, interval: number) {
    const taskToSchedule = new Task(target, listener, interval);

    if (this.hasScheduledTask) {
      if (this.tasks.front().isExecutedAfter(taskToSchedule as Task<unknown>)) {
        this.resetTaskTimer();
        this.tasks.push(taskToSchedule as Task<unknown>);
        this.scheduleNextTask();
      }
    } else {
      this.tasks.push(taskToSchedule as Task<unknown>);
      this.scheduleNextTask();
    }
  }

  private get hasScheduledTask (): boolean {
    return this.nextTaskTimer !== -1;
  }

  private resetTaskTimer (): void {
    clearTimeout(this.nextTaskTimer);
    this.nextTaskTimer = -1;
  }

  private scheduleNextTask (): void {
    this.nextTaskTimer = setTimeout(() => this.taskHandler(), this.tasks.front().interval);
  }

  private taskHandler (): void {
    const taskToReschedule = this.tasks.pop();

    this.execute(taskToReschedule.target, taskToReschedule.listener);

    taskToReschedule.updateExecTimestamp();
    this.tasks.push(taskToReschedule);

    this.scheduleNextTask();
  }
}

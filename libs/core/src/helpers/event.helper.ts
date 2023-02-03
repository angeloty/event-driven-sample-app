import { v4 } from "uuid";
import { Logger } from "./logger.helper";
export type EventCallbackFnType = (...args: any) => void | Promise<void>;
export interface IEventCallbackConfig {
  emitIfTriggered: boolean;
}
export interface IEventCallback {
  id: string;
  fn: EventCallbackFnType;
  type: "on" | "once";
  config?: IEventCallbackConfig;
}
export interface IEventConfig {
  callbacks: IEventCallback[];
  type: "single" | "multiple";
  emitted: boolean;
}
export class EventManager {
  private events: {
    [key: string]: IEventConfig;
  } = {};
  create(name: string, config?: Partial<IEventConfig>): void {
    const cfg: IEventConfig = (this.events[name] || {}) as IEventConfig;
    const event: IEventConfig = {
      ...cfg,
      type: config?.type || cfg?.type || "multiple",
      emitted: cfg?.emitted || false,
      callbacks: [...(cfg?.callbacks || []), ...(config?.callbacks || [])],
    };
    this.events = {
      ...this.events,
      [name]: event,
    };
  }
  on(
    evt: string,
    callback: EventCallbackFnType,
    config?: IEventCallbackConfig,
    type: "on" | "once" = "on"
  ): void {
    const cb: IEventCallback = {
      id: v4(),
      type: type || "on",
      fn: callback,
      config,
    };
    this.create(evt, {
      callbacks: [cb],
    });
    if (config?.emitIfTriggered && this.events[evt]?.emitted) {
      this.callFn(evt, cb);
    }
  }
  once(
    evt: string,
    callback: EventCallbackFnType,
    config?: IEventCallbackConfig
  ): void {
    this.on(evt, callback, config, "once");
  }
  emit(evt: string, ...params: any[]) {
    this.create(evt);
    const { callbacks } = this.events[evt];
    callbacks.forEach((cb) => this.callFn(evt, cb, ...params));
    this.events[evt].emitted = true;
  }
  private callFn(
    evt: string,
    fn: string | IEventCallback,
    ...params: any[]
  ): Promise<void> {
    const event: IEventConfig = this.events[evt];
    if (!event) {
      return;
    }
    const callback: IEventCallback = event.callbacks.find(
      (cb: IEventCallback) =>
        (typeof fn === "string" && cb.id === fn) || fn === cb
    );
    if (!callback) {
      return;
    }
    this.runFn(evt, callback.fn, ...params);
    if (callback.type === "once") {
      this.events = {
        ...this.events,
        [evt]: {
          ...this.events[evt],
          callbacks: this.events[evt].callbacks.filter(
            (cb) => cb.id !== callback.id
          ),
        },
      };
      if (event.type === "single") {
        this.events[evt].callbacks = [];
      }
    }
  }

  async runFn(evt: string, fn: EventCallbackFnType, ...params): Promise<void> {
    try {
      await fn(...params);
    } catch (err) {
      Logger.error(
        `Core:Event`,
        `Callback(${fn?.name}) Fails for event(${evt})`
      );
    }
  }
}
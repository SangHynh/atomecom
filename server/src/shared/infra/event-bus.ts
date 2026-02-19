import { EventEmitter } from 'events';
import logger from '@shared/utils/logger.js';

export class EventBus {
  private _emitter: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();
    // Increase limit if many modules start listening to the same event
    this._emitter.setMaxListeners(20);
  }

  public emit(event: string, data: any): void {
    logger.debug(`[EventBus] Emitting event: ${event}`, { data });
    this._emitter.emit(event, data);
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this._emitter.on(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void): void {
    this._emitter.once(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this._emitter.off(event, listener);
  }
}

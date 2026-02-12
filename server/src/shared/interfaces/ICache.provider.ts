export interface ICache {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getInfo(): Promise<Record<string, any> | string | null>;
}

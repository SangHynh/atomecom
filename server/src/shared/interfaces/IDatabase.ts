export interface IDatabase {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getNumberOfConnections(): number;
}

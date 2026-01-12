import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'system-core',
  brokers: ['localhost:9092'],
  connectionTimeout: 10000,
  authenticationTimeout: 10000,
  requestTimeout: 30000,
});

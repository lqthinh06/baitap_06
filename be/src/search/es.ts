// be/src/search/es.ts
import { Client } from '@elastic/elasticsearch';

export const es = new Client({
  node: process.env.ELASTICSEARCH_NODE!,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || '',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  },
  // tls: { rejectUnauthorized: false }, // bật nếu self-signed
});

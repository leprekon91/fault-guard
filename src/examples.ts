import axios from 'axios';
import { applyAxiosResilience } from './adapters/axios';

const client = axios.create({ baseURL: "https://httpbin.org" });
applyAxiosResilience(client, { retry: { retries: 2, minDelayMs: 100 } });

export async function run() {
  try {
    const r = await client.get('/status/500');
    console.log('ok', r.status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('failed', msg);
  }
}

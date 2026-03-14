import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { WrapOptions } from '../types';
import { wrap } from '../core/wrap';

export function applyAxiosResilience(axios: AxiosInstance, opts: WrapOptions = {}) {
  axios.interceptors.request.use((cfg) => cfg);

  axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      const config = err.config as AxiosRequestConfig & { __circuit_wrapped?: boolean };
      if (!config) return Promise.reject(err);
      if (config.__circuit_wrapped) return Promise.reject(err);

      // create per-request wrap options so we can inject a bulkheadKey derived from the request
      const perRequestOpts: WrapOptions = { ...opts };
      if (opts.bulkhead && opts.bulkhead.keyed && !opts.bulkhead.bulkheadKey) {
        // derive a key from request config: prefer explicit header, then tenant header, then method+path
        const derive = () => {
          try {
            const headers = (config.headers || {}) as Record<string, any>;
            const explicit = headers['x-bulkhead-key'] || headers['X-Bulkhead-Key'];
            if (explicit) return String(explicit);
            const tenant = headers['x-tenant-id'] || headers['X-Tenant-Id'];
            if (tenant) return `tenant:${String(tenant)}`;
            const method = (config.method || 'GET').toUpperCase();
            let path = String(config.url || '');
            try {
              const base = config.baseURL || '';
              const u = new URL(path, base || undefined);
              path = u.pathname;
            } catch (e) {
              // ignore - keep raw path
            }
            return `${method}:${path}`;
          } catch (e) {
            return 'unknown';
          }
        };
        perRequestOpts.bulkhead = { ...opts.bulkhead, bulkheadKey: derive };
      }

      const promiseFn = () => axios(config);
      config.__circuit_wrapped = true;
      try {
        const result = await wrap(promiseFn, perRequestOpts);
        return result;
      } catch (e) {
        return Promise.reject(e);
      }
    }
  );
}

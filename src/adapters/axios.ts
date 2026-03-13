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

      const promiseFn = () => axios(config);
      config.__circuit_wrapped = true;
      try {
        const result = await wrap(promiseFn, opts);
        return result;
      } catch (e) {
        return Promise.reject(e);
      }
    }
  );
}

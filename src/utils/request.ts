import { message } from 'antd';
import { request as umiRequest } from 'umi';
import type { RequestOptionsInit } from 'umi-request';

export const request = (
  url: string,
  options: RequestOptionsInit & { skipErrorHandler?: boolean | undefined } = {},
) => {
  return umiRequest(url, options);
};

export const authRequest = (
  url: string,
  options: RequestOptionsInit & { skipErrorHandler?: boolean | undefined } = {},
) => {
  options.token = true;
  return request(url, options);
};

export function createAxiosFetchHandler(siteId: any, config?: Record<string, unknown>) {
  return async function (options: any) {
    const requestConfig: any = {
      ...options,
      url: options.uri,
      method: options.method,
      data: options.params,
      headers: options.headers,
      ...config,
    };

    if (!requestConfig?.headers?.Authorization) {
      const token = localStorage.getItem('token');
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    const _config: any = JSON.parse(JSON.stringify(requestConfig));
    _config.params.siteId = siteId;

    const response = await request(_config.url, _config);
    if (response.code != 1) {
      message.error(response.msg);
    }
    return response;
  };
}

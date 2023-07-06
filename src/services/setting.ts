import { request } from '@/utils/request';

export function getSiteInfo() {
  return request('/api/v1/lowcode/app/setting/siteInfo');
}

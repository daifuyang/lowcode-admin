import { authRequest } from '@/utils/request';

export function getSites() {
  return authRequest('/api/v1/tenant/admin/site');
}

/* 添加工作空间应用 */
export async function addSite(data = {}) {
  return authRequest('/api/v1/tenant/admin/site', {
    method: 'post',
    data,
  });
}

/* 编辑工作空间应用 */
export async function editSite(siteId: string, data = {}) {
  return authRequest(`/api/v1/tenant/admin/site/${siteId}`, {
    method: 'post',
    data,
  });
}

/* 删除工作空间应用 */
export async function delSite(siteId: string) {
  return authRequest(`/api/v1/tenant/admin/site/${siteId}`, {
    method: 'delete',
  });
}

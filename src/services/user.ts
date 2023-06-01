import { authRequest, request } from '@/utils/request';

export async function login(data: any) {
  return request('/api/oauth/token', {
    method: 'POST',
    data,
  });
}
export function loginOut(id: number) {
  return authRequest(`/api/v1/user/admin/account/logout/${id}`, {
    method: 'GET',
  });
}

export function currentUser() {
  return authRequest('/api/current_user', {
    method: 'GET',
  });
}

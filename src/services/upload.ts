import { authRequest } from '@/utils/request';

export function upload(data: any = {}) {
  return authRequest('/api/v1/admin/assets', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  });
}

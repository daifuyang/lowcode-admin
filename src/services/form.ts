import { authRequest, request } from '@/utils/request';

export function getForms() {
  return authRequest('/api/v1/lowcode/admin/form');
}

export function addForm(data: any = {}) {
  return authRequest('/api/v1/lowcode/admin/form/', {
    method: 'POST',
    data,
  });
}

export function showForm(formId: string) {
  return request(`/api/v1/lowcode/app/form/${formId}`);
}

export function editForm(data: any = {}, id: string) {
  return authRequest(`/api/v1/lowcode/admin/form/${id}`, {
    method: 'POST',
    data,
  });
}

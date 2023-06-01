import { authRequest } from '@/utils/request';

export function getAdminMenus() {
  return authRequest('/api/v1/lowcode/admin/form');
}

export function addForm(data: any = {}) {
  return authRequest('/api/v1/lowcode/admin/form/', {
    method: 'POST',
    data,
  });
}

export function showForm(formId: string) {
  return authRequest(`/api/v1/lowcode/admin/form/${formId}`);
}

export function editForm(data: any = {}, id: string) {
  return authRequest(`/api/v1/lowcode/admin/form/${id}`, {
    method: 'POST',
    data,
  });
}

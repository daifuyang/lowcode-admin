import { authRequest, request } from '@/utils/request';

export function getAdminMenus() {
  return authRequest('/api/v1/lowcode/admin/menus');
}

export function addMenu(data: any = {}) {
  return authRequest('/api/v1/lowcode/admin/menus', {
    method: 'POST',
    data,
  });
}

export function showMenu(formId: string) {
  return request(`/api/v1/lowcode/app/menus/${formId}`);
}

export function editMenu(data: any = {}, id: string) {
  return authRequest(`/api/v1/lowcode/admin/menus/${id}`, {
    method: 'POST',
    data,
  });
}

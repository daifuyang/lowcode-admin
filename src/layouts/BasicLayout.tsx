import { getFormId, treeToList } from '@/utils/utils';
import { useEffect, useRef } from 'react';
import { useModel, history } from 'umi';
import SaveForm from './components/saveFrom';
import FormRender from '@/pages/admin/Form';
/*
 *@Author: frank
 *@Date: 2023-07-07 18:47:09
 *@Description: 用来处理自定义路由
 */

function BasicLayout(props: any) {
  const { initialState } = useModel('@@initialState');
  const { global, setGlobal } = useModel('useGlobalModel', (model) => ({
    global: model.global,
    setGlobal: model.setGlobal,
  }));

  const saveRef = useRef();

  useEffect(() => {
    if (global.openMenuModal) {
      saveRef.current?.open({ title: '添加菜单' });
    }
  }, [global.openMenuModal]);

  const menusArr = treeToList(initialState?.menus, 'routes');

  // 获取当前所访问的路由
  let { pathname } = location;
  const { siteId } = initialState?.site || {};
  const indexPath = `/${siteId}`;

  if (pathname && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const hasMenu = menusArr.length > 0;

  // 首页就重定向到第一个路由
  if (indexPath === pathname && hasMenu) {
    const currentRoute = menusArr[0];
    history.push(currentRoute.path);
  }

  // 进行路由对比，判断当前页面的类型
  const params = {};
  const currentMenu = menusArr.find((item: { path: string }) => {
    // 用path-to-regex匹配路由规则
    const pathToRegexp = require('path-to-regexp');
    const keys: any = [];
    const regex = pathToRegexp(item.path, keys);
    const match = regex.exec(pathname);
    if (match) {
      console.log(item.path, pathname);
      keys.forEach((key: any, index: number) => {
        params[key.name] = match[index + 1];
      });
    }
    return match;
  });

  console.log('currentMenu', menusArr, currentMenu, params);

  let formId = currentMenu?.formId;

  // 如果不存在则匹配/admin/form/:formId路由

  if (!formId) {
    formId = getFormId();
  }

  return (
    <>
      <SaveForm
        onCancel={() => {
          setGlobal((draft) => {
            draft.openMenuModal = false;
          });
        }}
        ref={saveRef}
      />
      <FormRender {...props} formId={formId} params={params} />
    </>
  );
}

export default BasicLayout;

// import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/user';
import { findTreeFirst, getLoginPath, getSiteId } from './utils/utils';
import { notification } from 'antd';

import * as antd from 'antd/es';
import { getAdminMenus } from './services/form';
import qs from 'qs';
import { upload } from './services/upload';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const isDev = process.env.NODE_ENV === 'development';

/* const siteId = getSiteId();

if (siteId) {
  loginPath = `/${siteId}/login`;
} */

// 如果不是登录页面，执行
// const patt = /\/\d+\/login*/g;
// const isLogin = patt.test(location.pathname) || loginPath == location.pathname;

const Icon = (props: any) => {
  let { icon } = props;
  if (!icon) icon = 'iconsetting';
  return (
    <span className="anticon">
      <i className={`iconfont ${icon}`} />
    </span>
  );
};

const loopMenuItem: any = (menus: MenuDataItem[] | { icon: any; children: any }[]) => {
  const siteId = getSiteId();
  return menus.map(({ icon = '', children, ...item }: any) => {
    item.path = item.path.replaceAll(':siteId', siteId);
    return {
      ...item,
      icon: <Icon icon={icon} />,
      children: children && loopMenuItem(children),
    };
  });
};

const recursion: any = (arr: []) => {
  const siteId = getSiteId();
  arr.forEach((item: any) => {
    item.path = `/${siteId}${item.path}`;
    if (item?.redirect) {
      item.redirect = `/${siteId}${item.redirect}`;
    }
    if (item.routes) {
      recursion(item.routes);
    }
  });
  return arr;
};

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  site: {
    siteInfo?: any;
    siteId?: string;
    mainPage?: string;
  };
  currentUser?: any;
  loading?: boolean;
  design?: boolean;
  loginPath?: string;
  fetchUserInfo?: () => Promise<any | undefined>;
}> {
  const fetchUserInfo = async () => {
    const siteId = getSiteId();
    try {
      const msg = await queryCurrentUser();
      if (msg.code != 1) {
        history.push(siteId ? `/${siteId}/login` : '/user/login');
        return;
      }
      return msg.data;
    } catch (error) {
      history.push(siteId ? `/${siteId}/login` : '/user/login');
    }
    return undefined;
  };

  const { query = {} } = history.location;
  let design = false;
  if (query.design !== undefined) {
    design = true;
  }

  const siteId = getSiteId();

  /*  if (!isLogin) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      site: {
        siteId,
      },
      design,
      loginPath,
    };
  } */
  return {
    fetchUserInfo,
    settings: defaultSettings,
    site: {
      siteId,
    },
    design,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: true,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    onMenuHeaderClick: () => {
      const siteId = getSiteId();
      let href = siteId ? `/${siteId}/` : '/';
      const { mainPage } = initialState?.site || {};
      if (mainPage) {
        href = mainPage;
      }
      history.push(`${href}${initialState?.design ? '?design' : ''}`);
    },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      /* if (!initialState?.currentUser && !isLogin) {
        history.push(loginPath);
      } */
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    menu: {
      locale: false,
      params: {
        userId: initialState?.currentUser?.id,
        siteId: initialState?.site?.siteId,
      },
      request: async (params: any = {}) => {
        // initialState.currentUser 中包含了所有用户信息

        /*
        {
              name: 'site',
              path: '/:siteId/admin/form',
            },
        */
        let menu = [
          {
            name: '工作台',
            path: '/workspace',
          },
        ];
        const { userId, siteId } = params;
        if (userId && siteId && location.pathname !== '/workspace') {
          const res: any = await getAdminMenus();
          if (res.code === 1) {
            menu = recursion(res.data);
            const mainPage: any = findTreeFirst(res.data);
            setInitialState((s: any) => ({ ...s, site: { ...s.site, mainPage: mainPage.path } }));
          }
        }
        return menu;
      },
    },
    menuItemRender: (itemProps) => {
      let path = itemProps?.redirect ? itemProps.redirect : itemProps.path;
      const { pathname } = location;
      if (pathname == path) {
        return itemProps.name;
      }

      const qParams = path.slice(1);
      const parsedParams = qs.parse(qParams);
      if (initialState?.design && parsedParams.design === undefined) path += '?design';

      return <Link to={path}>{itemProps.name}</Link>;
    },
    menuDataRender: (menuData: MenuDataItem[]) => {
      return loopMenuItem(menuData);
    },
    ...initialState?.settings,
  };
};

const authHeaderInterceptor = (url: string, options: RequestConfig) => {
  if (options.token) {
    const token: any = localStorage.getItem('token');
    if (token) {
      // token = JSON.parse(token);
      options.headers = {
        Authorization: `Bearer ${token}`,
      };
    } else {
      const loginPath = getLoginPath();
      history.push(loginPath);
    }
  }
  return {
    url,
    options,
  };
};

const siteInterceptor = (url: string, options: RequestConfig) => {
  let siteId: any = getSiteId();
  if (!siteId) {
    const { query = {} } = history.location;
    siteId = query.siteId;
  }
  if (siteId) {
    (options as any).params.siteId = siteId;
  }
  return {
    url,
    options,
  };
};

export const request: RequestConfig = {
  requestInterceptors: [authHeaderInterceptor, siteInterceptor],
  errorHandler(error) {
    const { response } = error;
    if (response && response.status) {
      const errorText = codeMessage[response.status] || response.statusText;
      const { status, url } = response;

      if (status == 401) {
        const loginPath = getLoginPath();
        history.push(loginPath);
      }

      notification.error({
        message: `请求错误 ${status}: ${url}`,
        description: errorText,
      });
    } else if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }

    return response;
  },
};

(window as any).message = antd.message;
(window as any).Modal = antd.Modal;
(window as any).notification = antd.notification;
(window as any).uploadApi = upload;

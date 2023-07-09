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
import { getAdminMenus } from './services/adminMenu';
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

const getRedirectPath = (routes = []) => {
  const siteId = getSiteId();
  for (let i = 0; i < routes.length; i++) {
    const item: any = routes[i];
    if (item?.routes?.length > 0) {
      getRedirectPath(item?.routes);
      break;
    } else {
      if (item.path) return `/${siteId}${item.path}`;
    }
  }
};

const recursion: any = (arr: []) => {
  const siteId = getSiteId();
  const menus = arr.map((item: any) => {
    item.redirect = '';
    const routes = recursion(item.routes);
    if (item.routes && item.routes?.length > 0) {
      const redirect = getRedirectPath(item.routes);
      if (redirect) {
        item.redirect = redirect;
      }
      return {
        ...item,
        routes: routes,
      };
    }
    return {
      ...item,
      path: `/${siteId}${item.path}`,
      routes,
    };
  });

  return menus;

  arr.forEach((item: any) => {
    item.path = `/${siteId}${item.path}`;
    // 处理成最后一集真实的路径
    const redirect = getRedirectPath(item.routes);
    if (redirect) {
      item.OLDiTEM = JSON.parse(JSON.stringify(item));
      item.redirect = redirect;
    }

    if (item.routes?.length > 0) {
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
  };
  currentUser?: any;
  loading?: boolean;
  design?: boolean;
  loginPath?: string;
  menus?: any;
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
  return {
    currentUser: {},
    fetchUserInfo,
    settings: defaultSettings,
    site: {
      siteId,
    },
    design,
    menus: [],
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
      /* const siteId = getSiteId();
      let href = siteId ? `/${siteId}/` : '/';
      const { mainPage } = initialState?.site || {};
      if (mainPage) {
        href = mainPage;
      }
      history.push(`${href}${initialState?.design ? '?design' : ''}`); */
    },
    // footerRender: () => <Footer />,
    onPageChange: async () => {
      const { pathname } = location;
      let isLoginPath = false;

      if (pathname === '/user/login') {
        isLoginPath = true;
      }

      if (!isLoginPath) {
        const newState: any = {};

        if (!newState.settings) {
          newState.settings = {};
        }

        if (!newState.site) {
          newState.site = {};
        }

        newState.settings.layout = 'top';
        newState.settings.navTheme = 'dark';

        newState.site.siteId = '';

        const { currentUser, fetchUserInfo } = initialState;

        // 如果不存在用于信息，则先同步用户信息
        if (!currentUser.id || currentUser.site_id) {
          const userRes = await fetchUserInfo();
          newState.currentUser = userRes;
        }

        const siteId = getSiteId();

        if (siteId) {
          // 如果用户信息没有站点信息或者用户信息站点信息不匹配，则重新更新用户信息
          if (!currentUser.site_id || currentUser.site_id !== siteId) {
            const userRes = await fetchUserInfo();
            newState.currentUser = userRes;
          }

          // 如果没有站点信息则需要更新站点信息
          newState.site.siteId = siteId;

          newState.settings.layout = 'mix';
          newState.settings.navTheme = 'light';
        }
        setInitialState((s) => ({
          ...s,
          ...newState,
        }));
      }
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
        let menus = [
          {
            name: '工作台',
            path: '/workspace',
          },
        ];
        const { userId, siteId } = params;
        if (userId && siteId && location.pathname !== '/workspace') {
          menus = [];
          const res: any = await getAdminMenus();
          if (res.code === 1) {
            menus = recursion(res.data);
            console.log('menus', menus);
            // const mainPage: any = findTreeFirst(res.data);
            setInitialState((s: any) => ({ ...s, menus }));
          }
        }
        return menus;
      },
    },
    menuItemRender: (itemProps) => {
      console.log('itemProps', itemProps);

      const hasIcon = itemProps?.pro_layout_parentKeys?.length === 0 ? itemProps.icon : null;
      let path = itemProps?.redirect ? itemProps.redirect : itemProps.path;
      const { pathname } = location;
      if (pathname == path) {
        return (
          <span className="ant-pro-menu-item">
            {hasIcon}
            <span className="ant-pro-menu-item-title">{itemProps.name}</span>
          </span>
        );
      }

      const qParams = path.slice(1);
      const parsedParams = qs.parse(qParams);
      if (initialState?.design && parsedParams.design === undefined) path += '?design';

      return (
        <Link to={path}>
          <span className="ant-pro-menu-item">
            {hasIcon}
            <span className="ant-pro-menu-item-title">{itemProps.name}</span>
          </span>
        </Link>
      );
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

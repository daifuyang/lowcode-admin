// import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/user';
import { getSiteId } from './utils/utils';
import { notification } from 'antd';

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
const loginPath = ['/user/login', '/admin/login'];

const Icon = (props: any) => {
  let { icon } = props;
  if (!icon) icon = 'iconsetting';
  return (
    <span className="anticon">
      <i className={`iconfont ${icon}`} />
    </span>
  );
};

const loopMenuItem: any = (
  menus: MenuDataItem[] | { icon: any; children: any }[],
  siteId: string,
) => {
  return menus.map(({ icon = '', children, ...item }: any) => {
    item.path = item.path.replaceAll(':siteId', siteId);
    return {
      ...item,
      icon: <Icon icon={icon} />,
      children: children && loopMenuItem(children, siteId),
    };
  });
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
  site?: any;
  currentUser?: any;
  loading?: boolean;
  design?: boolean;
  fetchUserInfo?: () => Promise<any | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath[0]);
    }
    return undefined;
  };

  const { query = {} } = history.location;
  let design = false;
  if (query.design !== undefined) {
    design = true;
  }

  // 如果不是登录页面，执行
  if (loginPath.indexOf(history.location.pathname) === -1) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
      design,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
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
      const siteId = initialState?.site?.siteId || '';
      let href = siteId ? `/${siteId}/` : '/';
      const { mainPage } = initialState?.site;
      if (mainPage) {
        href = mainPage;
      }
      history.push(`${href}${initialState?.design ? '?design' : ''}`);
    },
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      const loginIndex = loginPath.indexOf(location.pathname);
      if (!initialState?.currentUser && loginIndex === -1) {
        history.push(loginPath[0]);
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
      params: {
        userId: initialState?.currentUser?.id,
        siteId: initialState?.site?.siteId,
      },
      request: async (params: any = {}) => {
        // initialState.currentUser 中包含了所有用户信息
        const { userId, siteId } = params;
        let menu = [
          {
            name: 'workspace',
            path: '/workspace',
          },
        ];
        if (userId && siteId && history.location.pathname !== '/workspace') {
          menu = [
            {
              name: 'site',
              path: '/:siteId/admin/form',
            },
          ];
        }
        return menu;
      },
    },
    menuDataRender: (menuData: MenuDataItem[]) => {
      return loopMenuItem(menuData, initialState?.site?.siteId);
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
      history.push(loginPath);
    }
  }
  return {
    url,
    options,
  };
};

const siteInterceptor = (url: string, options: RequestConfig) => {
  const siteId = getSiteId();
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
        history.push('/user/login');
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

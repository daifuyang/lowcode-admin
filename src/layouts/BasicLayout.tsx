import Footer from '@/components/Footer';
import { addForm, getAdminMenus } from '@/services/form';
import {
  FileTextOutlined,
  FormOutlined,
  PlusCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import { ProLayout } from '@ant-design/pro-components';
import type { MenuProps } from 'antd';
import { Dropdown, Input, message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useModel } from 'umi';
import { useImmer } from 'use-immer';
import SaveForm from './components/saveFrom';
import { history } from 'umi';
import styles from './index.less';

function BasicLayout(props: any) {
  const { initialState, setInitialState } = useModel<any>('@@initialState');

  const [keyWord, setKeyWord] = useState('');

  const { children } = props;
  const { params = {} } = props.match;
  const { pathname = '' } = props.location;
  const { siteId = '' } = params;

  const saveRef = useRef<any>();

  const [state, setState] = useImmer({
    routes: [],
  });

  const recursion: any = (arr: []) => {
    arr.forEach((item: any) => {
      item.path = `/${siteId}${item.path}`;
      if (item?.redirect) item.redirect = `/${siteId}${item.redirect}`;
      if (item.routes) {
        recursion(item.routes);
      }
    });
    return arr;
  };

  const fetchData = async () => {
    const res: any = await getAdminMenus();
    if (res.code === 1) {
      const routes = recursion(res.data);
      setState((draft: any) => {
        draft.routes = routes;
      });
    }
  };

  const onFinish = async (values: any) => {
    const res: any = await addForm(values);
    if (res.code !== 1) {
      message.error(res.msg);
      return;
    }
    fetchData();
    // 跳转到编辑器编辑页面
    history.push(`/${siteId}/admin/form/${res.data.id}`);
    return true;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items: MenuProps['items'] = [
    {
      key: 'page',
      label: <div className={styles.menuItem}>新建自定义页面</div>,
      icon: <FileTextOutlined className={styles.icon} />,
    },
    {
      key: 'form',
      label: <div className={styles.menuItem}>新建普通表单</div>,
      icon: <FormOutlined className={styles.icon} />,
    },
  ];

  const onClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'page':
        saveRef.current.open();
        break;
    }
  };

  const fetchSite = async () => {
    if (siteId) {
      setInitialState({
        ...initialState,
        site: {
          siteId,
        },
      });
    }
  };

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  return (
    <>
      <SaveForm ref={saveRef} onFinish={onFinish} />
      <ProLayout
        className={styles.zeroLayout}
        headerRender={false}
        disableContentMargin={true}
        navTheme="light"
        location={{
          pathname,
        }}
        footerRender={() => <Footer />}
        fixSiderbar={false}
        route={{
          routes: state.routes,
        }}
        menuExtraRender={({ collapsed }) =>
          !collapsed && (
            <Space align="center">
              <Input
                style={{
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.03)',
                }}
                prefix={
                  <SearchOutlined
                    style={{
                      color: 'rgba(0, 0, 0, 0.15)',
                    }}
                  />
                }
                placeholder="搜索"
                bordered={false}
                onPressEnter={(e) => {
                  setKeyWord((e.target as HTMLInputElement).value);
                }}
              />
              <Dropdown menu={{ items, onClick }}>
                <PlusCircleFilled
                  style={{
                    color: 'var(--ant-primary-color)',
                    fontSize: 24,
                  }}
                />
              </Dropdown>
            </Space>
          )
        }
        menuHeaderRender={false}
        menuItemRender={(itemProps) => {
          const path = itemProps?.redirect ? itemProps.redirect : itemProps.path;
          return <Link to={path}>{itemProps.name}</Link>;
        }}
      >
        {children}
      </ProLayout>
    </>
  );
}

export default BasicLayout;

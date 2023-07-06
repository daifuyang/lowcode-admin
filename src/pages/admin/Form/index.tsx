import { addForm, showForm } from '@/services/form';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import type { RouteContextType } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { Button, message, Spin } from 'antd';
import get from 'lodash/get';
import * as assets from 'antd-materials/src/index';
import { useEffect, useRef, useState } from 'react';
import { createAxiosFetchHandler } from '@/utils/request';
import { history, useModel } from 'umi';
import SaveForm from '@/layouts/components/saveFrom';
import { openDesign } from '@/utils/utils';

const components: any = {};

const Form = (props: any) => {
  const { initialState } = useModel('@@initialState');

  const { params = {} } = props.match;
  const { siteId = '', id = '' } = params;

  const saveRef = useRef<any>();

  const { design } = initialState || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res: any = await showForm(id);
    if (res.code !== 0) {
      setLoading(false);
      setFormData(res.data);
    }
  };

  const onFinish = async (values: any) => {
    const res: any = await addForm(values);
    if (res.code !== 1) {
      message.error(res.msg);
      return;
    }
    // 跳转到编辑器编辑页面
    history.push(`/${siteId}/admin/form/${res.data.id}`);
    return true;
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
    if (!id && initialState?.currentUser && initialState?.site.mainPage) {
      history.push(initialState?.site.mainPage);
    }
    return () => {
      setFormData({ schema: '{}' });
    };
  }, [id, initialState?.site.mainPage]);

  const schema = formData?.schema;
  const schemaObj = JSON.parse(schema || '{}');
  const { componentsMap } = schemaObj;
  const pageSchema = schemaObj?.componentsTree?.[0];

  componentsMap?.forEach((item: any) => {
    const name = item.componentName;
    components[item.componentName] = get(assets, name);
  });

  // components['Button'] = (cProps: any) => {
  //   const { href, target } = cProps;
  //   let _href = href;

  //   if (target || target === '_self') {
  //     _href = undefined;
  //   }

  //   const onClick: any = (e) => {
  //     if (href && (!target || target === '_self')) {
  //       history.push(href);
  //     }
  //     if (cProps?.onClick) {
  //       cProps?.onClick(e);
  //     }
  //   };
  //   if (href) {
  //   }
  //   return <Button {...cProps} href={_href} onClick={onClick} />;
  // };

  const children = (
    <ReactRenderer
      schema={pageSchema}
      components={components}
      appHelper={{
        utils: {
          history,
          openDesign,
          query: props?.location?.query || {},
          params: props?.match?.params || {},
        },
        constants: {
          siteId,
          design,
          query: props?.location?.query || {},
          params: props?.match?.params || {},
        },
        requestHandlersMap: {
          fetch: createAxiosFetchHandler(siteId),
        },
      }}
    />
  );

  return (
    <Spin spinning={loading}>
      <RouteContext.Consumer>
        {(value: RouteContextType) => {
          if (pageSchema) {
            const { matchMenus } = value;
            if (!pageSchema.state) {
              pageSchema.state = {};
            }
            pageSchema.state.breadcrumb = matchMenus?.map((item) => ({
              name: item.name,
              key: item.key,
              path: item.key,
            }));
            pageSchema.state.name = formData?.name;
          }

          if (design) {
            const token = localStorage.getItem('token');

            // 用户的标题
            return (
              <PageContainer
                header={{
                  title: formData.name,
                }}
                extra={[
                  <Button
                    onClick={() => {
                      saveRef.current.open();
                    }}
                    key={'add'}
                  >
                    新建表单
                  </Button>,
                  <Button
                    onClick={() => {
                      openDesign(id);
                    }}
                    type="primary"
                    key="design"
                  >
                    页面设计
                  </Button>,
                ]}
              >
                <SaveForm ref={saveRef} onFinish={onFinish} />
                {children}
              </PageContainer>
            );
          }

          return children;
        }}
      </RouteContext.Consumer>
    </Spin>
  );
};
export default Form;

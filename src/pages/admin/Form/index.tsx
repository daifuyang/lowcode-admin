import { addForm, showForm } from '@/services/form';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import type { RouteContextType } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { Button, message, Skeleton, Spin } from 'antd';
import get from 'lodash/get';
import * as assets from 'antd-materials/src/index';
import { useEffect, useRef, useState } from 'react';
import { createAxiosFetchHandler } from '@/utils/request';
import { history, useModel } from 'umi';
import SaveForm from '@/layouts/components/saveFrom';
import NotFound from '@/pages/404';
import { openDesign } from '@/utils/utils';
import router from '@/utils/router';

const components: any = {};

const Form = (props: any) => {
  const { initialState } = useModel('@@initialState');

  const { global, setGlobal } = useModel('useGlobalModel', (model) => ({
    global: model.global,
    setGlobal: model.setGlobal,
  }));

  // 封装操作全局model的方法
  const model = {
    global,
    setGlobal,
  };

  const { formId, params } = props;

  router.init({
    query: props?.location?.query,
    params,
  });

  const { siteId } = initialState?.site || {};

  const saveRef = useRef<any>();

  const { design } = initialState || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res: any = await showForm(formId);
    if (res.code !== 0) {
      setLoading(false);
      setFormData(res.data);
    }
    setInit(false);
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
    if (formId) {
      fetchData();
    }
    return () => {
      setInit(true);
      setFormData({});
    };
  }, [formId]);

  const schema = formData?.schema || '{}';
  const schemaObj = JSON.parse(schema);
  const { componentsMap } = schemaObj;
  const pageSchema = schemaObj?.componentsTree?.[0];

  componentsMap?.forEach((item: any) => {
    const name = item.componentName;
    components[item.componentName] = get(assets, name);
  });

  const children = (
    <ReactRenderer
      schema={pageSchema}
      components={components}
      appHelper={{
        utils: {
          router,
          model,
          openDesign,
        },
        constants: {
          siteId,
          design,
        },
        requestHandlersMap: {
          fetch: createAxiosFetchHandler(siteId),
        },
      }}
    />
  );

  if (!init && (!formId || !formData.schema)) {
    return <NotFound />;
  }

  return (
    <Spin spinning={loading}>
      <RouteContext.Consumer>
        {(value: RouteContextType) => {
          if (pageSchema) {
            const { breadcrumb } = value;
            if (!pageSchema.state) {
              pageSchema.state = {};
            }
            pageSchema.state.breadcrumb = breadcrumb?.routes?.map((item) => ({
              name: item.breadcrumbName,
              key: item.path,
              path: item.path,
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
                      openDesign(formId);
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

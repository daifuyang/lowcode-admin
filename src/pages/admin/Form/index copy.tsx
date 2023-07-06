import { showForm } from '@/services/form';
import ReactRenderer from '@alilc/lowcode-react-renderer';
import type { RouteContextType } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { Button, Spin } from 'antd';
import get from 'lodash/get';
import * as assets from 'antd-materials/src/index';
import { useEffect, useState } from 'react';
import { createAxiosFetchHandler } from '@/utils/request';
import { history, useModel } from 'umi';

const components: any = {};

const Form = (props: any) => {
  console.log('props', props);

  const { initialState } = useModel('@@initialState');

  const { params = {} } = props.match;
  const { siteId = '', id = '' } = params;
  const { mainPage = false } = initialState?.site || {};

  if (!id && mainPage) {
    history.push(mainPage);
  }

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

  useEffect(() => {
    fetchData();
    return () => {
      console.log('unmount');
      setFormData({ schema: '{}' });
    };
  }, [id]);

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

  return (
    <Spin spinning={loading}>
      <RouteContext.Consumer>
        {(value: RouteContextType) => {
          if (pageSchema) {
            const { matchMenus } = value;
            if (!pageSchema.state) {
              pageSchema.state = {};
            }
            pageSchema.state.breadcrumb = matchMenus;
            pageSchema.state.name = formData?.name;
          }

          const children = (
            <ReactRenderer
              schema={pageSchema}
              components={components}
              appHelper={{
                utils: {
                  history,
                  query: props?.location?.query || {},
                  params: props?.match?.params || {},
                },
                constants: {
                  siteId,
                },
                requestHandlersMap: {
                  fetch: createAxiosFetchHandler(siteId),
                },
              }}
            />
          );

          console.log('children', children);

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
                      window.open(
                        `${
                          (window as any).config.editor
                        }/?scene=console&siteId=${siteId}&pageId=${id}${
                          token ? '&token=' + token : ''
                        }${(window as any).config.debug ? '&debug' : ''}`,
                      );
                    }}
                    type="primary"
                    key="design"
                  >
                    页面设计
                  </Button>,
                ]}
              >
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

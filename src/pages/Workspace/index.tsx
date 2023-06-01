import { addSite, delSite, editSite, getSites } from '@/services/workspace';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  message,
  Pagination,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
} from 'antd';
const { Paragraph } = Typography;

import { useEffect } from 'react';
import { useImmer } from 'use-immer';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './styles.less';

const { Meta } = Card;

import { history } from 'umi';
import SaveForm from './SaveForm';

const Worksace = () => {
  const [state, setState] = useImmer<any>({
    current: 1,
    pageSize: 10,
    total: 1,
    data: {},
    saveModal: {
      title: '新增应用',
      visible: false,
    },
  });

  const [form] = Form.useForm<any>();

  const fetchData = async () => {
    const res = await getSites();
    setState((draft: any) => {
      draft.current = res.data.current;
      draft.pageSize = res.data.pageSize;
      draft.total = res.data.total;
      draft.data = res.data;
    });
  };

  const saveData = async (params: any) => {
    params.status = params.status ? 1 : 0;
    let res: any;
    const { siteId } = params;
    if (siteId) {
      res = await editSite(siteId, params);
    } else {
      res = await addSite(params);
    }
    if (res.code !== 1) {
      message.error(res.msg);
      return false;
    }

    if (siteId) {
      const { index } = params;
      const newData = JSON.parse(JSON.stringify(state.data));
      newData.data[index] = { ...state.data.data[index], ...params, index };
      setState((draft: any) => {
        draft.saveModal.visible = true;
        draft.data = newData;
      });
    } else {
      fetchData();
    }

    return true;
  };

  const deleteApp = async (item: any) => {
    const res: any = await delSite(item.siteId);
    if (res.code !== 1) {
      message.error(res.msg);
      return;
    }

    const { index } = item;
    const newData = JSON.parse(JSON.stringify(state.data));
    delete newData.data[index];
    setState((draft: any) => {
      draft.data = newData;
    });

    message.success(res.msg);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-container">
      <SaveForm
        form={form}
        title={state.saveModal.modalTitle}
        onFinish={async (values: any) => {
          return await saveData(values);
        }}
        visible={state.saveModal.visible}
        onVisibleChange={(bool: boolean) => {
          setState((draft: any) => {
            draft.saveModal.visible = bool;
          });
        }}
      />

      <div className={styles.main}>
        <div className={styles.container}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} lg={6}>
              <div className={styles.card}>
                <Button
                  onClick={() => {
                    setState((draft: any) => {
                      draft.saveModal.title = '新增应用';
                      draft.saveModal.visible = true;
                    });
                  }}
                  type="dashed"
                  className={styles.newButton}
                >
                  <PlusOutlined /> 新增应用
                </Button>
              </div>
            </Col>
            {state.data?.data?.map((item: any, i: number) => {
              return (
                <Col xs={24} md={12} lg={6} key={item.siteId}>
                  <Card
                    onClick={() => {
                      history.push(`/${item.siteId}/admin/form`);
                    }}
                    className={styles.card}
                    hoverable
                    actions={[
                      <Tooltip key="setting" title="编辑">
                        <EditOutlined
                          onClick={(e) => {
                            setState((draft: any) => {
                              draft.saveModal.title = '编辑应用';
                              draft.saveModal.visible = true;
                            });
                            form.setFieldsValue({ ...item, index: i });
                            e.stopPropagation();
                          }}
                          key="edit"
                        />
                      </Tooltip>,

                      <Popconfirm
                        key="delete"
                        title="您确定删除改应用吗？"
                        onConfirm={async (e) => {
                          e?.stopPropagation();
                          deleteApp({ ...item, index: i });
                        }}
                        onCancel={(e) => {
                          e?.stopPropagation();
                        }}
                        okText="确定"
                        cancelText="取消"
                      >
                        <DeleteOutlined
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </Popconfirm>,
                    ]}
                  >
                    <Meta
                      avatar={
                        <Avatar
                          size={48}
                          src="https://gw.alipayobjects.com/zos/rmsportal/sfjbOqnsXXJgNCjCzDBL.png"
                        />
                      }
                      title={item.name}
                      description={
                        <>
                          <Paragraph ellipsis={true} copyable>
                            {item.siteId}
                          </Paragraph>
                          <div className={styles.item}>{item.desc}</div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
          <div className={styles.pagination}>
            <Pagination
              onChange={(page, pageSize) => {
                setState((draft: any) => {
                  draft.current = page;
                  draft.pageSize = pageSize;
                });
              }}
              current={state.current}
              pageSize={state.pageSize}
              total={state.total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Worksace;

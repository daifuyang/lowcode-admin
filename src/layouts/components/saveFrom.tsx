import { getAdminMenus } from '@/services/adminMenu';
import {
  ModalForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSwitch,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { forwardRef, useImperativeHandle, useState } from 'react';

const SaveForm = forwardRef((props: any, ref: any) => {
  const { onFinish, onCancel } = props;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新建菜单');

  useImperativeHandle(ref, () => ({
    open: (params: any = {}) => {
      const { title: modalTitle } = params;
      if (modalTitle) {
        setTitle(modalTitle);
      }
      setOpen(true);
    },
  }));

  const fetchData = async () => {
    const res: any = await getAdminMenus();
    let treeData: any = [
      {
        name: '作为顶级菜单',
        id: '',
      },
    ];
    if (res.code === 1) {
      treeData = [
        {
          name: '作为顶级菜单',
          id: '',
        },
        ...res.data,
      ];
    }
    return treeData;
  };

  return (
    <div ref={ref}>
      <ModalForm<any>
        width={520}
        title={title}
        visible={open}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setOpen(false);
            if (onCancel) {
              onCancel();
            }
          },
        }}
        onFinish={async (values) => {
          if (onFinish) {
            values.hideInMenu = values.hideInMenu ? 1 : 0;
            const finish = await onFinish(values);
            if (finish) {
              setOpen(false);
            }
            return finish;
          }
          return true;
        }}
      >
        <ProFormTreeSelect
          fieldProps={{
            fieldNames: { label: 'name', value: 'id', children: 'routes' },
          }}
          initialValue=""
          name="parentId"
          label="父级Id"
          request={fetchData}
        />
        <ProFormText
          name="name"
          label="菜单名称"
          placeholder="请输入菜单名称"
          rules={[{ required: true, message: '名称不能为空！' }]}
        />

        <ProFormRadio.Group
          name="menuType"
          initialValue={0}
          options={[
            {
              label: '表单',
              value: 0,
            },
            {
              label: '组件',
              value: 1,
            },
            {
              label: '按钮',
              value: 2,
            },
          ]}
        />

        {/* todo 自定义表单新建选择选择器 */}
        <ProFormDependency name={['menuType']}>
          {({ menuType }) => {
            const pathRender = () => {
              return (
                <ProFormText
                  key="path"
                  name="path"
                  label="路由地址"
                  placeholder="请输入菜单跳转路径"
                />
              );
            };

            const comRender = () => {
              return (
                <ProFormText
                  rules={[{ required: true, message: '组件路径不能为空！' }]}
                  key="component"
                  name="component"
                  label="组件路径"
                />
              );
            };

            const hideRender = () => {
              return (
                <ProFormSwitch
                  key="hideInMenu"
                  name="hideInMenu"
                  label="在菜单中隐藏"
                  placeholder="在菜单中隐藏"
                />
              );
            };

            if (menuType === 0) {
              return (
                <>
                  {pathRender()}
                  <ProFormTreeSelect
                    rules={[{ required: true, message: '表单不能为空！' }]}
                    key="formId"
                    name="formId"
                    label="关联表单"
                  />
                  {hideRender()}
                </>
              );
            } else if (menuType === 1) {
              return (
                <>
                  {pathRender()}
                  {comRender()}
                  {hideRender()}
                </>
              );
            }

            return;
          }}
        </ProFormDependency>
      </ModalForm>
    </div>
  );
});
export default SaveForm;

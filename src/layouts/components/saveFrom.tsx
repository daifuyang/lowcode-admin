import { getAdminMenus } from '@/services/form';
import {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { forwardRef, useImperativeHandle, useState } from 'react';

const SaveForm = forwardRef((props: any, ref: any) => {
  const { onFinish } = props;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新建表单');

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
        <ProFormSwitch name="hideInMenu" label="在菜单中隐藏" placeholder="在菜单中隐藏" />
      </ModalForm>
    </div>
  );
});
export default SaveForm;

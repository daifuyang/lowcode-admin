import {
  ModalForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

const SaveForm = (props: any) => {
  return (
    <ModalForm
      width={520}
      {...props}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {},
      }}
    >
      <ProFormText name="index" hidden />
      <ProFormText name="siteId" label="站点Id" hidden />

      <ProFormText
        name="name"
        label="站点名称"
        tooltip="最长为 32 位"
        placeholder="请输入站点名称"
        rules={[{ required: true, message: '站点名称不能为空' }]}
      />

      <ProFormTextArea name="desc" label="站点描述" placeholder="请输入站点描述" />

      {/*       <ProFormText
        name="domain"
        label="域名"
        tooltip="绑定访问的域名"
        placeholder="请输入绑定的域名"
      />

      <ProFormText
        name="dsn"
        label="数据源配置"
        tooltip="用于自定义配置数据库的连接字符串"
        placeholder="请输入数据源"
      /> */}

      <ProFormDigit
        label="排序"
        tooltip="越大越靠前"
        name="list_order"
        initialValue={10000}
        placeholder="排序"
      />

      <ProFormSwitch name="status" label="状态" initialValue={true} />
    </ModalForm>
  );
};

export default SaveForm;

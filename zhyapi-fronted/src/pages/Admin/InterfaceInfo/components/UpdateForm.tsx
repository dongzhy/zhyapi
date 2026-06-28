import { updateRule } from '@/services/ant-design-pro/api';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {Modal, message, Button} from 'antd';
import React, { cloneElement, useCallback, useState } from 'react';
import {PlusOutlined} from "@ant-design/icons";
import loading from "@/loading";
export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.RuleListItem>;
export type UpdateFormProps = {
  trigger?: React.ReactElement<any>;
  onOk?: () => void;
  values: Partial<API.RuleListItem>;
};
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { run } = useRequest(updateRule, {
    manual: true,
    onSuccess: () => {
      messageApi.success('Configuration is successful');
      onOk?.();
    },
    onError: () => {
      messageApi.error('Configuration failed, please try again!');
    },
  });
  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const onFinish = useCallback(
    async (values?: any) => {
      await run({
        data: values,
      });
      onCancel();
    },
    [onCancel, run],
  );
  return (
    <>
      {contextHolder}
      <ModalForm
        title={'新建规则'}
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            新建
          </Button>
        }
        width="400px"
        modalProps={{
          okButtonProps: {
            loading,
          },
        }}
        onFinish={async (value) => {
          await run({
            data: value as API.RuleListItem,
          });
          return true;
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '规则名称为必填项',
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>

    </>
  );
};
export default UpdateForm;

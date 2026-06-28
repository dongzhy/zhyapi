// src/pages/InterfaceInfo/components/CreateForm.tsx
import { ModalForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { message } from 'antd';
import React, { useEffect } from 'react';
import { addInterfaceInfoUsingPost, updateInterfaceInfoUsingPost } from '@/services/zhyapi_backed/interfaceInfoController';

// 定义表单提交的数据类型
interface CreateFormValues {
  id?: number; // 编辑时需要id
  name: string;
  desc: string;
  method: string;
  url: string;
  requestParams: any;
  requestHeader: string;
  responseHeader: string;
  status: 0 | 1;
}

// 严格匹配后端返回的完整格式
interface BackendResponse {
  code: number;
  data: null | any;
  message: string;
}

interface CreateFormProps {
  reload?: () => void;
  // 新增编辑相关属性
  isEdit?: boolean;
  visible?: boolean;
  onCancel?: () => void;
  initialValues?: CreateFormValues;
}

const CreateForm: React.FC<CreateFormProps> = ({
                                                 reload,
                                                 isEdit = false,
                                                 visible,
                                                 onCancel,
                                                 initialValues
                                               }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [formVisible, setFormVisible] = React.useState(false);

  // 监听外部传入的visible状态（用于编辑模式）
  useEffect(() => {
    if (isEdit) {
      setFormVisible(!!visible);
    }
  }, [visible, isEdit]);

  // 调用创建/更新接口
  const { run: submitRun, loading } = useRequest(
    async (params: CreateFormValues) => {
      let response;
      // 根据是否为编辑模式调用不同接口
      if (isEdit && params.id) {
        // 编辑模式：调用更新接口
        response = await updateInterfaceInfoUsingPost(params);
      } else {
        // 新建模式：调用创建接口
        response = await addInterfaceInfoUsingPost(params);
      }

      const res = response as unknown as BackendResponse;

      console.log('后端原始响应：', res);

      if (res.code !== 0) {
        throw new Error(res.message || (isEdit ? '更新接口信息失败' : '新建接口信息失败'));
      }

      return res;
    },
    {
      manual: true,
      onSuccess: () => {
        messageApi.success(isEdit ? '更新接口信息成功！' : '新建接口信息成功！');
        reload?.();
        // 编辑模式下手动关闭弹窗
        if (isEdit) {
          setFormVisible(false);
          onCancel?.();
        }
      },
      onError: (error: Error) => {
        console.error(`${isEdit ? '更新' : '创建'}失败详情：`, error);
        messageApi.error(error.message || `${isEdit ? '更新' : '新建'}接口信息失败，请重试！`);
      },
    },
  );

  // 处理表单提交
  const handleFinish = async (values: CreateFormValues) => {
    try {
      await submitRun(values);
      return true; // 成功则关闭弹窗
    } catch (err) {
      return false; // 失败则保留弹窗
    }
  };

  // 新建模式的触发器
  const trigger = isEdit ? null : (
    <button type="button" className="ant-btn ant-btn-primary">新建</button>
  );

  return (
    <>
      {contextHolder}
      <ModalForm<CreateFormValues>
        title={isEdit ? "编辑接口信息" : "新建接口信息"}
        trigger={trigger}
        open={isEdit ? formVisible : undefined} // 编辑模式手动控制显隐
        onOpenChange={(open) => {
          // 新建模式的关闭回调
          if (!open && !isEdit) {
            setFormVisible(false);
          }
        }}
        onCancel={() => {
          // 编辑模式的取消回调
          if (isEdit) {
            setFormVisible(false);
            onCancel?.();
          }
        }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
        formProps={{
          labelCol: { span: 6 },
          wrapperCol: { span: 16 },
          initialValues: initialValues || { status: 0 }, // 设置初始值
        }}
        onFinish={handleFinish}
        submitter={{
          searchConfig: false,
          resetButtonProps: { style: { display: 'none' } },
          submitButtonProps: { loading },
        }}
      >
        {/* 接口ID - 编辑时隐藏，仅用于提交 */}
        {isEdit && (
          <ProFormText
            name="id"
            label="ID"
            hidden
            initialValue={initialValues?.id}
          />
        )}

        {/* 接口名称 - 必填 */}
        <ProFormText
          name="name"
          label="接口名称"
          rules={[{ required: true, message: '请输入接口名称' }]}
          placeholder="请输入接口名称"
          initialValue={initialValues?.name}
        />

        {/* 接口描述 */}
        <ProFormTextArea
          name="desc"
          label="接口描述"
          placeholder="请输入接口描述"
          rows={3}
          initialValue={initialValues?.desc}
        />

        {/* 请求方法 - 下拉选择 */}
        <ProFormSelect
          name="method"
          label="请求方法"
          rules={[{ required: true, message: '请选择请求方法' }]}
          options={[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ]}
          placeholder="请选择请求方法"
          initialValue={initialValues?.method}
        />

        {/* 接口URL - 必填 */}
        <ProFormTextArea
          name="url"
          label="接口URL"
          rules={[{ required: true, message: '请输入接口URL' }]}
          placeholder="请输入接口完整URL"
          initialValue={initialValues?.url}
        />
        {/* 请求参数 */}
        <ProFormTextArea
          name="requestParams"
          label="请求参数"
          placeholder="请输入请求参数（JSON格式）"
          rows={3}
          initialValue={initialValues?.requestParams}
        />

        {/* 请求头 */}
        <ProFormTextArea
          name="requestHeader"
          label="请求头"
          placeholder="请输入请求头（JSON格式）"
          rows={3}
          initialValue={initialValues?.requestHeader}
        />

        {/* 响应头 */}
        <ProFormTextArea
          name="responseHeader"
          label="响应头"
          placeholder="请输入响应头（JSON格式）"
          rows={3}
          initialValue={initialValues?.responseHeader}
        />

        {/* 接口状态 */}
        <ProFormSelect
          name="status"
          label="接口状态"
          initialValue={initialValues?.status ?? 0}
          options={[
            { label: '关闭', value: 0 },
            { label: '开启', value: 1 },
          ]}
          placeholder="请选择接口状态"
        />
      </ModalForm>
    </>
  );
};

export default CreateForm;

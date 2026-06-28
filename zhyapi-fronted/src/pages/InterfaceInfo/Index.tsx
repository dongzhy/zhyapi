import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Form, Input, message, Spin } from "antd";
import { useParams } from 'umi'; // Umi 4 正确获取路由参数的钩子
import {
  getInterfaceInfoByIdUsingGet,
  testInterfaceInfoInvokeUsingPost
} from "@/services/zhyapi_backed/interfaceInfoController";

/**
 * 接口详情页
 * @constructor
 */
const InterfaceInfo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [interfaceData, setInterfaceData] = useState<API.InterfaceInfo | null>(null);
  // 新增调用相关状态
  const [invokeLoading, setInvokeLoading] = useState(false);
  const [invokeResult, setInvokeResult] = useState<string>('');
  const [form] = Form.useForm(); // 创建表单实例

  // 核心：获取路由中的 id 参数（匹配 /interface_info/:id）
  const { id } = useParams<{ id: string }>();

  // 表单提交处理函数
  const onFinish = async (values: any) => {
    // 校验ID是否存在
    if (!id) {
      message.error('接口ID不存在');
      return;
    }

    // 校验接口是否开启
    if (interfaceData?.status === 0) {
      message.warning('该接口当前处于关闭状态，无法调用');
      return;
    }

    setInvokeLoading(true);
    setInvokeResult(''); // 清空之前的结果
    try {
      // 调用测试接口
      const res = await testInterfaceInfoInvokeUsingPost({
        id: Number(id), // 确保ID是数字类型
        userRequestParams: values.userRequestParams || '',
      });

      console.log('接口调用结果：', res);

      // 处理返回结果
      if (res.code === 0) {
        message.success('接口调用成功');
        // 格式化展示结果
        setInvokeResult(JSON.stringify(res.data || res, null, 2));
      } else {
        message.error(`调用失败：${res.message || '未知错误'}`);
        setInvokeResult(JSON.stringify(res, null, 2));
      }
    } catch (error: any) {
      message.error(`调用异常：${error.message || '网络错误'}`);
      setInvokeResult(`调用异常：${error.message || '网络错误'}`);
    } finally {
      setInvokeLoading(false);
    }
  };

  // 定义状态映射关系，便于维护和扩展
  const statusMap = {
    0: '关闭',
    1: '打开'
  };

  // 格式化状态显示文本
  const formatStatus = (status?: number) => {
    if (status === undefined || status === null) return '无';
    return statusMap[status as 0 | 1] || '未知状态';
  };

  const loadData = async () => {
    if (!id) {
      message.warning("接口ID不存在！");
      return;
    }
    setLoading(true);
    try {
      // 重点：传入对象 { id: Number(id) }
      const res = await getInterfaceInfoByIdUsingGet({ id: Number(id) });
      console.log("接口详情数据：", res);
      setInterfaceData(res.data || null);

      if (res.data?.requestParams) {
        form.setFieldsValue({
          userRequestParams: res.data.requestParams
        });
      }
    } catch (error: any) {
      message.error(`获取接口详情失败：${error.message || "未知错误"}`);
      setInterfaceData(null);
    } finally {
      setLoading(false);
    }
  };

  // 监听ID变化（比如从不同接口跳转过来），重新加载数据
  useEffect(() => {
    loadData();
  }, [id]);

  // 加载中展示骨架屏
  if (loading) {
    return (
      <PageContainer title="接口详情">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <Spin size="large" tip="正在加载接口详情..." />
        </div>
      </PageContainer>
    );
  }

  // 无数据时展示提示
  if (!interfaceData) {
    return (
      <PageContainer title="接口详情">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ color: '#999' }}>暂无接口数据</p>
        </div>
      </PageContainer>
    );
  }

  // 渲染接口详情
  return (
    <PageContainer title={`接口详情 - ${interfaceData.name || '未命名接口'}`}>
      {/* 接口基本信息卡片 */}
      <Card style={{ margin: 20 }}>
        <Descriptions column={1} bordered>
          {/* 使用格式化函数转换状态值 */}
          <Descriptions.Item label="状态">{formatStatus(interfaceData.status)}</Descriptions.Item>
          <Descriptions.Item label="ID">{interfaceData.id}</Descriptions.Item>
          <Descriptions.Item label="名称">{interfaceData.name || '无'}</Descriptions.Item>
          <Descriptions.Item label="描述">{interfaceData.description || '无'}</Descriptions.Item>
          <Descriptions.Item label="参数">{interfaceData.requestParams || '无'}</Descriptions.Item>
          <Descriptions.Item label="请求方法">{interfaceData.method || '无'}</Descriptions.Item>
          <Descriptions.Item label="请求路径">{interfaceData.url || '无'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{interfaceData.createTime || '无'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{interfaceData.updateTime || '无'}</Descriptions.Item>
          <Descriptions.Item label="请求头">{interfaceData.requestHeader || '无'}</Descriptions.Item>
          <Descriptions.Item label="响应头">{interfaceData.responseHeader || '无'}</Descriptions.Item>
          {/* 可根据后端返回的字段添加更多项 */}
        </Descriptions>
      </Card>

      {/* 接口调用表单卡片 */}
      <Card style={{ margin: 20 }}>
        <Form
          form={form} // 绑定表单实例
          name="invoke"
          layout="vertical"
          onFinish={onFinish} // 修正拼写错误 onFinsh -> onFinish
        >
          <Form.Item
            label="请求参数"
            name="userRequestParams"
            tooltip="请输入JSON格式的请求参数"
          >
            <Input.TextArea
              rows={6}
              placeholder="请输入请求参数（JSON格式)"
            disabled={interfaceData.status === 0} // 接口关闭时禁用
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={invokeLoading}
              disabled={interfaceData.status === 0} // 接口关闭时禁用按钮
            >
              {interfaceData.status === 0 ? '接口已关闭' : '调用'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 调用结果展示卡片 */}
      <Card
        style={{ margin: 20 }}
        title="调用结果"
        bordered={true}
      >
        {invokeLoading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin tip="正在调用接口..." />
          </div>
        ) : invokeResult ? (
          <pre style={{
            margin: 0,
            padding: 10,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            overflow: 'auto',
            maxHeight: 400
          }}>
            {invokeResult}
          </pre>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 20,
            color: '#999'
          }}>
            点击上方"调用"按钮开始测试接口
          </div>
        )}
      </Card>

    </PageContainer>
  );
};

export default InterfaceInfo;

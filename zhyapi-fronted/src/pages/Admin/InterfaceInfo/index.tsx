// src/pages/InterfaceInfo/index.tsx
import { rule } from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import {
  offlineInterfaceInfoUsingPost,
  onlineInterfaceInfoUsingPost,
  deleteInterfaceInfoUsingPost, listInterfaceInfoByPageUsingPost
} from "@/services/zhyapi_backed/interfaceInfoController";
import type { SortOrder } from "antd/lib/table/interface";



const TableList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.InterfaceInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.InterfaceInfo[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  // 新增编辑相关状态
  const [editVisible, setEditVisible] = useState<boolean>(false);
  const [editRecord, setEditRecord] = useState<API.InterfaceInfo | null>(null);

  /**
   * 打开编辑弹窗并设置回显数据
   */
  const handleEdit = (record: API.InterfaceInfo) => {
    setEditRecord(record);
    setEditVisible(true);
  };

  /**
   * 单行删除接口
   * @param record
   */
  const handleSingleRemove = async (record: API.InterfaceInfo) => {
    const hide = message.loading("正在删除");
    if (!record) return;
    try {
      await deleteInterfaceInfoUsingPost({ id: record.id });
      hide();
      message.success('删除成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error(`删除失败：${error.message}`);
      return false;
    }
  };

  /**
   * 发布接口
   * @param record
   */
  const handleOnline = async (record: API.InterfaceInfo) => {
    const hide = message.loading("发布中");
    if (!record) return;
    try {
      await onlineInterfaceInfoUsingPost({ id: record.id });
      hide();
      message.success('发布成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error(`发布失败：${error.message}`);
      return false;
    }
  };

  /**
   * 下线接口
   * @param record
   */
  const handleOffline = async (record: API.InterfaceInfo) => {
    const hide = message.loading("下线中");
    if (!record) return;
    try {
      await offlineInterfaceInfoUsingPost({ id: record.id });
      hide();
      message.success('下线成功');
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error(`下线失败：${error.message}`);
      return false;
    }
  };

  // ========== 批量删除逻辑 ==========
  const { run: delRun, loading } = useRequest(deleteInterfaceInfoUsingPost, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reload();
      messageApi.success('删除成功，即将刷新');
    },
    onError: (error) => {
      console.error('删除失败：', error);
      messageApi.error('删除失败，请重试');
    },
  });

  // 批量删除函数 - 优化错误处理
  const handleBatchRemove = useCallback(
    async (selectedRows: API.InterfaceInfo[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('请选择删除项');
        return;
      }

      // 显示批量删除加载中
      const hideLoading = message.loading('批量删除中...');
      let successCount = 0;
      let failCount = 0;

      try {
        // 遍历删除选中的行
        for (const row of selectedRows) {
          try {
            await delRun({ id: row.id });
            successCount++;
          } catch (error) {
            failCount++;
            console.error(`删除ID为${row.id}的接口失败:`, error);
          }
        }

        // 提示删除结果
        let msg = '';
        if (successCount > 0 && failCount === 0) {
          msg = `全部删除成功！共删除${successCount}条数据`;
          messageApi.success(msg);
        } else if (successCount > 0 && failCount > 0) {
          msg = `部分删除成功：成功${successCount}条，失败${failCount}条`;
          messageApi.warning(msg);
        } else {
          msg = `删除失败：共${failCount}条数据删除失败`;
          messageApi.error(msg);
        }

        // 刷新表格并清空选中状态
        setSelectedRows([]);
        actionRef.current?.reload();
      } catch (error) {
        messageApi.error('批量删除过程中出现异常');
      } finally {
        hideLoading();
      }
    },
    [delRun, messageApi],
  );

  // 表格列定义 - 确保没有任何<a>标签
  const columns: ProColumns<API.InterfaceInfo>[] = [
    {
      title: 'id',
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: '接口名称',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: '请求参数',
      dataIndex: 'requestParams',
      valueType: 'jsonCode',
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      valueType: 'jsonCode',
    },
    {
      title: 'url',
      dataIndex: 'url',
      valueType: 'text',
    },
    {
      title: '请求头',
      dataIndex: 'requestHeader',
      valueType: 'text',
    },
    {
      title: '响应头',
      dataIndex: 'responseHeader',
      valueType: 'textarea',
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: '关闭',
          status: 'Default',
        },
        1: {
          text: '开启',
          status: 'Processing',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      // 完全使用Button组件，无任何<a>标签
      render: (_: any, record: API.InterfaceInfo) => {
        // 定义操作按钮数组，避免空值渲染
        const buttons = [];

        // 修改按钮 - 调用编辑方法
        buttons.push(
          <Button
            key="edit"
            type="text"
            size="small"
            onClick={() => handleEdit(record)} // 点击打开编辑弹窗
          >
            修改
          </Button>
        );

        // 发布按钮（仅状态为0时显示）
        if (record.status === 0) {
          buttons.push(
            <Button
              key="online"
              type="text"
              size="small"
              // 绑定点击事件，确保只执行发布逻辑
              onClick={(e) => {
                // 阻止所有默认行为和事件冒泡，彻底杜绝跳转
                e.preventDefault();
                e.stopPropagation();
                handleOnline(record);
              }}
            >
              发布
            </Button>
          );
        }

        // 下线按钮（仅状态为1时显示）
        if (record.status === 1) {
          buttons.push(
            <Button
              key="offline"
              type="text"
              danger
              size="small"
              onClick={() => handleOffline(record)}
            >
              下线
            </Button>
          );
        }

        // 删除按钮
        buttons.push(
          <Button
            key="delete"
            type="text"
            danger
            size="small"
            onClick={() => handleSingleRemove(record)}
          >
            删除
          </Button>
        );

        return buttons;
      },
    },
  ];

  // @ts-ignore
  // @ts-ignore
  return (
    <PageContainer>
      {contextHolder}
      <ProTable<API.InterfaceInfo, API.PageParams>
        headerTitle={'接口信息管理'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        request={async (
          params: API.PageParams & { keyword?: string },
          sort: Record<string, SortOrder>,
          filter: Record<string, (string | number)[] | null>
        ) => {
          const queryParams = {
            current: params.current,
            pageSize: params.pageSize,
            keyword: params.keyword,
            ...filter,
          };

          const res = await listInterfaceInfoByPageUsingPost({ data: queryParams });

          if (res?.data) {
            return {
              data: res.data.records || [],
              success: true,
              total: res.data.total || 0,
            };
          }

          return {
            data: [],
            success: false,
            total: 0,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}></ProTable>

      {/* 编辑表单弹窗 - 复用CreateForm组件 */}
      <CreateForm
        key="edit"
        isEdit={true}
        visible={editVisible}
        onCancel={() => setEditVisible(false)}
        reload={actionRef.current?.reload}
        initialValues={editRecord}
      />

      {/* 批量操作工具栏 */}
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <span style={{ fontWeight: 600 }}>
                {selectedRowsState.length}
              </span>{' '}
              项
            </div>
          }
        >
          <Button
            danger
            loading={loading}
            onClick={() => {
              handleBatchRemove(selectedRowsState);
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}

      {/* 详情抽屉 */}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.InterfaceInfo>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.InterfaceInfo>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;

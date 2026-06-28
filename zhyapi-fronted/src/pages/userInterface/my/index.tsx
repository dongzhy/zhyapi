import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { UserInterfaceInfo, UserInterfaceInfoQueryRequest } from '@/services/zhyapi_backed/typings.d.ts';
import {listMyUserInterfaceInfoUsingPost} from "@/services/zhyapi_backed/userInterfaceInfoController";


export default function MyUserInterfacePage() {
  const tableRequest = async (params: UserInterfaceInfoQueryRequest) => {
    const res = await listMyUserInterfaceInfoUsingPost(params);
    return {
      data: res.data?.records || [],
      total: res.data?.total || 0,
      success: true,
    };
  };

  const columns = [
    { title: '记录ID', dataIndex: 'id', width: 80, hideInSearch: true },
    { title: '接口ID', dataIndex: 'interfaceInfoId', width: 120, valueType: 'digit' },
    { title: '总调用次数', dataIndex: 'totalNum', width: 120, hideInSearch: true },
    { title: '剩余可调用次数', dataIndex: 'leftNum', width: 140, hideInSearch: true },
    {
      title: '接口状态',
      dataIndex: 'status',
      valueEnum: { 0: { text: '正常可用', status: 'Success' }, 1: { text: '已禁用', status: 'Error' } },
    },
    { title: '开通时间', dataIndex: 'createTime', width: 180, hideInSearch: true },
  ];

  return (
    <PageContainer title="我的接口调用额度">
      <ProTable<UserInterfaceInfo, UserInterfaceInfoQueryRequest>
        rowKey="id"
        request={tableRequest}
        columns={columns}
        pagination={{ pageSize: 10 }}
        search={false}
        toolBarRender={false}
      />
    </PageContainer>
  );
}

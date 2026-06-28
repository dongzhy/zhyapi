import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import { List, message, Popconfirm } from "antd";
import {
  deleteInterfaceInfoUsingPost, listInterfaceInfoByPageUsingPost,
} from "@/services/zhyapi_backed/interfaceInfoController";
import { Link } from '@umijs/max';

/**
 * 接口信息列表主页
 * @constructor
 */
const Index: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 加载列表数据：修复参数类型不匹配问题、安全取值
  const loadData = async (current = 1, size = 10) => {
    setLoading(true);
    try {
      // 入参转为字符串，兼容后端分页接收字符串数字
      const res = await listInterfaceInfoByPageUsingPost({
        current: String(current),
        pageSize: String(size)
      });
      console.log("接口完整返回数据：", res);

      // 多层安全判空，防止取值报错
      const pageData = res?.data ?? {};
      const records = pageData.records ?? [];
      // total转为数字，适配分页组件
      const totalCount = Number(pageData.total) || 0;

      setList(records);
      setTotal(totalCount);
      console.log("即将渲染的列表数据：", records);
    } catch (error: any) {
      message.error(`请求列表失败：${error?.message || "未知网络错误"}`);
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 删除接口
  const handleDelete = async (id: number) => {
    try {
      await deleteInterfaceInfoUsingPost({ id });
      message.success("删除接口成功");
      // 删除后刷新当前页
      loadData(currentPage, pageSize);
    } catch (error: any) {
      message.error(`删除失败：${error?.message || "操作异常"}`);
    }
  };

  // 页面初始化/分页切换触发数据加载
  useEffect(() => {
    loadData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return (
    <PageContainer title="接口开发平台">
      <List
        className="my-list"
        loading={loading}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item) => {
          // 单条记录空值兜底，避免渲染崩溃
          if (!item) return null;
          return (
            <List.Item
              key={item.id ?? Math.random()}
              actions={[
                <Link
                  key="view"
                  to={`/interface_info/${item.id}`}
                  style={{ color: '#1890ff', textDecoration: 'none' }}
                >
                  查看详情
                </Link>,
                <Popconfirm
                  key="delete"
                  title="确定删除该接口？删除后无法恢复"
                  onConfirm={() => handleDelete(item.id)}
                  okText="确认删除"
                  cancelText="取消"
                >
                  <a style={{ color: "#ff4d4f" }}>删除</a>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={
                  <Link to={`/interface_info/${item.id}`} style={{ textDecoration: 'none' }}>
                    {item.name ?? "未命名接口"}
                  </Link>
                }
                description={item.description ?? "暂无接口描述"}
              />
            </List.Item>
          );
        }}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (totalNum) => `共 ${totalNum} 条接口记录`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          pageSizeOptions: ["10", "20", "50"]
        }}
      />
    </PageContainer>
  );
};

export default Index;

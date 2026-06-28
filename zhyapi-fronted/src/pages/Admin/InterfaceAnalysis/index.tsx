
import { FooterToolbar, PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Button, Drawer, message } from 'antd';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { listTopInvokeInterfaceInfoUsingGet } from "@/services/zhyapi_backed/analysisController";
import ReactEcharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

/**
 * 接口分析
 * @constructor
 */
const InterfaceAnalysis: React.FC = () => {
  const [data, setData] = useState<API.InterfaceInfoVO[]>([]);
  const [loading, setLoading] = useState(true);

  // 数据请求逻辑
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await listTopInvokeInterfaceInfoUsingGet();
        if (res?.data) {
          setData(res.data);
        }
      } catch (e: any) {
        message.error(`数据请求失败：${e.message || '未知错误'}`);
        console.error('接口请求异常：', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 图表数据格式化（兜底处理）
  const charData = data.map(item => ({
    value: item.totalNum || 0,
    name: item.name || '未知接口',
  }));

  // ECharts 配置项
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: '接口调用次数',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        data: charData,
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
      },
    ],
  };

  return (
    <PageContainer>
      {/* ReactEcharts 图表渲染（已修复导入问题） */}
      <ReactEcharts
        option={option}
        style={{ height: '500px' }}
      />
    </PageContainer>
  );
};

export default InterfaceAnalysis;

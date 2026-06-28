import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Space, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { applyUserKeyUsingPost, getMyKeyUsingGet, resetUserKeyUsingPost } from '@/services/zhyapi_backed/userController';
import type { UserVO } from '@/services/zhyapi_backed/typings';

export default function ApiKeyPage() {
  const [userKey, setUserKey] = useState<UserVO | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载密钥信息
  const loadKeyInfo = async () => {
    setLoading(true);
    try {
      const res = await getMyKeyUsingGet();
      setUserKey(res.data);
    } catch (err: any) {
      setUserKey(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeyInfo();
  }, []);

  // 申请密钥
  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await applyUserKeyUsingPost();
      setUserKey(res.data);
      message.success('密钥申请成功，请妥善保存SecretKey！');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 重置密钥
  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetUserKeyUsingPost();
      setUserKey(res.data);
      message.success('密钥已重置，旧密钥立即失效！');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 复制文本
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('复制成功');
  };

  return (
    <PageContainer title="API调用密钥管理">
      <Card loading={loading} title="我的访问凭证 AK / SK">
        {!userKey ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>你还未生成API调用密钥，申请后即可使用SDK调用接口</p>
            <Button type="primary" onClick={handleApply}>
              申请AK密钥
            </Button>
          </div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <p style={{ fontWeight: 'bold' }}>AccessKey（AK）</p>
              <Space>
                <code>{userKey.accessKey}</code>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyText(userKey.accessKey)}
                >
                  复制
                </Button>
              </Space>
            </div>
            <Space>
              <Button danger icon={<ReloadOutlined />} onClick={handleReset}>
                重置密钥
              </Button>
              <span style={{ color: '#f5222d' }}>
                重置后旧密钥永久失效，请及时更新项目SDK配置
              </span>
            </Space>
          </Space>
        )}
      </Card>
      <Card style={{ marginTop: 20 }} title="使用说明">
        <ol>
          <li>调用平台接口时，请求头必须携带 accessKey、sign、timestamp、nonce、body</li>
          <li>SecretKey 用于本地生成签名，不要放在前端公网代码中</li>
          <li>密钥泄露请立即点击重置，防止他人盗用你的接口额度</li>
        </ol>
      </Card>
    </PageContainer>
  );
}

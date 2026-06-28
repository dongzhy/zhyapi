import { Footer } from '@/components';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, useModel, history } from '@umijs/max'; // ❶ 导入 history 用于跳转
import { Alert, App, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
import { getLoginUserUsingGet, userLoginUsingPost } from "@/services/zhyapi_backed/userController";

// 定义 InitialState 类型（如果项目中未定义）
interface InitialState {
  loginUser?: API.LoginUserVO;
  settings?: typeof Settings;
}

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();
  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();
  return null; // ❶ 修复空返回，避免警告
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  // ❶ 获取 initialState 和 refresh 方法（Umi 内置的刷新初始状态方法）
  const { initialState, setInitialState, refresh: refreshInitialState } = useModel<InitialState>('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();

  // ❷ 修复：正确的获取用户信息方法（调用后端接口）
  const fetchUserInfo = async () => {
    try {
      const res = await getLoginUserUsingGet();
      if (res.code === 0 && res.data) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败：', error);
      return null;
    }
  };

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 清空之前的错误状态
      setUserLoginState({});

      // 调用登录接口
      const res = await userLoginUsingPost({ ...values });

      // ❶ 正确判定登录成功：code === 0 且 data 存在
      if (res.code === 0) {
        if (res.data) {
          message.success('登录成功！');

          // ❷ 刷新用户信息并更新全局状态
          const userInfo = await fetchUserInfo();
          if (userInfo) {
            flushSync(() => {
              // @ts-ignore
              setInitialState((s) => ({
                ...s,
                currentUser: userInfo, // ❸ 赋值给正确的 loginUser 字段
              }));
            });
          }

          // ❹ 优先使用 React 路由跳转，而非页面刷新
          const urlParams = new URL(window.location.href).searchParams;
          const redirectPath = urlParams.get('redirect') || '/';
          console.log('最终跳转路径：', redirectPath); // 验证路径是否为 /welcome
          history.push(redirectPath); // ❺ 替换 window.location.href，保留状态
          return;
        }
      }

      // ❻ 登录失败（后端返回错误）
      const errorMsg = res.message || '登录失败，请检查账号密码！';
      setUserLoginState({ status: 'error', type });
      message.error(errorMsg);

    } catch (error) {
      // ❼ 捕获网络/接口异常
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.error('登录接口报错：', error);
      setUserLoginState({ status: 'error', type });
      message.error(defaultLoginFailureMessage);
    }
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'登录'}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Api 接口开发平台"
          subTitle={'适用于内网中管理各项接口'}
          initialValues={{ autoLogin: true }}
          actions={[]}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              { key: 'account', label: '账户密码登录' },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码'} />
          )}

          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                placeholder={'请输入用户名'}
                rules={[{ required: true, message: '用户名是必填项！' }]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder={'请输入密码'}
                rules={[{ required: true, message: '密码是必填项！' }]}
              />
            </>
          )}

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}

          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{ size: 'large', prefix: <MobileOutlined /> }}
                name="mobile"
                placeholder={'请输入手机号！'}
                rules={[
                  { required: true, message: '手机号是必填项！' },
                  { pattern: /^1\d{10}$/, message: '不合法的手机号！' },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                captchaProps={{ size: 'large' }}
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} 秒后重新获取`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[{ required: true, message: '验证码是必填项！' }]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({ phone });
                  if (result) {
                    message.success('获取验证码成功！验证码为：1234');
                  }
                }}
              />
            </>
          )}

          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a style={{ float: 'right' }}>忘记密码 ?</a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;

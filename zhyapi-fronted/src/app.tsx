import { Footer } from '@/components';
import { AvatarDropdown, AvatarName, Footer, Question } from '@/components';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import  { requestConfig }  from './requestConfig';
import {getLoginUserUsingGet} from "@/services/zhyapi_backed/userController";
const isDev = process.env.NODE_ENV === 'development';

const loginPath = '/user/login';
const loginWhiteList = [loginPath, '/404', '/500', '/welcome'];

export async function getInitialState(): Promise<{
  currentUser?: API.LoginUserVO;
  settings?: typeof defaultSettings;
}> {
  const state = {
    currentUser: undefined,
    settings: defaultSettings,
  };
  try {
    const res = await getLoginUserUsingGet();
    if (res.code === 0 && res.data) {
      state.currentUser = res.data;
    }
  } catch (error) {
    const currentPath = history.location.pathname;
    if (!loginWhiteList.includes(currentPath)) {
      history.push(loginPath);
    }
  }
  return state;
}

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  let loginCheckTimer: NodeJS.Timeout;
  return {
    layout: 'top',
    actionsRender: () => [<Question key="doc" />],
    avatarProps: {
      src: initialState?.currentUser?.userAvatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    // 水印使用后端正确字段 userName
    waterMarkProps: {
      content: initialState?.currentUser?.userName || '游客',
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (loginWhiteList.includes(location.pathname)) return;
      clearTimeout(loginCheckTimer);
      loginCheckTimer = setTimeout(() => {
        if (!initialState?.currentUser) {
          history.push(loginPath);
        }
      }, 500);
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>OpenAPI 文档</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((pre) => ({ ...pre, settings }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const request = requestConfig;

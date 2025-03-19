import { Button, Form, message, Modal, Tabs } from 'antd';
import { LockOutlined, MailOutlined, QqCircleFilled, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet } from '@@/exports';
import Settings from '../../../config/defaultSettings';
import Footer from '@/components/Footer';
import { useModel } from '@umijs/max';
import { useState, useRef } from 'react';
import { Captcha } from 'aj-captcha-react';
import { BACKEND_HOST_CODE } from '@/constants';
import styles from '@/pages/User/Register/index.less';
import {
  userLoginUsingPost,
  userEmailLoginUsingPost,
  userEmailSendUsingPost,
  userEmailRegisterUsingPost,
} from '@/services/backend/userController';

interface UserLoginRequest {
  userAccount?: string;
  userPassword?: string;
  userEmail?: string;
}

interface EmailLoginRequest {
  email: string;
  userPassword: string;
}

interface AccountLoginRequest {
  userAccount: string;
  userPassword: string;
}

interface EmailRegisterRequest {
  userAccount: string;
  userPassword: string;
  checkPassword: string;
  email: string;
  code: string;
  captchaVerification: string;
}

interface LoginRegisterProps {
  isModalOpen: boolean;
  onCancel: () => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ isModalOpen, onCancel }) => {
  const [type, setType] = useState<string>('login');
  const [form] = Form.useForm();
  const [valueData, setValueData] = useState<API.UserRegisterRequest>();
  const ref = useRef();
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState('');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [registerValues, setRegisterValues] = useState<any>(null);

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const click = () => {
    const current = ref.current as any;
    current.verify();
  };

  const handleSendCode = async () => {
    if (!email) {
      message.error('请输入邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('请输入正确的邮箱地址');
      return;
    }
    try {
      const res = await userEmailSendUsingPost({
        email: email,
      });
      if (res.code === 0) {
        message.success('验证码已发送到邮箱');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      message.error(`发送验证码失败：${error.message}`);
    }
  };

  const handleSubmit = async (values: UserLoginRequest) => {
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.userAccount || '');
      let res;
      if (isEmail) {
        const emailLoginData: EmailLoginRequest = {
          email: values.userAccount || '',
          userPassword: values.userPassword || '',
        };
        res = await userEmailLoginUsingPost(emailLoginData);
      } else {
        const accountLoginData: AccountLoginRequest = {
          userAccount: values.userAccount || '',
          userPassword: values.userPassword || '',
        };
        res = await userLoginUsingPost(accountLoginData);
      }

      if (res.code === 0) {
        const defaultLoginSuccessMessage = '登录成功！';
        const result = res.data as any;
        localStorage.setItem('tokenName', result.saTokenInfo?.tokenName as string);
        localStorage.setItem('tokenValue', result.saTokenInfo?.tokenValue as string);
        message.success(defaultLoginSuccessMessage);
        setInitialState({
          ...initialState,
          currentUser: res.data,
        });
        onCancel();
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = `登录失败，${error.message}`;
      message.error(defaultLoginFailureMessage);
    }
  };

  const handleRegisterSubmit = async (values: EmailRegisterRequest) => {
    if (values.userPassword !== values.checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      const data = await userEmailRegisterUsingPost(values);
      if (data.code === 0) {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        setType('login');
        setShowCaptcha(false);
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  const validateAndShowCaptcha = async (values: any) => {
    if (values.userPassword !== values.checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setRegisterValues(values);
    setShowCaptcha(true);
    setTimeout(() => {
      const current = ref.current as any;
      if (current) {
        current.verify();
      }
    }, 100);
  };

  return (
    <Modal footer={null} open={isModalOpen} onCancel={onCancel}>
      <div className={containerClassName}>
        <Helmet>
          <title>{'登录'}- {Settings.title}</title>
        </Helmet>
        <div style={{ flex: '1', padding: '32px 0' }}>
          <LoginForm
            form={form}
            contentStyle={{
              minWidth: 280,
              maxWidth: '75vw',
            }}
            logo={<img alt="logo" style={{ height: '100%' }}
                      src="https://pic.rmb.bdstatic.com/bjh/news/c0afb3b38710698974ac970434e8eb71.png" />}
            title="摸鱼岛🎣"
            subTitle={'加入摸鱼岛一起来摸吧'}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              if (type === 'login') {
                await handleSubmit(values as UserLoginRequest);
              } else if (type === 'register') {
                await validateAndShowCaptcha(values);
              }
            }}
            submitter={{
              searchConfig: {
                submitText: type === 'register' ? '注册' : '登录',
              }
            }}
          >
            <Tabs
              activeKey={type}
              onChange={setType}
              centered
              items={[
                {
                  key: 'login',
                  label: '登录',
                },
                {
                  key: 'register',
                  label: '注册',
                }
              ]}
            />
            {type === 'login' && (
              <>
                <ProFormText
                  name="userAccount"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined />,
                  }}
                  placeholder={'请输入账号/邮箱'}
                  rules={[
                    {
                      required: true,
                      message: '账号/邮箱是必填项！',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="userPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined />,
                  }}
                  placeholder={'请输入密码'}
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                  ]}
                />
              </>
            )}
            {type === 'register' && (
              <>
                <ProFormText
                  name="userAccount"
                  fieldProps={{
                    size: 'large',
                    prefix: <UserOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="请输入账号（选填）"
                />
                <ProFormText.Password
                  name="userPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="请输入密码"
                  rules={[
                    {
                      required: true,
                      message: '密码是必填项！',
                    },
                    {
                      min: 8,
                      type: 'string',
                      message: '长度不能小于 8',
                    },
                  ]}
                />
                <ProFormText.Password
                  name="checkPassword"
                  fieldProps={{
                    size: 'large',
                    prefix: <LockOutlined className={styles.prefixIcon} />,
                  }}
                  placeholder="请再次输入密码"
                  rules={[
                    {
                      required: true,
                      message: '确认密码是必填项！',
                    },
                    {
                      min: 8,
                      type: 'string',
                      message: '长度不能小于 8',
                    },
                  ]}
                />
                <ProFormText
                  name="email"
                  fieldProps={{
                    size: 'large',
                    prefix: <QqCircleFilled className={styles.prefixIcon} />,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
                  }}
                  placeholder="请输入邮箱"
                  rules={[
                    {
                      required: true,
                      message: '邮箱是必填项！',
                    },
                    {
                      type: 'email',
                      message: '请输入正确的邮箱地址！',
                    },
                  ]}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ProFormText
                    name="code"
                    fieldProps={{
                      size: 'large',
                      prefix: <MailOutlined className={styles.prefixIcon} />,
                    }}
                    placeholder="请输入邮箱验证码"
                    rules={[
                      {
                        required: true,
                        message: '验证码是必填项！',
                      },
                    ]}
                  />
                  <Button
                    type="primary"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    style={{ height: '40px', minWidth: '120px' }}
                  >
                    {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                  </Button>
                </div>
                <Captcha
                  onSuccess={async (data) => {
                    setValueData({
                      ...valueData,
                      captchaVerification: data.captchaVerification,
                    });
                  }}
                  path={BACKEND_HOST_CODE}
                  type="auto"
                  ref={ref}
                />
              </>
            )}
            {showCaptcha && (
              <Captcha
                onSuccess={async (data) => {
                  if (registerValues) {
                    const registerData: EmailRegisterRequest = {
                      userAccount: registerValues.userAccount || '',
                      userPassword: registerValues.userPassword,
                      checkPassword: registerValues.checkPassword,
                      email: registerValues.email,
                      code: registerValues.code,
                      captchaVerification: data.captchaVerification,
                    };
                    await handleRegisterSubmit(registerData);
                  }
                }}
                path={BACKEND_HOST_CODE}
                type="auto"
                ref={ref}
              />
            )}
          </LoginForm>
        </div>
        <Footer />
      </div>
    </Modal>
  );
};

export default LoginRegister; 
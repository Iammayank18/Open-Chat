import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import { message } from "antd";
const Register = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const naviagte = useNavigate();
  const onFinish = async (values) => {
    let response = await axios.post(
      import.meta.env.VITE_BACKEND_URL + "/register",
      values
    );
    try {
      if (response.data.msg == "user registered") {
        messageApi.open({
          type: "success",
          content: response.data.msg,
          duration: 1,
        });
        setTimeout(() => {
          naviagte("/");
        }, 1000);
      } else if (response.data.msg == "user exists") {
        messageApi.open({
          type: "warning",
          content: "user exists, please enter unique email or username",
          duration: 1.4,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="formMain">
      {contextHolder}
      <div>
        <div className="text-center py-2">
          <h3 className="text-xl">Welcome! Register now</h3>
        </div>
        <Form
          name="normal_login"
          className="login-form shadow-2xl w-90 p-5 rounded"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-indigo-400"
            >
              Sign up
            </Button>
            <p className="mt-3">
              Or <Link to="/">Login now!</Link>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default Register;

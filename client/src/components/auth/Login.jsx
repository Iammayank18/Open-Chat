import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { LoginUser } from "../../redux/action";
import { message } from "antd";
import "./Login.css";
const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let url = new URL(window.location.href);

  const onFinish = async (values) => {
    let response = await axios.post(
      import.meta.env.VITE_BACKEND_URL + "/login",
      values
    );
    try {
      if (response.data.msg === "logged in successfully") {
        messageApi.open({
          type: "success",
          content: response.data.msg,
          duration: 1,
        });
        setTimeout(() => {
          dispatch(LoginUser(response.data.data));
          localStorage.setItem("auth", JSON.stringify(response.data.data));
          url.searchParams.set("email", response.data.data.email);
          url.searchParams.set("username", response.data.data.username);
          navigate("/chat/" + url.search);
        }, 1000);
      } else if (response.data.msg === "invalid credentials") {
        messageApi.open({
          type: "error",
          content: response.data.msg,
          duration: 1,
        });
      } else if (response.data.msg === "User not exist") {
        messageApi.open({
          type: "warning",
          content: response.data.msg,
          duration: 1,
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
          <h3 className="text-xl">Welcome! Login now</h3>
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
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
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
              Log in
            </Button>
            <p className="mt-3">
              Or <Link to="/register">register now!</Link>
            </p>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default Login;

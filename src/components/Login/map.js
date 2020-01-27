import React from "react";
import { Icon } from "antd";
import styles from "./index.less";

export default {
  UserName: {
    props: {
      size: "large",
      prefix: <Icon type="user" className={styles.prefixIcon} />,
      placeholder: "admin"
    },
    rules: [
      {
        required: true,
        message: "请输入用户名!"
      }
    ]
  },
  Password: {
    props: {
      size: "large",
      prefix: <Icon type="lock" className={styles.prefixIcon} />,
      type: "password",
      placeholder: "888888"
    },
    rules: [
      {
        required: true,
        message: "请输入密码!"
      }
    ]
  },
  Mobile: {
    props: {
      size: "large",
      prefix: <Icon type="mobile" className={styles.prefixIcon} />,
      placeholder: "mobile number"
    },
    rules: [
      {
        required: true,
        message: "Please enter mobile number!"
      },
      {
        pattern: /^1\d{10}$/,
        message: "Wrong mobile number format!"
      }
    ]
  },
  Captcha: {
    props: {
      size: "large",
      prefix: <Icon type="mail" className={styles.prefixIcon} />,
      placeholder: "captcha",
      autocomplete: "off"
    },
    rules: [
      {
        required: true,
        message: "请输入验证码!"
      }
    ]
  }
};

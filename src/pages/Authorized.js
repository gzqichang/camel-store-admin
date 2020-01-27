import React from "react";
import RenderAuthorized from "@/components/Authorized";
import { getAuthority } from "@/utils/authority";
import Redirect from "umi/redirect";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";

const Authority = getAuthority();
const Authorized = RenderAuthorized(Authority);

export default ({ children }) => (
  <Authorized
    authority={children.props.route.authority}
    noMatch={<Redirect to="/user/login" />}
  >
    <LocaleProvider locale={zh_CN}>{children}</LocaleProvider>
  </Authorized>
);

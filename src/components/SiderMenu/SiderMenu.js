import React, { PureComponent } from "react";
import { Layout, Select, Icon, Popover } from "antd";
import pathToRegexp from "path-to-regexp";
import classNames from "classnames";
import Link from "umi/link";
import styles from "./index.less";
import BaseMenu, { getMenuMatches } from "./BaseMenu";
import { urlToList } from "../_utils/pathTools";
import { formatMessage, FormattedMessage } from "umi/locale";
import { getLocalStorage } from "@/utils/authority";

const { Sider } = Layout;
const Option = Select.Option;
/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
const getDefaultCollapsedSubMenus = props => {
  const {
    location: { pathname },
    flatMenuKeys
  } = props;
  return urlToList(pathname)
    .map(item => getMenuMatches(flatMenuKeys, item)[0])
    .filter(item => item);
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = menu =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(
        flatMenuKeys.filter(item => pathToRegexp(item).test(path))
      ),
    []
  );

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.flatMenuKeys = getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props)
    };
  }
  state = {
    visible: false
  };

  static getDerivedStateFromProps(props, state) {
    const { pathname } = state;
    if (props.location.pathname !== pathname) {
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus(props)
      };
    }
    return null;
  }

  isMainMenu = key => {
    const { menuData } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = openKeys => {
    const moreThanOne =
      openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys]
    });
  };

  render() {
    const {
      location,
      superadmin,
      storelist,
      shopurl,
      getstoreSelect,
      collapsed,
      onCollapse,
      fixSiderbar,
      theme,
      storeicon,
      storename,
      config
    } = this.props;
    const { openKeys, visible } = this.state;
    const defaultProps = collapsed ? {} : { openKeys };

    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderbar]: fixSiderbar,
      [styles.fixSiderbar2]: config && config.store_type === "cloud", // 云店不要显示切换门店菜单
      [styles.light]: theme === "light"
    });
    const allstore = storelist.map(item => (
      <Option key={item.id + `#` + item.url} label={item.url}>
        {item.name}
      </Option>
    ));
    let shopvalue =
      getLocalStorage("shopid") === shopurl
        ? shopurl
        : getLocalStorage("shopid");
    const content = (
      <Select
        getPopupContainer={triggerNode => triggerNode.parentNode.parentNode}
        style={{ width: 150, marginRight: 20 }}
        value={shopvalue}
        onChange={e => getstoreSelect(e)}
      >
        {superadmin &&
        (location.pathname === "/dashboard" ||
          location.pathname.includes("/setting/storelist")) ? (
          <Option key="all" label="所有门店汇总">
            所有门店汇总
          </Option>
        ) : null}
        {allstore}
      </Select>
    );

    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={256}
        theme={theme}
        className={siderClassName}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            {/*<img src={storeicon} alt="logo" style={collapsed ? {} : {display:'none'}}/>*/}
            <img
              src={storeicon.square_logo && storeicon.square_logo.file}
              alt="logo"
              style={{ borderRadius: "50%", margin: "0 5px" }}
            />
            <h1
              style={{
                maxWidth: 170,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {storename}
              管理后台
            </h1>
          </Link>
        </div>
        {config &&
          config.store_type === "camel" && (
            <div
              className={styles.logo}
              id="logo"
              style={{ height: "53px", borderTop: "1px solid #eee" }}
            >
              <Popover
                placement="right"
                title="切换门店"
                visible={visible}
                onVisibleChange={e =>
                  this.setState({ visible: collapsed ? e : visible })
                }
                content={content}
              >
                <Icon
                  type="hdd"
                  style={
                    collapsed
                      ? { marginLeft: 15, cursor: "pointer" }
                      : { marginLeft: 10, marginRight: 10 }
                  }
                />
              </Popover>
              {content}
            </div>
          )}
        <BaseMenu
          {...this.props}
          mode="inline"
          handleOpenChange={this.handleOpenChange}
          onOpenChange={this.handleOpenChange}
          style={{ padding: "16px 0", width: "100%", overflowX: "hidden" }}
          {...defaultProps}
        />
      </Sider>
    );
  }
}

import React, { PureComponent, createElement, Fragment } from 'react';
import pathToRegexp from 'path-to-regexp';
import { Breadcrumb, Select } from 'antd';
import styles from './index.less';
import { getLocalStorage, setLocalStorage } from '../../utils/authority';
import { urlToList } from '../_utils/pathTools';

const Option = Select.Option

export const getBreadcrumb = (breadcrumbNameMap, url) => {
  let breadcrumb = breadcrumbNameMap[url];
  if (!breadcrumb) {
    Object.keys(breadcrumbNameMap).forEach(item => {
      if (pathToRegexp(item).test(url)) {
        breadcrumb = breadcrumbNameMap[item];
      }
    });
  }
  return breadcrumb || {};
};

export default class BreadcrumbView extends PureComponent {
  state = {
    breadcrumb: null,
  };

  componentDidMount() {
    this.getBreadcrumbDom();
  }

  componentDidUpdate(preProps) {
    const { location } = this.props;
    if (!location || !preProps.location) {
      return;
    }
    const prePathname = preProps.location.pathname;
    if (prePathname !== location.pathname) {
      this.getBreadcrumbDom();
    }
  }

  getBreadcrumbDom = () => {
    const breadcrumb = this.conversionBreadcrumbList();
    this.setState({
      breadcrumb,
    });
  };

  getBreadcrumbProps = () => {
    const { routes, params, location, breadcrumbNameMap } = this.props;
    return {
      routes,
      params,
      routerLocation: location,
      breadcrumbNameMap,
    };
  };

  // Generated according to props
  conversionFromProps = () => {
    const { breadcrumbList, breadcrumbSeparator, itemRender, linkElement = 'a' } = this.props;
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {breadcrumbList.map(item => {
          const title = itemRender ? itemRender(item) : item.title;
          return (
            <Breadcrumb.Item key={item.title}>
              {item.href
                ? createElement(
                  linkElement,
                  {
                    [linkElement === 'a' ? 'href' : 'to']: item.href,
                  },
                  title
                )
                : title}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    const { breadcrumbSeparator, home, itemRender, linkElement = 'a' } = this.props;
    // Convert the url to an array
    const pathSnippets = urlToList(routerLocation.pathname);
    let currentBreadcrumb = null
    // Loop data mosaic routing
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);
      if (currentBreadcrumb.inherited) {
        return null;
      }
      const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb.component;
      let name = itemRender ? itemRender(currentBreadcrumb) : currentBreadcrumb.name;
      return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
        <Breadcrumb.Item key={url}>
          {createElement(
            isLinkable ? linkElement : 'span',
            { [linkElement === 'a' ? 'href' : 'to']: url },
            name
          )}
        </Breadcrumb.Item>
      ) : null;
    });
    // Add home breadcrumbs to your head
    // extraBreadcrumbItems.unshift(
    //   <Breadcrumb.Item key="home">
    //     {createElement(
    //       linkElement,
    //       {
    //         [linkElement === 'a' ? 'href' : 'to']: '/',
    //       },
    //       home || 'Home'
    //     )}
    //   </Breadcrumb.Item>
    // );
    return (
      <div className={styles.breadcrumb}>
        <Breadcrumb separator={breadcrumbSeparator}>
          {extraBreadcrumbItems}
        </Breadcrumb>
      </div>
    );
  };
  /**
   * 将参数转化为面包屑
   * Convert parameters into breadcrumbs
   */
  conversionBreadcrumbList = () => {
    const { breadcrumbList, breadcrumbSeparator } = this.props;
    const { routes, params, routerLocation, breadcrumbNameMap } = this.getBreadcrumbProps();
    if (breadcrumbList && breadcrumbList.length) {
      return this.conversionFromProps();
    }
    // 如果传入 routes 和 params 属性
    // If pass routes and params attributes
    if (routes && params) {
      return (
        <Breadcrumb
          className={styles.breadcrumb}
          routes={routes.filter(route => route.breadcrumbName)}
          params={params}
          itemRender={this.itemRender}
          separator={breadcrumbSeparator}
        />
      );
    }
    // 根据 location 生成 面包屑
    // Generate breadcrumbs based on location
    if (routerLocation && routerLocation.pathname) {
      return this.conversionFromLocation(routerLocation, breadcrumbNameMap);
    }
    return null;
  };

  // 渲染Breadcrumb 子节点
  // Render the Breadcrumb child node
  itemRender = (route, params, routes, paths) => {
    const { linkElement = 'a' } = this.props;
    const last = routes.indexOf(route) === routes.length - 1;
    return last || !route.component ? (
      <span>{route.breadcrumbName}</span>
    ) : (
      createElement(
        linkElement,
        {
          href: paths.join('/') || '/',
          to: paths.join('/') || '/',
        },
        route.breadcrumbName
      )
    );
  };

  render() {
    const { breadcrumb } = this.state;
    return breadcrumb;
  }
}

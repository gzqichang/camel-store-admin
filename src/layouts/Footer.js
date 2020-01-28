import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = ({show}) => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      // links={[
      //   {
      //     key: 'Pro 首页',
      //     title: 'Pro 首页',
      //     href: 'https://pro.ant.design',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'github',
      //     title: <Icon type="github" />,
      //     href: 'https://github.com/ant-design/ant-design-pro',
      //     blankTarget: true,
      //   },
      //   {
      //     key: 'Ant Design',
      //     title: 'Ant Design',
      //     href: 'https://ant.design',
      //     blankTarget: true,
      //   },
      // ]}
      copyright={
        show && (
          <Fragment>
            <a href="http://www.luotuoxiaodian.com" target='_blank' style={{color: 'rgba(0, 0, 0, 0.45)'}}>由骆驼小店提供技术支持</a> <br />
            Copyright <Icon type="copyright" />
            <a href="http://gzqichang.com" target='_blank' style={{color: 'rgba(0, 0, 0, 0.45)'}}>广州齐昌网络科技有限公司</a>
          </Fragment>
        )
      }
    />
  </Footer>
);
export default FooterView;

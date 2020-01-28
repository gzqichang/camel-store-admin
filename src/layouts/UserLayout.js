import React from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './UserLayout.less';

class UserLayout extends React.PureComponent {
  // @TODO title
  // getPageTitle() {
  //   const { routerData, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'Ant Design Pro';
  //   if (routerData[pathname] && routerData[pathname].name) {
  //     title = `${routerData[pathname].name} - Ant Design Pro`;
  //   }
  //   return title;
  // }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/queryStorename',
    });
  }

  render() {
    const { children, storename } = this.props;
    return (
      // @TODO <DocumentTitle title={this.getPageTitle()}>
      <div className={styles.container}>
        <div className={styles.lang} />
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <span className={styles.title}>
                  {storename}
                  管理后台
                </span>
              </Link>
            </div>
            {/*<div className={styles.desc}>由骆驼小店提供技术支持</div>*/}
          </div>
          {children}
        </div>
      </div>
    );
  }
}
// <SelectLang />
// <img alt="logo" className={styles.logo} src={logo} />
// export default UserLayout;
export default connect(({ global }) => ({
  storename: global.storename,
}))(UserLayout);

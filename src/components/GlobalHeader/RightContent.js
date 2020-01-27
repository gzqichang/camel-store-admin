import React, { PureComponent } from "react";
import { FormattedMessage, formatMessage } from "umi/locale";
import {
  Spin,
  Tag,
  Menu,
  Icon,
  Dropdown,
  Avatar,
  Tooltip,
  Button,
  Select,
  Popover
} from "antd";
// import moment from 'moment';
import Link from "umi/link";
import Tip from "@/assets/tip.mp3";
// import groupBy from 'lodash/groupBy';
import NoticeIcon from "../NoticeIcon";
// import HeaderSearch from '../HeaderSearch';
// import SelectLang from '../SelectLang';
import { getLocalStorage, setLocalStorage } from "@/utils/authority";
import styles from "./index.less";
import { routerRedux } from "dva/router";

export default class GlobalHeaderRight extends PureComponent {
  componentDidUpdate() {
    const { newfeedback, audioControl } = this.props;
    let myAuto = document.getElementById("myaudio");
    if (newfeedback) {
      myAuto.play();
      audioControl();
    }
  }
  render() {
    const {
      fetchingNotices,
      onNoticeVisibleChange,
      toNoticedata,
      toOrderpage,
      onMenuClick,
      onNoticeClear,
      theme,
      sendorderCount,
      sendorderlist,
      feedback,
      feedbackCount
    } = this.props;
    const currentUser = getLocalStorage("username");
    // const noticeData = this.getNoticeData();

    let className = styles.right;
    if (theme === "dark") {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        <audio id="myaudio" loop={false} hidden={true}>
          <source src={Tip} type="audio/mpeg" />
        </audio>
        <NoticeIcon
          className={styles.action}
          count={sendorderCount + feedbackCount}
          children={sendorderlist}
          onItemClick={(item, tabProps) => toNoticedata(item, tabProps)}
          locale={{
            emptyText: formatMessage({ id: "component.noticeIcon.empty" }),
            clear: formatMessage({ id: "component.noticeIcon.clear" })
          }}
          onClear={onNoticeClear}
          toPage={toOrderpage}
          onPopupVisibleChange={onNoticeVisibleChange}
          // popupVisible={visible}
          loading={fetchingNotices}
          popupAlign={{ offset: [20, -16] }}
          clearClose
        >
          <NoticeIcon.Tab
            list={sendorderlist}
            count={sendorderCount}
            title={formatMessage({
              id: "component.globalHeader.sendorderlist"
            })}
            name="sendorderlist"
            emptyText={formatMessage({
              id: "component.globalHeader.notification.empty"
            })}
            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
          />
          <NoticeIcon.Tab
            list={feedback}
            count={feedbackCount}
            title={formatMessage({ id: "component.globalHeader.feedbacklist" })}
            name="feedbacklist"
            showClear={false}
            emptyText={formatMessage({
              id: "component.globalHeader.feedback.empty"
            })}
            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
          />
        </NoticeIcon>
        {currentUser ? (
          <Popover
            content={
              <div className={styles.box}>
                <Link to="/person/Editpwd" className={styles.btn}>
                  修改密码
                </Link>
                <a
                  style={{
                    height: 40,
                    width: 1,
                    background: "#e8e8e8"
                  }}
                />
                <a className={styles.btn} onClick={onMenuClick}>
                  退出
                </a>
              </div>
            }
            title="个人中心"
            trigger="click"
            placement="bottomRight"
            overlayClassName={styles.me}
            overlayStyle={{ textAlign: "center" }}
          >
            <span className={`${styles.action} ${styles.account}`}>
              <span className={styles.name}>{currentUser}</span>
            </span>
          </Popover>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
        {/*<Button type="primary" key="logout" onClick={onMenuClick}>*/}
        {/*<FormattedMessage id="menu.account.logout" defaultMessage="logout" />*/}
        {/*</Button>*/}
      </div>
    );
  }
}

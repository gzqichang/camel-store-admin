import React, { Fragment } from 'react';
import { Avatar, List } from 'antd';
import classNames from 'classnames';
import styles from './NoticeList.less';
import moment from 'moment';
import Link from 'umi/link';
export default function NoticeList({
  data = [],
  onClick,
  onClear,
  toPage,
  title,
  locale,
  emptyText,
  emptyImage,
  showClear = true,
}) {
  if (data.length === 0) {
    return (
      <div className={styles.notFound}>
        {emptyImage ? <img src={emptyImage} alt="not found" /> : null}
        <div>{emptyText || locale.emptyText}</div>
      </div>
    );
  }
  return (
    <div>
      <List className={styles.list}>
        {data.map((item, i) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
          });
          // eslint-disable-next-line no-nested-ternary
          const leftIcon = item.user_info ? (
            typeof item.user_info.avatar_url === 'string' ? (
              <Avatar className={styles.avatar} src={item.user_info.avatar_url} />
            ) : (
              item.avatar
            )
          ) : null;

          return (
            <List.Item className={itemCls} key={item.key || i} onClick={() => onClick(item)}>
              <List.Item.Meta
                className={styles.meta}
                avatar={<span className={styles.iconElement}>{leftIcon}</span>}
                title={
                  <div className={styles.title}>
                    {item.goods_backup
                      ? <Fragment>
                          {item.goods_backup.goods_name}
                          <div className={styles.extra}>￥ {item.goods_backup.price * item.goods_backup.num}</div>
                        </Fragment>
                      : <Fragment>
                          {item.content}
                        </Fragment>
                    }
                  </div>
                }
                description={
                  <div>
                    <div className={styles.description} title={item.description}>
                      {item.goods_backup ? item.goods_backup.gtype_name : null}
                    </div>
                    <div className={styles.datetime}>{moment(item.add_time).format('YYYY-MM-DD kk:mm')}</div>
                  </div>
                }
              />
            </List.Item>
          );
        })}
      </List>

      <div>
        {showClear ? (
          <div className={styles.clear} style={{borderRight:'1px solid #F0F2F5'}} onClick={onClear}>
            {locale.clear}
          </div>
        ) : null}
        <div className={styles.clear} style={showClear ? {} : {width:'100%'} } onClick={toPage}>
        <a>查看全部</a>
        </div>
      </div>
    </div>
  );
}

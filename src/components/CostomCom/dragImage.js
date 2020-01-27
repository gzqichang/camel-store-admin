import React, { Component, Fragment } from "react";
import { Icon, message } from "antd";
import { DragSource, DropTarget } from "react-dnd";
import flow from "lodash/flow";
import styles from "./tableDrag.less";
let dragingIndex = -1;

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      areakey: props.areakey,
      index: props.index
    };
  }
};
function collectSource(connect) {
  return {
    connectDragSource: connect.dragSource()
  };
}

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.item.uid * -1;

    if (dragIndex === hoverIndex) {
      if (props.areakey !== monitor.getItem().areakey) {
        message.error("不可移动到该区域");
      }
      return;
    }

    if (
      (props.areakey && props.areakey === monitor.getItem().areakey) ||
      !props.areakey
    ) {
      props.moveRow(dragIndex, hoverIndex);
      monitor.getItem().index = hoverIndex;
    } else {
      message.error("不可移动到该区域");
    }
  }
};
function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class BodyRow extends Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      item,
      handlePreview,
      handleDelete,
      areakey,
      moveRow,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: "move" };
    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += " drop-over-downward";
      }
      if (restProps.index < dragingIndex) {
        className += " drop-over-upward";
      }
    }

    return connectDragSource(
      connectDropTarget(
        <div className={`${styles.dragImage}`} style={style}>
          <div
            className={`ant-upload-list ant-upload-list-picture-card  ${className}`}
          >
            <div className={`ant-upload-list-item ant-upload-list-item-done`}>
              <div className="ant-upload-list-item-info">
                <span>
                  <a className="ant-upload-list-item-thumbnail">
                    <img
                      src={item.url}
                      style={{ width: "86px", height: "86px" }}
                    />
                  </a>
                </span>
                <span className="ant-upload-list-item-actions">
                  <a onClick={() => handlePreview(item)} title="预览文件">
                    <i
                      aria-label="图标: eye-o"
                      className="anticon anticon-eye-o"
                    >
                      <svg
                        viewBox="64 64 896 896"
                        className=""
                        data-icon="eye"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 0 0 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" />
                      </svg>
                    </i>
                  </a>
                  <i
                    onClick={() => handleDelete(item)}
                    aria-label="图标: delete"
                    title="删除文件"
                    tabIndex="-1"
                    className="anticon anticon-delete"
                  >
                    <svg
                      viewBox="64 64 896 896"
                      className=""
                      data-icon="delete"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z" />
                    </svg>
                  </i>
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default flow(
  DragSource("areakey", rowSource, collectSource),
  DropTarget("areakey", rowTarget, collectTarget)
)(BodyRow);

import React, { Component, Fragment } from 'react';
import { Empty, Pagination, Row, Col } from 'antd';
import { DragSource, DropTarget } from 'react-dnd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './tableDrag.less';

let dragingIndex = -1;

class BodyRow extends Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      item,
      ...restProps
    } = this.props;
    const style = { ...restProps.style, cursor: 'move' };
    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }

}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget(
  'row',
  rowTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }),
)(
  DragSource(
    'row',
    rowSource,
    (connect) => ({
      connectDragSource: connect.dragSource(),
    }),
  )(BodyRow),
);

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  cursor: 'move',
  transition: 'unset',
  boxSizing: 'border-box',
  display: isDragging ? 'table' : '',
  background: isDragging ? '#E6F7FF' : '#fff',
  overflowX: isDragging ? 'hidden' : 'scroll',
  ...draggableStyle,
});
const trStyle = (isDragging, draggableStyle) => ({
  background: isDragging ? '#E6F7FF' : '#fff',
});
class tableDrag extends React.Component {
  state = {
    current: 1,
    pageSize: 10,
    offsetWidth: 0,
    offsetWidthBody: 0
  }

  componentDidUpdate(preprops,prestate){
    const dragTable = document.getElementById('tableDrag')
    const bodyTable = document.getElementById('tableDragbody')
    if(dragTable.offsetWidth > 0 && this.state.offsetWidth !== dragTable.offsetWidth){
      this.setState({ offsetWidth:dragTable.offsetWidth, offsetWidthBody:bodyTable.offsetWidth  })
    }
  }

  components = {
    body: {
      row: BodyRow,//DragableBodyRow,
    },
  }

  onDragEnd = (result) => {
    if(!result.destination) {
      return;
    }
    const { dataSource, onChange } = this.props;
    const dragIndex = result.source.index,
      hoverIndex = result.destination.index;
    const dragRow = dataSource[dragIndex];
    onChange({dragIndex,hoverIndex,dragRow})
  };

  // moveRow = (dragIndex, hoverIndex) => {
  //   const { dataSource, onChange } = this.props;
  //   const dragRow = dataSource[dragIndex];
  //   onChange({dragIndex,hoverIndex,dragRow})
  // }
  //处理传值
  conversionObject() {
    const { columns, dataSource = [], restProps = {} } = this.props;
    const { current, pageSize } = this.state;
    const { pagination } = restProps
    const _dataSource = dataSource.slice((current - 1)*pageSize,current * pageSize);
    return {
      columns,
      dataSource:pagination && _dataSource || dataSource,
      total: dataSource.length,
      restProps,
    };
  }

  pageChange = (page) => {
    this.setState({ current: page })
  }

  pageSizeChange = (current,size) => {
    this.setState({ current: 1, pageSize: size })
  }

  render() {
    const { columns, dataSource, restProps, total } = this.conversionObject()
    const { scroll, pagination } = restProps;
    const { pageSize, offsetWidthBody } = this.state
    const widthtable = scroll && scroll.x ? ( offsetWidthBody > scroll.x ? offsetWidthBody : scroll.x) : 'auto'

    return (
      <div className={styles.dragTable}>
      {/*<Table*/}
        {/*columns={columns}*/}
        {/*dataSource={dataSource}*/}
        {/*components={this.components}*/}
        {/*pagination={false}*/}
        {/*size='small'*/}
        {/*onRow={(record, index) => ({*/}
          {/*index,*/}
          {/*moveRow: this.moveRow,*/}
        {/*})}*/}
        {/*{...restProps}*/}
      {/*/>*/}
        <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="ant-table-wrapper">
          <div className="ant-spin-nested-loading">
            <div className="ant-spin-container">
              <div className="ant-table ant-table-small ant-table-scroll-position-left">
                <div className="ant-table-content">
                  <div className="ant-table-body" id="tableDragbody" style={ scroll && scroll.x ? {overflowX: 'scroll'} : {}}>
                    <table style={isNaN(widthtable) ? {} : {width:widthtable + 'px'}} id="tableDrag">
                      <thead className="ant-table-thead">
                      <tr>
                        { columns.map(item => {
                          return (<th style={item.width ? { width: `${item.width}px`,userSelect:'none'} : {userSelect:'none'}}><div>{item.title}</div></th>)
                        })}
                      </tr></thead>
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <tbody className="ant-table-tbody" ref={provided.innerRef}>
                            {dataSource.length > 0 && dataSource.map((item, index) => (
                              <Draggable key={item.key} draggableId={item.key} index={index}>
                                {(provided, snapshot) => (
                                  <tr className="ant-table-row ant-table-row-level-0" data-row-key={index}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                  >
                                    {columns.map(item_in => {
                                      return (
                                        <td style={item_in.width ? { width: `${item_in.width}px`,userSelect:'none'} : {userSelect:'none'}}>
                                          {item_in.render && item_in.render(item[item_in.dataIndex],item) || item[item_in.dataIndex]}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </table>
                  </div>
                  {dataSource.length === 0 && <div className="ant-table-placeholder"><Empty /></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        </DragDropContext>
        { pagination &&
          <Row><Col style={{textAlign:'right', marginTop: 10, marginBottom: 10 }}>
            <Pagination pageSize={pageSize} size="small" total={total} showSizeChanger
                        onChange={this.pageChange} onShowSizeChange={this.pageSizeChange}/>
          </Col></Row> }
      </div>
    );
  }
}
export default tableDrag;

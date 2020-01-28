import React, { Component, Fragment } from 'react';
import { Tag  } from 'antd';

class TagSelect extends Component {
  state = {};

  closeTag = (e) => {
    const { onClose, disabled } = this.props
    if(!disabled){
      onClose(e)
    }
  }

  render() {
    const { children, disabled } = this.props;

    return (
      <Fragment>
        {children
        && children.map(item =>
          <Tag key={item} color="blue" disabled={disabled} closable afterClose={() => this.closeTag(item)}>{item}</Tag>
        )}
      </Fragment>
    );
  }
}
export default TagSelect;

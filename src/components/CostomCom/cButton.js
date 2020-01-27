import React, { Component } from "react";
import { Button } from "antd";
let click = true;
class CButton extends Component {
  state = {
    isCollapse: false
  };

  handleClick = () => {
    const { onClick } = this.props;
    if (click) {
      click = false;
      onClick && onClick();
      setTimeout(() => {
        click = true;
      }, 2000);
    }
  };

  componentWillUnmount() {
    clearTimeout();
  }

  render() {
    const { onClick = () => {}, ...restprops } = this.props;

    return <Button onClick={() => this.handleClick()} {...restprops} />;
  }
}

export default CButton;

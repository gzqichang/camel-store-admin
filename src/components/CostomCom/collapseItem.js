import React, { Component, Fragment } from "react";
import { permissionAuth } from "@/utils/permission";
import { connect } from "dva";
import { Icon } from "antd";
import styles from "./collapseItem.less";

@connect(({ global }) => ({
  isMobile: global.isMobile
}))
class CollapseItem extends Component {
  state = {
    isCollapse: false
  };

  componentDidMount() {
    const { isMobile } = this.props;
    this.setState({ isCollapse: !!isMobile });
  }

  renderSimpleForm = () => {
    const { renderSimpleForm } = this.props;
    if (renderSimpleForm) {
      return renderSimpleForm();
    }
    return null;
  };

  renderAdvancedForm = () => {
    const { renderAdvancedForm } = this.props;
    if (renderAdvancedForm) {
      return renderAdvancedForm();
    }
    return null;
  };

  toggleForm = () => {
    const { isCollapse } = this.state;
    this.setState({
      isCollapse: !isCollapse
    });
  };

  conversionObject() {
    const { maxHeight, show = true } = this.props;
    if (!maxHeight) {
      return {
        maxHeight: "400px",
        show
      };
    }
    return {
      maxHeight,
      show
    };
  }

  render() {
    const { isCollapse } = this.state;
    const { maxHeight, show } = this.conversionObject();

    return (
      <Fragment>
        {show && (
          <Fragment>
            <div
              className={styles.searchplane}
              style={isCollapse ? {} : { maxHeight }}
            >
              {this.renderSimpleForm()}
              {this.renderAdvancedForm()}
            </div>
            <div className={styles.expandicon}>
              <a onClick={this.toggleForm}>
                {isCollapse ? "展开" : "收起"}
                <Icon
                  type="down"
                  style={isCollapse ? {} : { transform: "rotate(180deg)" }}
                />
              </a>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default CollapseItem;

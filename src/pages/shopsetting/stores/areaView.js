import React, { Fragment, PureComponent } from "react";
import { Button } from "antd";
import { connect } from "dva";

@connect(({ location, loading }) => {
  return {
    loading: loading.models.location
  };
})
class areaView extends PureComponent {
  state = {
    path: [],
    isedit: false,
    lng: "",
    lat: ""
  };

  componentDidMount = () => {
    const { value, edit, center } = this.props;
    let geolocation = new qq.maps.Geolocation(
      "DOTBZ-NKEWF-MDHJS-JARVI-6NZI6-ASBKI",
      "luotuostore"
    );
    const that = this;
    if (!edit) {
      geolocation.getIpLocation(function(e) {
        that.init(e);
      }, null);
    } else {
      if (value.length === 0 && !center) {
        geolocation.getIpLocation(function(e) {
          that.init(e);
        }, null);
      }
    }
  };

  componentDidUpdate = (preprops, prestate) => {
    const { value, edit, center } = this.props;
    let { path, isedit, lng } = this.state;
    if (value.length > 0 && value.length !== path.length && isedit !== edit) {
      value.map(item => {
        path.push(new qq.maps.LatLng(item.lat, item.lng));
      });
      this.setState({ path: value, isedit: edit });
      this.init();
    }
    if (center && lng !== center.lng) {
      this.setState({ lng: center.lng });
      this.init(center);
    }
  };

  init = e => {
    let { path } = this.state;
    const { onChange } = this.props;
    let map = new qq.maps.Map(document.getElementById("container"), {
      zoom: 12
    });
    let marker = new qq.maps.Polygon({
      path: path,
      editable: true,
      visible: true,
      strokeColor: new qq.maps.Color(24, 144, 255, 0.8),
      fillColor: new qq.maps.Color.fromHex("#1890FF", 0.3)
    });
    //根据是否配送范围，有即配送范围的中心，没有根据是否转换坐标，有坐标为中心，没有是当前获取的位置
    if (e) {
      //e是当前位置
      let point = new qq.maps.Marker({
        position: new qq.maps.LatLng(e.lat, e.lng),
        title: "店铺位置",
        visible: true
      });
      point.setMap(map);
      map.setCenter(new qq.maps.LatLng(e.lat, e.lng));
    } else {
      map.setCenter(marker.getBounds().getCenter());
    }
    marker.setMap(map);
    const setNewPath = _path => {
      marker.setPath(_path);
      this.setState({ path: _path });
      onChange(_path);
    };

    const that = this;
    qq.maps.event.addListener(map, "click", function(e) {
      path.push(new qq.maps.LatLng(e.latLng.lat, e.latLng.lng));
      setNewPath(path);
    });
    //清除点
    let clearBtn = document.getElementById("clearBtn");
    qq.maps.event.addDomListener(clearBtn, "click", function() {
      path = [];
      marker.setPath([]);
      that.setState({ path: [] });
      onChange([]);
    });
    //编辑点（移动）
    qq.maps.event.addListener(marker, "adjustNode", function(e) {
      console.log(e);
      setNewPath(e.path.elems);
    });
    //添加点
    qq.maps.event.addListener(marker, "insertNode", function(e) {
      setNewPath(e.path.elems);
    });
    //删除
    qq.maps.event.addListener(marker, "removeNode", function(e) {
      setNewPath(e.path.elems);
    });
  };

  render() {
    return (
      <Fragment>
        <Button id="clearBtn" style={{ marginBottom: 10 }}>
          重置
        </Button>
        <div style={{ width: "100%", height: "300px" }} id="container" />
      </Fragment>
    );
  }
}

export default areaView;

import React, { Component, Fragment } from "react";
import { connect } from "dva";
import { permissionAuth } from "@/utils/permission";
import {
  imageTransform,
  imageRequest,
  imageTransformReverse
} from "@/utils/_utils";
import { Form, Modal } from "antd";
import UploadImage from "@/components/CostomCom/uploadImage";
import SourceImageTab from "@/components/CostomCom/sourceImage";
import styles from "../editpage.less";
import update from "immutability-helper";

const formItemLayout = {
  labelCol: { md: { span: 5 }, lg: { span: 5 }, xxl: { span: 3 } },
  wrapperCol: { md: { span: 18 }, lg: { span: 18 }, xxl: { span: 20 } }
};
const FormItem = props => (
  <Form.Item
    className={styles.imageItem}
    required
    {...formItemLayout}
    {...props}
  />
);

@connect(({ upload, global, loading }) => ({
  permissions: global.permissions,
  Loading: loading.effects["upload/createImage"]
}))
class ImageGroup extends Component {
  state = {
    detailmax: 0,
    bannermax: 0,
    page: 1,
    page_size: 20,
    v_page: 1,
    v_page_size: 20,
    visible: false,
    uploadform: {},
    selectList: [],
    _selectList: [],
    limit: 1,
    key: ""
  };

  componentDidMount = () => {};

  componentDidUpdate = (preprops, prestate) => {
    const { detailgroup, bannergroup } = this.props;
    const { detailmax, bannermax } = this.state;
    if (detailgroup.length !== detailmax || bannergroup.length !== bannermax) {
      this.setState({
        detailmax: detailgroup.length,
        bannermax: bannergroup.length
      });
    }
  };

  //打开图片墙弹窗
  openModal = (limit, key, openSource) => {
    if (openSource) {
      this.setState({
        visible: true,
        limit,
        key,
        selectList: [],
        _selectList: []
      });
    }
  };

  //选好图片，点击确定导入到详情中
  handleSelect = () => {
    const { _selectList, key } = this.state;
    const { onChange, detailgroup, bannergroup } = this.props;
    if (key === "banner") {
      const select_List = _selectList.map(item => {
        return { image: { ...item, index: undefined, key: undefined } };
      });
      onChange([...bannergroup, ...select_List], key);
    } else if (key === "detail") {
      const select_List = _selectList.map(item => {
        return { image: { ...item, index: undefined, key: undefined } };
      });
      onChange([...detailgroup, ...select_List], key);
    } else {
      onChange({ ..._selectList[0], index: undefined, key: undefined }, key);
    }
    this.setState({ visible: false });
  };

  handleUpload = (res, key, list, isdrag) => {
    let { detailgroup, bannergroup, onChange } = this.props;
    const del = !!list;
    let arrlist = [];
    if (key === "banner") {
      if (isdrag && isdrag === "drag") {
        const { dragIndex, hoverIndex, dragRow } = res;
        arrlist = update(bannergroup, {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]
        });
      } else {
        arrlist = del
          ? imageTransformReverse(bannergroup, list)
          : [...bannergroup, { image: { ...res } }];
      }
    } else if (key === "detail") {
      if (isdrag && isdrag === "drag") {
        const { dragIndex, hoverIndex, dragRow } = res;
        arrlist = update(detailgroup, {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]]
        });
      } else {
        arrlist = del
          ? imageTransformReverse(detailgroup, list)
          : [...detailgroup, { image: { ...res } }];
      }
    } else {
      //key=== 'poster,image,video'
      arrlist = del ? null : { ...res };
    }
    onChange(arrlist, key);
  };

  conversionObject() {
    const {
      video,
      goodimg,
      poster,
      detailgroup,
      bannergroup,
      disabled
    } = this.props;

    return {
      video,
      goodimg,
      poster,
      detailgroup,
      bannergroup,
      disabled
    };
  }

  render() {
    const {
      video,
      goodimg,
      poster,
      detailgroup,
      bannergroup,
      disabled
    } = this.conversionObject();
    const { visible, key, limit } = this.state;
    const wh = window.screen.height;

    return (
      <Fragment>
        <FormItem
          label="商品介绍视频"
          required={false}
          help="支持MP4，建议视频大小10M以内。"
          className={styles.imageItemNo}
        >
          <UploadImage
            type="video"
            fileList={video}
            openSource={video.length < 1}
            disabled={disabled}
            limit={1}
            onChange={(e, list) => this.handleUpload(e, "video", list)}
            handleSource={() =>
              this.openModal(1 - video.length, "video", video.length < 1)
            }
            restprops={{
              text: "上传视频",
              listType: "text",
              accept: ".mp4",
              openFileDialogOnClick: false
            }}
          />
        </FormItem>
        <FormItem
          label="朋友圈分享海报"
          help="支持PNG, JPG，建议像素宽度为584，高度为910。"
        >
          <UploadImage
            areakey={"poster"}
            disabled={disabled}
            openSource={poster.length < 1}
            limit={1}
            fileList={poster}
            handleSource={() =>
              this.openModal(1 - poster.length, "poster", poster.length < 1)
            }
            onChange={(e, list, isdrag) =>
              this.handleUpload(e, "poster", list, isdrag)
            }
            restprops={{ openFileDialogOnClick: false }}
          />
        </FormItem>
        {/*<FormItem label="封面图" help='支持PNG, JPG，建议像素宽度为670，高度为306。'>*/}
        {/*<UploadImage*/}
        {/*areakey={'image'}*/}
        {/*disabled={disabled}*/}
        {/*openSource={goodimg.length < 1}*/}
        {/*limit={1}*/}
        {/*fileList={goodimg}*/}
        {/*handleSource={() => this.openModal(1 - goodimg.length,'image',goodimg.length < 1)}*/}
        {/*onChange={(e,list,isdrag) => this.handleUpload(e,'image',list,isdrag)}*/}
        {/*restprops={{ openFileDialogOnClick: false }}*/}
        {/*/>*/}
        {/*</FormItem>*/}
        <FormItem
          label="详情图"
          help="支持PNG, JPG, 建议像素宽度为750。(请尽量控制图片大小和张数，以免客户浏览的时候加载太慢)"
        >
          <UploadImage
            isdrag={true}
            areakey={"detail"}
            disabled={disabled}
            fileList={detailgroup}
            handleSource={() => this.openModal(null, "detail", true)}
            onChange={(e, list, isdrag) =>
              this.handleUpload(e, "detail", list, isdrag)
            }
            restprops={{ openFileDialogOnClick: false }}
          />
        </FormItem>
        <FormItem
          label="轮播图"
          help="支持PNG, JPG, 建议像素为750 * 720。(图片最多为5张)"
        >
          <UploadImage
            isdrag={true}
            openSource={bannergroup.length < 5}
            areakey={"banner"}
            disabled={disabled}
            limit={5}
            fileList={bannergroup}
            handleSource={() =>
              this.openModal(
                5 - bannergroup.length,
                "banner",
                bannergroup.length < 5
              )
            }
            onChange={(e, list, isdrag) =>
              this.handleUpload(e, "banner", list, isdrag)
            }
            restprops={{ openFileDialogOnClick: false }}
          />
        </FormItem>
        <Modal
          width="60%"
          title="素材选择"
          visible={visible}
          centered
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.handleSelect()}
          bodyStyle={{ maxHeight: `${wh - 300}px`, overflowY: "auto" }}
        >
          <SourceImageTab
            type={key === "video" ? "video" : "picture"}
            limit={limit}
            visible={visible}
            onSelectItem={list => this.setState({ _selectList: list })}
            {...this.props}
          />
        </Modal>
      </Fragment>
    );
  }
}

export default ImageGroup;

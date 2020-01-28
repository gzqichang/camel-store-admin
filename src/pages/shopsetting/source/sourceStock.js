import React, { Component, Fragment } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { connect } from 'dva';
import { setLocalStorage } from '@/utils/authority';
import { imageTransformReverse } from '@/utils/_utils'
import {
  Card,
  Tabs,
} from 'antd';
import styles from '../shopsetting.less';
import SourceImageTab from '@/components/CostomCom/sourceImage';

const TabPane = Tabs.TabPane;

@connect(({ upload, costom, loading }) => ({
  filelist:upload.filelist,
  fileCount:upload.fileCount,
  videolist:upload.videolist,
  videoCount:upload.videoCount,
  loading: loading.models.upload
}))
class SourceStock extends Component {
  state = {
    uploadform:{},
    uploadlist: [],
    visible: false,
    selectModal: false,
  }

  componentDidMount() {
  }

  render(){

    return(
      <PageHeaderWrapper>
      <Card className={styles.main}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="图片" key="1">
            <SourceImageTab
              type="picture"
              editIcon={true}
              {...this.props}/>
          </TabPane>
          <TabPane tab="视频" key="2">
            <SourceImageTab
              type="video"
              editIcon={true}
              {...this.props}/>
          </TabPane>
        </Tabs>
      </Card>
      </PageHeaderWrapper>
    )
  }
}

export default SourceStock;

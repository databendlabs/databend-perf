// Copyright 2022 Datafuse Labs.
import { Button, notification } from 'antd';
import { FC, ReactElement } from 'react';
import IconFont from '../../assets/icon/icon';
import { copyToClipboard } from '../../utils/tools';
import styles from './index.module.scss';
interface IProps {
  category: string;
  graph: string;
  type?: string;
  title?: string;
}
const ShareButton: FC<IProps> = ({category, graph, type, title}): ReactElement=> {
  // @ts-ignore
  const share = ()=>{
    copyToClipboard(`${window.location.origin}/#/share?category=${category}&graph=${graph}&type=${type}&title=${title}`);
    notification.open({
      message: 'Tips',
      duration: 1.5,
      placement: 'topLeft',
      description:
        'The share link is already in the clipboard'
    });
  }
  return (
    <Button onClick={share} title='Share with others' type='default' className={styles.share}>
      <IconFont className={styles.icon} type='databend-fenxiang'></IconFont>
    </Button>
  );
};
ShareButton.defaultProps = {
  type: 'line',
  title: '',
}
export default ShareButton;
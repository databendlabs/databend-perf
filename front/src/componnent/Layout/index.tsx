import { FC, ReactElement, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer } from 'antd';
import LogoDarkHorizon from '../../assets/logo/logo-dark-horizon';
import ForkImg from '../../assets/graph/fork-me.png';
import Footer from './footer';
import LinkIcon from '../../assets/icon/link';
import IconFont from '../../assets/icon/icon';
import styles from './index.module.scss';
import clsx from 'clsx';

const { Header, Content } = Layout;
const PerfLayout: FC = (): ReactElement=> {
  const [selectKey, setSelectKey] = useState('graphs');
  const {pathname} = useLocation();
  const [drawVisible, setDrawVisible] = useState(false);
  const menuClick = (e:{key:string})=>{
    setSelectKey(e?.key);
    setDrawVisible(false);
  }
  useEffect(()=>{
    setSelectKey(pathname.split('/')[1] || 'graphs')
  }, [pathname]);
  function MenuContent(mode: any){
    return  (
        <Menu onClick={menuClick} style={mode==='vertical'?{}:{minWidth: '500px', marginLeft: '40px'}} theme="dark" mode={mode} selectedKeys={[selectKey]}>
          <Menu.Item key='graphs'>
            <Link to={'/'}>Graphs</Link>  
          </Menu.Item>
          <Menu.Item key="compare">
            <Link to={'/compare'}>Compare</Link>
          </Menu.Item>
          <Menu.Item key="status">
              <Link to={'/status'}>Status</Link>
          </Menu.Item>
          <Menu.Item key="documentation">
            <a style={{display: 'flex', alignItems: 'center'}} className="out-link" href={'https://databend.rs/doc'} target="_blank">
              <span style={{paddingRight: '5px'}}>Documentation</span>
              <LinkIcon></LinkIcon>
            </a>
          </Menu.Item>
        </Menu>
    )
  }
  return (
    <Layout style={{overflowX: 'hidden'}}>
      <a data-pc href="https://github.com/datafuselabs/databend-perf" target={"_blank"}>
        <img style={{position: 'fixed', right: 0, top: 0, zIndex:2000, cursor: 'pointer', clipPath: 'polygon(8% 0%, 100% 92%, 100% 0%)', width: '149px', height: '149px'}} src={ForkImg} alt="fork-me" />
      </a>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link style={{display: 'flex'}} to={'/'}><LogoDarkHorizon></LogoDarkHorizon></Link>
          <IconFont onClick={()=>setDrawVisible(true)} data-phone className={styles.menuCollapse} type="databend-collapse"></IconFont>
        </div>
        <span data-pc>
          {MenuContent('horizontal')}
        </span>
      </Header>
      <Content className={clsx("site-layout", styles.contentWrap)} style={{ padding: '0 20px', paddingTop: '20px', marginTop: 64 }}>
        <div className={clsx("site-layout-background", styles.content)} style={{ }}>
          <Outlet></Outlet>
        </div>
      </Content>
      <Footer></Footer>
      <Drawer
        bodyStyle={{background: '#001529'}}
        data-phone
        width={'70%'}
        placement={'left'}
        closable={false}
        onClose={()=>setDrawVisible(false)}
        visible={drawVisible}
      >
        {MenuContent('vertical')}
      </Drawer>
    </Layout>
  );
};
export default PerfLayout;
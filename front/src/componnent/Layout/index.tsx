import { FC, ReactElement, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import LogoDarkHorizon from '../../assets/logo/logo-dark-horizon';
import ForkImg from '../../assets/graph/fork-me.png';
import Footer from './footer';

const { Header, Content } = Layout;
const PerfLayout: FC = (): ReactElement=> {
  const [selectKey, setSelectKey] = useState('graphs');
  const {pathname} = useLocation();
  const menuClick = (e:{key:string})=>{
    setSelectKey(e?.key)
  }
  useEffect(()=>{
    setSelectKey(pathname.split('/')[1] || 'graphs')
  }, [pathname]);
  return (
    <Layout>
      <a href="https://github.com/datafuselabs/databend-perf" target={"_blank"}>
        <img style={{position: 'fixed', right: 0, top: 0, zIndex:10, cursor: 'pointer', clipPath: 'polygon(8% 0%, 100% 92%, 100% 0%)', width: '149px', height: '149px'}} src={ForkImg} alt="fork-me" />
      </a>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', display: 'flex', alignItems: 'center' }}>
        <a style={{display: 'flex'}} href={'https://databend.com/'}><LogoDarkHorizon></LogoDarkHorizon></a>
        <Menu onClick={menuClick} style={{minWidth: '400px', marginLeft: '40px'}} theme="dark" mode="horizontal" selectedKeys={[selectKey]}>
          <Menu.Item key='graphs'>
            <Link to={'/'}>Graphs</Link>  
          </Menu.Item>
          <Menu.Item key="compare">
            <Link to={'/compare'}>compare</Link>
          </Menu.Item>
            <Menu.Item key="status"><Link to={'/status'}>status</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content className="site-layout" style={{ padding: '0 20px', paddingTop: '20px', marginTop: 64 }}>
        <div className="site-layout-background" style={{minHeight: '100vh', background: '#fff', overflowX: 'hidden', paddingBottom: '40px', padding: '20px' }}>
          <Outlet></Outlet>
        </div>
      </Content>
      <Footer></Footer>
    </Layout>
  );
};
export default PerfLayout;
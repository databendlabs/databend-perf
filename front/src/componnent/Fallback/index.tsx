import { FC, ReactElement } from 'react';
import LogoLightVertical from '../../assets/logo/logo-light-vertical';
const Fallback: FC = (): ReactElement=> {
  return (
    <div style={{display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
      <LogoLightVertical></LogoLightVertical>
      <span>...</span>
    </div>
  );
};
export default Fallback;
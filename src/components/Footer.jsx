import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', backgroundColor: '#141414', color: 'white', padding: '16px 0' }}>
      © {new Date().getFullYear()} MovieTicket. All rights reserved.
    </AntFooter>
  );
};

export default Footer;

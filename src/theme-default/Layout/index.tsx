import { Content, usePageData } from '@runtime';
import 'uno.css';
import "../styles/base.css";
import "../styles/vars.css";
import { Nav } from '../components/Nav';
import { HomeLayout } from './HomeLayout';

export function Layout() {
  const pageData = usePageData();
  console.log('pageData', pageData);

  // 获取 pageType
  const { pageType } = pageData;
  // 根据 pageType 分发不同的页面内容
  const getContent = () => {
    if (pageType === 'home') {
      return <HomeLayout />;
    } else if (pageType === 'doc') {
      return <div>正文页面</div>;
    } else {
      return <div>404 页面</div>;
    }
  };
  return <div>
    <Nav /> 
    { getContent() }
    </div>;
}
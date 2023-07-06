import { getSiteInfo } from '@/services/setting';
import { useEffect } from 'react';
import { useModel } from 'umi';

function BasicLayout(props: any) {
  const { initialState, setInitialState } = useModel('@@initialState');

  const { children } = props;
  const { params = {} } = props.match;
  const { siteId = '' } = params;

  const fetchSite = async () => {
    if (siteId) {
      const res = await getSiteInfo();

      const siteInfo = res.code == 1 ? res.data : {};

      const user = await initialState?.fetchUserInfo?.();

      setInitialState({
        ...initialState,
        currentUser: user,
        site: {
          siteInfo,
          siteId,
          mainPage: '',
        },
        settings: {
          ...initialState?.settings,
          layout: 'mix',
          navTheme: 'light',
        },
      });
    }
  };

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  return <>{children}</>;
}

export default BasicLayout;

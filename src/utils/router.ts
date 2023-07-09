import qs from 'qs';
import { history } from 'umi';
import { getSitePath } from './utils';

interface initProps {
  query: any;
  params: any;
}

interface routerProps {
  pathname: string;
  params?: object;
  blank?: boolean;
}

const router = {
  query: {},
  params: {},
  init(props: initProps) {
    this.query = props.query || {};
    this.params = props.params || {};
  },

  push(props: routerProps) {
    const { pathname, params, blank } = props;
    let search = qs.stringify(params);
    if (search) search = '?' + search;

    if (blank) {
      window.open(pathname + search);
      return;
    }
    const sitePath = getSitePath();
    if (typeof props === 'string') {
      // todo 站点id自动添加规则
      // 自动加上siteId
      const path = sitePath + props;
      history.push(path);
      return;
    }
    const path = sitePath + pathname;
    history.push({
      pathname: path,
      search,
    });
  },
  replace(props: routerProps) {
    const { pathname, params } = props;
    let search = qs.stringify(params);
    if (search) search = '?' + search;
    history.replace({
      pathname,
      search,
    });
  },
  goBack() {
    history.goBack();
  },
  getQuery(key?: string, queryStr?: string) {},
  stringifyQuery() {},
};

export default router;

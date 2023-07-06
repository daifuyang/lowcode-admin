// treeToList
export const treeToList = (arr: any, key = 'children') => {
  const list: any = [];
  arr.forEach((item: any) => {
    list.push(item);
    if (item[key]) {
      const children = treeToList(item[key], key);
      list.push(...children);
    }
  });
  return list;
};

// findTreeFirst
export const findTreeFirst = (arr: any = []) => {
  let path = '';
  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];
    if (item?.routes?.length > 0) {
      path = findTreeFirst(item?.routes);
    } else {
      path = item;
    }
    break;
  }
  return path;
};

export const getSiteId = () => {
  const { pathname } = location;
  const regex = /\/(\d+)/;
  const match = pathname.match(regex);
  let siteId = '';
  if (match) {
    siteId = match[1];
  }
  return siteId;
};

export const getLoginPath = () => {
  const siteId = getSiteId();
  return siteId ? `/${siteId}/login` : '/user/login';
};

// 打开设置器
export const openDesign = (id: string) => {
  const siteId = getSiteId();
  const token = localStorage.getItem('token');
  window.open(
    `${(window as any).config.editor}/?scene=console&siteId=${siteId}&pageId=${id}${
      token ? '&token=' + token : ''
    }${(window as any).config.debug ? '&debug' : ''}`,
  );
};

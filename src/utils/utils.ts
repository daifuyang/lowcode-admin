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
      path = item.path;
    }
    break;
  }
  return path;
};

export const getSiteId = () => {
  const { pathname } = location;
  const patten = new RegExp('/[0-9]+');
  const res = patten.exec(pathname);
  let siteId = '';
  if (res?.length > 0) {
    siteId = res[0]?.replaceAll('/', '');
  }
  return siteId;
};

import { getSiteInfo } from '@/services/setting';
import { useEffect, useState } from 'react';
import Ram from '../../admin/Form';

const Index = (props: any) => {
  const [id, setId] = useState('');

  const fetchData = async () => {
    const res = await getSiteInfo();
    if (res.code == 1) {
      setId(res.data?.siteLoginId);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  props.match.params.id = id;

  return <Ram {...props} />;
};
export default Index;

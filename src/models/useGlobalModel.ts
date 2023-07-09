import { useImmer } from 'use-immer';

export default function useGlobalModel() {
  const [global, setGlobal] = useImmer({
    openMenuModal: false,
  });

  return {
    global,
    setGlobal,
  };
}

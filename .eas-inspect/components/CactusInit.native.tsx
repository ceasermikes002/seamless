import { CactusConfig } from '@/services/cactusConfig';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const CactusInit = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      const _req = eval('require');
      const mod = _req('cactus-react-native');
      const lm = CactusConfig.textModel ? new mod.CactusLM({ model: CactusConfig.textModel }) : new mod.CactusLM();
      lm.download({}).finally(() => {
        lm.destroy();
      });
    } catch {}
  }, []);

  return null;
};

export default CactusInit;

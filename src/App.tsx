// Pokemon Searchlight Edition — root App.
// Phase machine: loading → tutorial → playing → complete (→ tutorial …)

import { AnimatePresence } from 'framer-motion';
import { useGame } from './store/gameStore';
import { Loader } from './components/Loader';
import { Tutorial } from './components/Tutorial';
import { Scene } from './components/Scene';
import { Complete } from './components/Complete';

export default function App() {
  const phase = useGame((s) => s.phase);
  const start = useGame((s) => s.start);

  return (
    <div className="relative h-full w-full bg-night-deep">
      {/* Scene is mounted whenever we're past the loader, so when the
          tutorial overlay closes the play surface is ready (no flash). */}
      {phase !== 'loading' && <Scene />}

      <AnimatePresence>
        {phase === 'loading' && <Loader key="loader" onReady={start} />}
        {phase === 'tutorial' && <Tutorial key="tutorial" />}
        {phase === 'complete' && <Complete key="complete" />}
      </AnimatePresence>
    </div>
  );
}

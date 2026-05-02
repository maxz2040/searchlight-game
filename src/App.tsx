// Searchlight Edition — root App.
// Phase machine:
//   loading → tutorial → playing → complete
//                  ↑                  |
//             lobby  ←────────────────┘  (via "Next level" or "All Worlds")

import { AnimatePresence } from 'framer-motion';
import { useGame } from './store/gameStore';
import { Loader } from './components/Loader';
import { Tutorial } from './components/Tutorial';
import { Scene } from './components/Scene';
import { Complete } from './components/Complete';
import { Lobby } from './components/Lobby';

export default function App() {
  const phase = useGame((s) => s.phase);
  const start = useGame((s) => s.start);

  // Scene is pre-mounted whenever gameplay is active or imminent so there's
  // no flash when the Tutorial overlay fades out. It is NOT shown during the
  // loading splash or the level-select lobby (which has its own bg).
  const showScene = phase === 'tutorial' || phase === 'playing' || phase === 'complete';

  return (
    <div className="relative h-full w-full bg-night-deep" data-phase={phase}>
      {showScene && <Scene />}

      <AnimatePresence>
        {phase === 'loading'  && <Loader   key="loader"   onReady={start} />}
        {phase === 'lobby'    && <Lobby    key="lobby"    />}
        {phase === 'tutorial' && <Tutorial key="tutorial" />}
        {phase === 'complete' && <Complete key="complete" />}
      </AnimatePresence>
    </div>
  );
}

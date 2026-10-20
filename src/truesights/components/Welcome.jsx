import React, { useState } from 'react';
import FirstTimeUserScreen from './FirstTimeUserScreen';
import CreateRoadmapModal from './CreateRoadmapModal';

// Starter template badges -> the backend's levels of learning.
const LEVEL_FOR = { 'POST GRADUATE': 'Postgraduate', 'CORE PHYSICS': 'Undergraduate', 'HANDS-ON LAB': 'Undergraduate' };

/** Get Started: a first roadmap from scratch or from a starter template. */
export default function Welcome({ onSkip }) {
  const [creating, setCreating] = useState(null); // { topic, level } while the create modal is open
  return (
    <>
      <FirstTimeUserScreen
        onCreateProject={() => setCreating({ topic: '', level: '' })}
        onLoadSampleProject={(template) => setCreating({ topic: template.title, level: LEVEL_FOR[template.level] || 'Undergraduate' })}
        onBackToDashboard={onSkip}
      />
      {creating && <CreateRoadmapModal initialTopic={creating.topic} initialLevel={creating.level} onClose={() => setCreating(null)} />}
    </>
  );
}

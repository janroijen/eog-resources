import React, { useState } from 'react';

import Metrics, { SelectedMetrics } from './metrics';
import Graph from './graph';
import InfoMessage from './info-message';

export type GraphProps = {
  lagMinutes?: number;
  secondsBetweenUpdates?: number;
};

export default ({ lagMinutes = 30, secondsBetweenUpdates = 1 }: GraphProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetrics>([]);

  return (
    <>
      <Metrics selectedMetrics={selectedMetrics} setSelectedMetrics={setSelectedMetrics} />
      <Graph
        metrics={selectedMetrics}
        lagMinutes={lagMinutes}
        secondsBetweenUpdates={secondsBetweenUpdates}
      />
      <InfoMessage />
    </>
  );
};

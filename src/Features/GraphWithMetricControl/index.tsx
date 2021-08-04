import React, { useState } from 'react';

import Metrics, { SelectedMetrics } from '../Metrics';
import Graph from '../Graph';

export type GraphProps = {
  lagMinutes: number;
};

export default ({ lagMinutes = 30 }: GraphProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetrics>([]);

  return (
    <>
      <Metrics selectedMetrics={selectedMetrics} setSelectedMetrics={setSelectedMetrics} />
      <Graph metrics={selectedMetrics} lagMinutes={lagMinutes} />
    </>
  );
};

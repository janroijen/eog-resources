import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Data } from 'plotly.js';

import {
  ApolloClient,
  ApolloProvider,
  useQuery,
  gql,
  InMemoryCache,
} from '@apollo/client';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Typography } from '@material-ui/core';
import Chip from '../../components/Chip';

const client = new ApolloClient({
  uri: 'https://react.eogresources.com/graphql',
  cache: new InMemoryCache(),
});

const query = gql`
  query($metrics: [MeasurementQuery]) {
    getMultipleMeasurements(
      input: $metrics
    ) {
        metric
        measurements {
          at
          value
          unit
      }
    }
  }
`;

type Measurement = {
  at: number;
  value: number;
  unit: string;
};

type MultipleMeasurements = {
  metric: string;
  measurements: Measurement[];
};

type GraphDataResponse = {
  getMultipleMeasurements: MultipleMeasurements[],
};

export type GraphProps = {
  metrics: string[];
  lagMinutes?: number;
  secondsBetweenUpdates?: number;
};

const Graph = ({ metrics, lagMinutes = 30, secondsBetweenUpdates = 1 }: GraphProps) => {
  const [startTime, setStartTime] = useState(Date.now() - lagMinutes * 60 * 1000);
  const [graphData, setGraphData] = useState<Data[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartTime(Date.now() - lagMinutes * 60 * 1000);
    }, 1000 * secondsBetweenUpdates);

    return () => window.clearInterval(interval);
  }, [setStartTime]);

  const metricsDef = metrics.map(m => ({ metricName: m, after: startTime }));

  const { loading, error, data } = useQuery<GraphDataResponse>(query, {
    variables: { metrics: metricsDef },
  });

  useEffect(() => {
    if (!data) return;

    const newGraphData: Data[] = data.getMultipleMeasurements.map(lineData => {
      const { measurements } = lineData;
      const lastValue = measurements[measurements.length - 1].value;
      const currentTime = Date.now();

      return {
        name: `${lineData.metric} (${lastValue} ${measurements[0].unit})`,
        x: measurements.map(m => (m.at - currentTime) / (60 * 1000)),
        y: measurements.map(m => m.value),
        type: 'scatter',
        mode: 'lines',
      };
    });
    setGraphData(newGraphData);
  }, [data]);

  if (loading && graphData.length === 0) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (graphData.length === 0) return <Chip label="Metrics not found" />;

  return (
    <Plot
      data={graphData}
      layout={{
        width: 1200,
        height: 800,
        autosize: false,
        legend: { orientation: 'h' },
        title: `Last ${lagMinutes} minutes`,
        xaxis: {
          title: { text: 'Minutes' },
          range: [-lagMinutes, 0],
        },
      }}
    />
  );
};

export default ({ metrics, lagMinutes = 30, secondsBetweenUpdates = 1 }: GraphProps) => (
  <ApolloProvider client={client}>
    <Graph
      metrics={metrics}
      lagMinutes={lagMinutes}
      secondsBetweenUpdates={secondsBetweenUpdates}
    />
  </ApolloProvider>
);

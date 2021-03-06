import React, { useState, useEffect } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
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
import { Typography, Container } from '@material-ui/core';
import { toast } from 'react-toastify';

const styleContainer: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '40px',
};

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
    // Only update graph after data has been received (to avoid flickering graph)
    if (!data) return;

    const newGraphData: Data[] = data.getMultipleMeasurements.map(lineData => {
      const { measurements } = lineData;
      const lastValue = measurements && measurements.length > 0
        && measurements[measurements.length - 1].value;
      const currentTime = Date.now();

      return {
        name: `${lineData.metric} (${lastValue} ${measurements[0].unit})`,
        x: measurements.map(m => (m.at - currentTime) / (60 * 1000)),
        y: measurements.map(m => m.value),
        text: measurements.map(m => `<b>${lineData.metric}</b></br></br>Value: ${m.value}</br>Time: ${new Date(m.at).toLocaleTimeString('en-US')}`),
        type: 'scatter',
        mode: 'lines',
        hoverinfo: 'text',
      };
    });
    setGraphData(newGraphData);
  }, [data]);

  if (loading && graphData.length === 0) return <LinearProgress />;
  if (error) {
    toast.error(`Error: ${error}`);
    return null;
  }
  if (graphData.length === 0) return <Typography align='center'>Please select a metric</Typography>;

  return (
    <div style={styleContainer}>
      <Plot
        data={graphData}
        layout={{
          width: 0.90 * document.documentElement.clientWidth,
          height: 0.80 * document.documentElement.clientHeight,
          autosize: false,
          legend: { orientation: 'h' },
          showlegend: true,
          title: `Last ${lagMinutes} minutes`,
          xaxis: {
            title: { text: 'Minutes' },
            range: [-lagMinutes, 0],
          },
        }}
      />
    </div>
  );
};

export default ({ metrics, lagMinutes = 30, secondsBetweenUpdates = 1 }: GraphProps) => (
  <ApolloProvider client={client}>
    <Container>
      <Graph
        metrics={metrics}
        lagMinutes={lagMinutes}
        secondsBetweenUpdates={secondsBetweenUpdates}
      />
    </Container>
  </ApolloProvider>
);

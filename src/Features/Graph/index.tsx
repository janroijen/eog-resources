import React, { useRef } from 'react';
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

type Props = {
  metrics: string[];
  lagMinutes: number;
};

const Graph = ({ metrics, lagMinutes = 30 }: Props) => {
  const startTime = useRef(Date.now() - lagMinutes * 60 * 1000);

  const metricsDef = metrics.map(m => ({ metricName: m, after: startTime.current }));

  const { loading, error, data } = useQuery<GraphDataResponse>(query, {
    variables: { metrics: metricsDef },
  });

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Chip label="Metrics not found" />;

  const graphData = data.getMultipleMeasurements.map(lineData => ({
    metric: lineData.metric,
    at: lineData.measurements.map(m => m.at),
    value: lineData.measurements.map(m => m.value),
  }));

  return (
    <p>{ JSON.stringify(graphData) }</p>
  );
};

export default ({ metrics, lagMinutes = 30 }: Props) => (
  <ApolloProvider client={client}>
    <Graph metrics={metrics} lagMinutes={lagMinutes} />
  </ApolloProvider>
);

import React, { FC, useState } from 'react';
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
  {
    getMetrics
  }
`;

type MetricsDataResponse = {
  getMetrics: string[];
};

type SelectedMetrics = {
  [metric: string]: boolean;
};

const Metrics: FC = () => {
  const { loading, error, data } = useQuery<MetricsDataResponse>(query, {});
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetrics>({});

  const toggleSelectedMetric = (metric: string) => {
    if (selectedMetrics[metric]) {
      setSelectedMetrics({ ...selectedMetrics, [metric]: false });
    } else {
      setSelectedMetrics({ ...selectedMetrics, [metric]: true });
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Chip label="Metrics not found" />;

  const metrics = data.getMetrics;

  return (
    <>
      { metrics.map(m => (
        <button
          type="button"
          key={m}
          onClick={() => toggleSelectedMetric(m)}
          style={{ backgroundColor: selectedMetrics[m] ? 'yellow' : 'white' }}
        >
          {m}
        </button>
      )) }
    </>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Metrics />
  </ApolloProvider>
);

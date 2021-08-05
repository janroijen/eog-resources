import React from 'react';
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

export type SelectedMetrics = string[];

type Props = {
  selectedMetrics: SelectedMetrics;
  setSelectedMetrics: (metrics: SelectedMetrics) => void;
};

const Metrics = ({ selectedMetrics, setSelectedMetrics }: Props) => {
  const { loading, error, data } = useQuery<MetricsDataResponse>(query, {});

  const toggleSelectedMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
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
          style={{ backgroundColor: selectedMetrics.includes(m) ? 'yellow' : 'white' }}
        >
          {m}
        </button>
      )) }
    </>
  );
};

export default ({ selectedMetrics, setSelectedMetrics }: Props) => (
  <ApolloProvider client={client}>
    <Metrics selectedMetrics={selectedMetrics} setSelectedMetrics={setSelectedMetrics} />
  </ApolloProvider>
);

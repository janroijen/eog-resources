import React, { FC } from 'react';
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

const Metrics: FC = () => {
  const { loading, error, data } = useQuery<MetricsDataResponse>(query, {});

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Chip label="Metrics not found" />;

  const metrics = data.getMetrics;

  return (
    <ul>
      { metrics.map(metric => <li>{metric}</li>)}
    </ul>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Metrics />
  </ApolloProvider>
);

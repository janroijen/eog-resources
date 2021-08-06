import React from 'react';
import {
  ApolloClient,
  ApolloProvider,
  useQuery,
  gql,
  InMemoryCache,
} from '@apollo/client';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  Button,
  ButtonGroup,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

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

  const classes = useStyles();

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) {
    toast.error('No metrics available');
    return null;
  }

  const metrics = [...data.getMetrics].sort();

  return (
    <div className={classes.root}>
      <ButtonGroup>
        { metrics.map(m => (
          <Button
            key={m}
            onClick={() => toggleSelectedMetric(m)}
            style={{ backgroundColor: selectedMetrics.includes(m) ? '#dddddd' : 'white' }}
          >
            {m}
          </Button>
        )) }
      </ButtonGroup>
    </div>
  );
};

export default ({ selectedMetrics, setSelectedMetrics }: Props) => (
  <ApolloProvider client={client}>
    <Metrics selectedMetrics={selectedMetrics} setSelectedMetrics={setSelectedMetrics} />
  </ApolloProvider>
);

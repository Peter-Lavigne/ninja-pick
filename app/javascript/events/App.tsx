import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';

interface EventsData {
  events: Array<{
    name: string,
    id: number,
    finished: boolean
  }>,
  organizer: boolean
}

async function fetchEventsData(): Promise<EventsData> {
  const response = await fetch('/api/events.json');
  const json = await response.json();
  return json as EventsData;
}

const dataStates = {
  INITIAL: 1,
  LOADING: 2,
  ERROR: 3,
  SUCCESS: 4
}

export function App() {
  const [dataState, setDataState] = useState(dataStates.INITIAL);
  const [data, setData] = useState(null as EventsData | null);

  useEffect(() => {
    async function loadData() {
      setDataState(dataStates.LOADING)
      try {
        const data = await fetchEventsData();
        setData(data);
        setDataState(dataStates.SUCCESS)
      } catch (_e: any) {
        setDataState(dataStates.ERROR)
      }
    }
    loadData();
  }, []);

  if (dataState === dataStates.INITIAL || dataState === dataStates.LOADING) {
    return null;
  }

  if (dataState === dataStates.ERROR) {
    return <p>'There was an error. Please try again.'</p>
  }

  return (
    <>
      <Container maxWidth='sm'>
        <Typography component='h1' variant='h2' align='center'>Ninja Pick</Typography>
        <Typography align='center' variant='h6' sx={{ marginTop: 2, marginBottom: 1 }}>
          <Link href="/">Back to Leaderboard</Link>
        </Typography>
        {
          data!.organizer && (
            <Typography align='center' variant='h6' sx={{ marginBottom: 1 }}>
              <Link href={`/events/new`}>Create new event</Link>
            </Typography>
          )
        }
        <Typography component='h2' variant='h4' align='center'  >Upcoming Events</Typography>
        {
          data!.events.filter(e => !e.finished).map(event => (
            <Typography align='center' variant='h6'>
              <Link href={`/events/${event.id}`}>{event.name}</Link>
            </Typography>
          ))
        }
        <Typography component='h2' variant='h4' align='center' sx={{ marginTop: 2 }}>Finished Events</Typography>
        {
          data!.events.filter(e => e.finished).map(event => (
            <Typography align='center' variant='h6'>
              <Link href={`/events/${event.id}`}>{event.name}</Link>
            </Typography>
          ))
        }
      </Container>
    </>
  );
}

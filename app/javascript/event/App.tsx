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

function eventId() {
  return window.location.pathname.match(/events\/(\d+)/)![1];
}

type Sex = 'male' | 'female';

interface Ninja {
  name: string,
  sex: Sex,
  position: number | null,
}

interface Pick {
  user: {
    id: number;
    name: string;
  };
  ninja: Ninja;
  placement: number;
  score: number | null;
}

interface EventData {
  event: {
    name: string,
    finished: boolean,
    ninjas: Array<Ninja>,
    picks: Array<Pick>
  },
  organizer: boolean
}

async function fetchEventData(): Promise<EventData> {
  const response = await fetch(`/api/events/${eventId()}.json`);
  const json = await response.json();
  return json as EventData;
}

const dataStates = {
  INITIAL: 1,
  LOADING: 2,
  ERROR: 3,
  SUCCESS: 4
}

interface FormattedPick {
  ninjaName: string;
  placement: number;
  score: number | null;
}

function formatPicks(picks: Pick[]) {
  return picks.reduce((prev, cur) => {
    let user = prev.find(u => u.id === cur.user.id);
    if (user === undefined) {
      user = {
        id: cur.user.id,
        name: cur.user.name,
        malePicks: [],
        femalePicks: []
      }
      prev.push(user);
    }
    if (cur.ninja.sex === 'male') {
      user.malePicks.push({
        ninjaName: cur.ninja.name,
        placement: cur.placement,
        score: cur.score
      })
      user.malePicks.sort((a, b) => a.placement! - b.placement!)
    } else {
      user.femalePicks.push({
        ninjaName: cur.ninja.name,
        placement: cur.placement,
        score: cur.score
      })
      user.femalePicks.sort((a, b) => a.placement! - b.placement!)
    }
    return prev;
  }, [] as Array<{
    id: number,
    name: string,
    malePicks: FormattedPick[],
    femalePicks: FormattedPick[]
  }>)
}

export function App() {
  const [dataState, setDataState] = useState(dataStates.INITIAL);
  const [data, setData] = useState(null as EventData | null);

  useEffect(() => {
    async function loadData() {
      setDataState(dataStates.LOADING)
      try {
        const data = await fetchEventData();
        if (data!.event.finished) {
          data.event.ninjas.sort((a, b) => a.position! - b.position!)
        }
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
          <Link href="/events">Back to Events</Link>
        </Typography>
        <Typography component='h2' variant='h4' align='center' sx={{ marginTop: 2 }}>{data!.event.name}</Typography>
        {
          data!.organizer && (
            <Typography align='center' variant='h6' sx={{ marginTop: 2, marginBottom: 1 }}>
              <Link href={`/events/${eventId()}/edit`}>Edit this event</Link>
            </Typography>
          )
        }
        {
          data!.event.finished ? (
            <Typography align='center' variant='h6' sx={{ marginTop: 2, marginBottom: 1 }}>
              This event is finished. Picks can no longer be made.
            </Typography>
          ) : (
            <Typography align='center' variant='h6' sx={{ marginTop: 2, marginBottom: 1 }}>
              <Link href={`/events/${eventId()}/picks`}>Update picks for this event</Link>
            </Typography>
          )
        }
        <Typography component='h3' variant='h5' align='center' sx={{ marginTop: 2 }}>Male Ninjas</Typography>
        {
          data!.event.ninjas.filter(n => n.sex === 'male').map(ninja => (
            <Typography key={ninja.name} align='center'>{data!.event.finished ? `${ninja.position! + 1} - ` : ''}{ninja.name}</Typography>
          ))
        }
        <Typography component='h3' variant='h5' align='center' sx={{ marginTop: 2 }}>Female Ninjas</Typography>
        {
          data!.event.ninjas.filter(n => n.sex === 'female').map(ninja => (
            <Typography key={ninja.name} align='center'>{data!.event.finished ? `${ninja.position! + 1} - ` : ''}{ninja.name}</Typography>
          ))
        }
        <Typography component='h3' variant='h4' align='center' sx={{ marginTop: 2 }}>Picks</Typography>
        {
          formatPicks(data!.event.picks).map(user => (
            <>
              <Typography variant='h6' align='center' sx={{ marginTop: 1 }}>{user.name}</Typography>
              <Typography align='center'>Male Picks</Typography>
              {
                user.malePicks.map(pick => (
                  <Typography key={pick.ninjaName} align='center'>{pick.placement + 1} - {pick.ninjaName}{pick.score === null ? '' : `(+ ${pick.score / 10})`}</Typography>
                ))
              }
              <Typography align='center' sx={{ marginTop: 1 }}>Female Picks</Typography>
              {
                user.femalePicks.map(pick => (
                  <Typography key={pick.ninjaName} align='center'>{pick.placement + 1} - {pick.ninjaName}{pick.score === null ? '' : `(+ ${pick.score / 10})`}</Typography>
                ))
              }
            </>
          ))
        }
      </Container>
    </>
  );
}

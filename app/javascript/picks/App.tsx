import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import ButtonGroup from '@mui/material/ButtonGroup';
import TableHead from '@mui/material/TableHead';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';

const PICK_COUNT = 3;

type Sex = 'male' | 'female'

interface Pick {
  ninja: Ninja,
  placement: number
}

interface Ninja {
  id: number,
  name: string,
  sex: Sex
}

interface PicksData {
  event: {
    id: number,
    name: string
  },
  ninjas: Array<Ninja>,
  picks: Array<{
    ninja_id: number,
    placement: number
  }>
}

function eventId() {
  return window.location.pathname.match(/events\/(\d+)\//)![1];
}

async function fetchPicksData(): Promise<PicksData> {
  const response = await fetch(`/api/events/${eventId()}/picks.json`);
  const json = await response.json();
  return json as PicksData;
}

interface SavePicksParams {
  event_id: string,
  picks: Array<{
    ninja_id: number,
    placement: number
  }>
}

async function savePicks(params: SavePicksParams, setError: () => void): Promise<void> {
  const csrf = document.querySelector("meta[name='csrf-token']")!.getAttribute("content");
  try {
    const reponse = await fetch(
      `/api/events/${eventId()}/picks`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf!
        },     
      }
    );
  } catch (_e: any) {
    setError();
  }
}

function ninjasBySex(data: PicksData, sex: Sex) {
  return data.ninjas.filter(ninja => ninja.sex === sex)
}

const dataStates = {
  INITIAL: 1,
  LOADING: 2,
  ERROR: 3,
  SUCCESS: 4
}

const colors = {
  0: '#FFD700',
  1: '#C0C0C0',
  2: '#CD7F32'
} as Record<number, string>

interface NinjaButtonProps {
  ninja: Ninja,
  picks: Pick[],
  setPicks: (picks: Pick[]) => void
  setError: () => void
}

function currentPickPlacement(picks: Pick[], sex: Sex): number | null {
  const placementsBySex = picks
    .filter(pick => pick.ninja.sex === sex)
    .map(pick => pick.placement);
  for (let p = 0; p < PICK_COUNT; p++) {
    if (placementsBySex.indexOf(p) === -1) return p;
  }
  return null;
}

const onClickNinjaButton = (
  event: any,
  ninja: Ninja,
  placement: number | null,
  picks: Pick[],
  setPicks: (picks: Pick[]) => void,
  setError: () => void
) => {
  event.preventDefault();
  let newPicks = null as Pick[] | null;
  if (placement === null) {
    const currentPlacement = currentPickPlacement(picks, ninja.sex);
    if (currentPlacement === null) return;
    newPicks = [...picks, {
      ninja,
      placement: currentPlacement
    }]
  } else {
    newPicks = picks.filter(pick => pick.ninja.id !== ninja.id)
  }
  setPicks(newPicks);
  savePicks({
    event_id: eventId(),
    picks: newPicks.map(pick => {
      return {
        ninja_id: pick.ninja.id,
        placement: pick.placement,
      }
    }),
  }, setError);
}

const NinjaButton = (props: NinjaButtonProps) => {
  const { ninja, picks, setPicks, setError } = props;

  const pick = picks.find(pick => pick.ninja.id === ninja.id)
  const placement = pick === undefined ? null : pick.placement;
  const backgroundColor = placement === null ? undefined : colors[placement];

  return (
    <Button
      sx={{
        backgroundColor,
        '&:hover': {
          backgroundColor
        },
      }}
      variant={placement === null ? "outlined" : "contained"}
      disabled={placement === null && currentPickPlacement(picks, ninja.sex) === null}
      onClick={event => onClickNinjaButton(event, ninja, placement, picks, setPicks, setError)}
    >{ninja.name}</Button>
  )
}

export function App() {
  const [dataState, setDataState] = useState(dataStates.INITIAL);
  const [data, setData] = useState(null as PicksData | null);
  const [picks, setPicks] = useState([] as Pick[]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setDataState(dataStates.LOADING)
      try {
        const data = await fetchPicksData();
        setData(data);
        setPicks(data.picks.map(pick => {
          return {
            placement: pick.placement,
            ninja: data.ninjas.find(n => n.id === pick.ninja_id)!
          }
        }))
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
        <Typography align='center' variant='h6' sx={{ marginTop: 2 }}>
          <Link href={`/events/${eventId()}`}>Back to Event</Link>
        </Typography>
        <Typography component='h2' variant='h4' align='center' sx={{ marginTop: 2 }}>{data!.event.name}</Typography>
        { error && (
          <Typography variant='h6' align='center' sx={{ marginTop: 2 }}>Something went wrong saving picks. Please reload the page and try again.</Typography>
        )}
        <Typography component='h3' variant='h6' align='center' sx={{ marginTop: 2 }}>Male Picks</Typography>
        <Stack spacing={1} sx={{ marginTop: 2 }}>
          {
            ninjasBySex(data!, 'male').map(ninja => (
              <NinjaButton
                key={ninja.id}
                ninja={ninja}
                picks={picks}
                setPicks={setPicks}
                setError={() => setError(true)}
              />
            ))
          }
        </Stack>
        <Typography component='h3' variant='h6' align='center' sx={{ marginTop: 2 }}>Female Picks</Typography>
        <Stack spacing={1} sx={{ marginTop: 2 }}>
          {
            ninjasBySex(data!, 'female').map(ninja => (
              <NinjaButton
                key={ninja.id}
                ninja={ninja}
                picks={picks}
                setPicks={setPicks}
                setError={() => setError(true)}
              />
            ))
          }
        </Stack>
      </Container>
    </>
  );
}

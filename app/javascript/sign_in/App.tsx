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

interface LeaderboardData {
  users: Array<{
    name: string,
    events: Array<{
      name: string,
      score: number
    }>
  }>
}

async function fetchLeaderboardData(): Promise<LeaderboardData> {
  const response = await fetch('/api/leaderboard.json');
  const json = await response.json();
  return json as LeaderboardData;
}

const dataStates = {
  INITIAL: 1,
  LOADING: 2,
  ERROR: 3,
  SUCCESS: 4
}

export function App() {
  const [dataState, setDataState] = useState(dataStates.INITIAL);
  const [data, setData] = useState(null as LeaderboardData | null);

  useEffect(() => {
    async function loadData() {
      setDataState(dataStates.LOADING)
      try {
        const data = await fetchLeaderboardData();
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
        <Typography align='center' variant='h5' sx={{ marginTop: 2 }}>
          <Link href="/events">View all events</Link>
        </Typography>
      </Container>
    </>
  );
}

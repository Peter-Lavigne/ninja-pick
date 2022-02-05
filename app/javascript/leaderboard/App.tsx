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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface LeaderboardData {
  users: Array<{
    name: string,
    events: Array<{
      id: number,
      name: string,
      score: number,
      correct_picks: number,
      top_three: number
    }>
  }>,
  signed_in: boolean
}

async function fetchLeaderboardData(): Promise<LeaderboardData> {
  const response = await fetch('/api/leaderboard.json');
  const json = await response.json();
  return json as LeaderboardData;
}

function rows(data: LeaderboardData, tabValue: number) {
  const userRows = data.users.map(user => {
    return {
      name: user.name,
      score: user.events.reduce((prev, cur) => prev + [cur.score, cur.correct_picks, cur.top_three][tabValue], 0) / (tabValue === 0 ? 10 : 1),
      history: user.events.map(({ id, name, score, correct_picks, top_three }) => {
        return {
          id,
          name,
          score: [score / 10, correct_picks, top_three][tabValue]
        }
      })
    }
  });
  userRows.sort((a, b) => b.score - a.score);
  return userRows;
}

function Row(props: any) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.score}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Event History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow: any) => (
                    <TableRow key={historyRow.name}>
                      <TableCell><Link href={`/events/${historyRow.id}`}>{historyRow.name}</Link></TableCell>
                      <TableCell align="right">{historyRow.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
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
  const [tabValue, settabValue] = useState(0);

  const handleChange = (_event: any, newtabValue: number) => {
    settabValue(newtabValue);
  };

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
        {
          !data!.signed_in && (
            <Typography align='center' variant='h5' sx={{ marginTop: 2 }}>
              <Link href="/users/sign_in">Sign In</Link>
            </Typography>
          )
        }
        <Typography align='center' variant='h5' sx={{ marginTop: 2 }}>
          <Link href="/events">View all events</Link>
        </Typography>
        <Typography component='h2' variant='h4' align='center' sx={{ marginTop: 2 }}>Leaderboard</Typography>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleChange}>
              <Tab label="Score" />
              <Tab label="Corect Picks" />
              <Tab label="Top 3 Picks" />
            </Tabs>
          </Box>
        </Box>
        
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows(data!, tabValue).map((row) => (
                <Row key={row.name} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
}

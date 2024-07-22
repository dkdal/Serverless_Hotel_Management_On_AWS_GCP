import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default function AllReviews() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('https://us-central1-sharp-avatar-428014-f8.cloudfunctions.net/allResponse');
        setFeedbacks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <>
      <Navbar />
      <h1>All Reviews</h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper} style={{ margin: '20px', marginRight: '20px' }}>
          <Table aria-label="feedback table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Full Name</StyledTableCell>
                <StyledTableCell>Room Type</StyledTableCell>
                <StyledTableCell align="center">Room Number</StyledTableCell>
                <StyledTableCell align="center">Rating</StyledTableCell>
                <StyledTableCell>Comment</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.map((feedback) => (
                <StyledTableRow key={feedback.bookingCode}>
                  <StyledTableCell component="th" scope="row">
                    {feedback.fullName}
                  </StyledTableCell>
                  <StyledTableCell>{feedback.roomType}</StyledTableCell>
                  <StyledTableCell align="center">{feedback.roomNumber}</StyledTableCell>
                  <StyledTableCell align="center">{feedback.rating}</StyledTableCell>
                  <StyledTableCell>{feedback.comment}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

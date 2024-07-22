import React, { useState } from 'react';
import { TextField, Button, Grid, Container, Typography } from '@mui/material';
import axios from 'axios';

const BookingForm = () => {
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://yiqflea2z8.execute-api.us-east-1.amazonaws.com/dev-cors', {
        room_id: roomId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
      });
      alert('Booking submitted successfully!');
    } catch (error) {
      alert('Error submitting booking');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Book a Room
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              label="Room ID"
              fullWidth
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="User ID"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit Booking
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default BookingForm;
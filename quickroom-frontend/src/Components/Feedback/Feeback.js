import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FeedbackIcon from '@mui/icons-material/Feedback';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';


export default function Feedback() {
  const [formData, setFormData] = useState({
    bookingCode: '',
    fullName: '',
    roomType: '',
    numberOfGuests: '',
    roomPrice: '',
    roomNumber: '',
    rating: 0,
    comment: '',
    totalNights: ''
  });
  const [hover, setHover] = useState(-1);

  const roomTypes = [
    'King',
    'Double',
    'Corporate',
    'Single',
    'Presidential',
    'VIP',
    'Penthouse',
    'Queen'
  ];

  const labels = {
    0.5: 'Useless',
    1: 'Useless+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+',
  };

  function getLabelText(value) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleRatingChange = (event, newValue) => {
    setFormData({
      ...formData,
      rating: newValue
    });
  };

  const handleRatingHover = (event, newHover) => {
    setHover(newHover);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { bookingCode, fullName, roomType, numberOfGuests, roomPrice, roomNumber, rating, comment, totalNights } = formData;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/feedback`, {
        bookingCode,
        fullName,
        roomType,
        numberOfGuests,
        roomPrice,
        roomNumber,
        rating,
        comment,
        totalNights
      });

      if (response.status === 200) {
        alert('Feedback submitted successfully!');
      } else {
        alert('Error submitting feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  return (
    <>
    <Navbar></Navbar>
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <FeedbackIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Feedback Form
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="bookingCode"
                label="Booking Code"
                name="bookingCode"
                value={formData.bookingCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
            <FormControl fullWidth required>
            <InputLabel id="roomType-label">Room Type</InputLabel>
            <Select
              labelId="roomType-label"
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              label="Room Type"
            >
              {roomTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="roomType"
                label="Room Type"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="numberOfGuests"
                label="Number of Guests"
                name="numberOfGuests"
                type="number"
                value={formData.numberOfGuests}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="roomPrice"
                label="Room Price"
                name="roomPrice"
                type="number"
                value={formData.roomPrice}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="roomNumber"
                label="Room Number"
                name="roomNumber"
                type="number"
                value={formData.roomNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating
              name="hover-feedback"
              value={formData.rating}
              precision={0.5}
              getLabelText={getLabelText}
              onChange={handleRatingChange}
              onChangeActive={handleRatingHover}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            {formData.rating !== null && (
              <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : formData.rating]}</Box>
            )}
          </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="comment"
                label="Comment"
                name="comment"
                multiline
                rows={4}
                value={formData.comment}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="totalNights"
                label="Total Number of Nights"
                name="totalNights"
                type="number"
                value={formData.totalNights}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Box>
    </Container>
    </>
    
  );
}

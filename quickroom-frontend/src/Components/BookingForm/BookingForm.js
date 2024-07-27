import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Container, Typography } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library

const BookingForm = () => {
  const [bookingId, setBookingId] = useState(''); // State for bookingId
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [amenities, setAmenities] = useState('');
  const [totalGuest, setTotalGuest] = useState('');
  const [totalNight, setTotalNight] = useState('');
  const [currency, setCurrency] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Generate a new booking ID when the component mounts
    setBookingId(uuidv4()); // Use uuid library to generate a unique ID
  }, []);

  const handleRoomNumberBlur = async () => {
    if (roomNumber) {
      try {
        const roomNumberInt = parseInt(roomNumber, 10);
        const response = await axios.post(
          'https://9kjircr6ld.execute-api.us-east-1.amazonaws.com/v1/fetchRoom',
          {
            RoomNo: roomNumberInt,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data && response.data.room_info) {
          const roomInfo = response.data.room_info;

          setRoomType(roomInfo.RoomType);
          setAmenities(roomInfo.Amenities);
          setTotalGuest(roomInfo.MaxGuests.toString());
          setRoomPrice(roomInfo.PricePerNight.toString());
          setDiscount(roomInfo.Discount.toString());

          // Calculate total price based on room price, total nights, and discount
          const pricePerNight = parseFloat(roomInfo.PricePerNight) || 0;
          const discountAmount = parseFloat(roomInfo.Discount) || 0;
          const totalNights = parseInt(totalNight, 10) || 0;
          const calculatedTotalPrice = (pricePerNight * totalNights - discountAmount).toFixed(2);

          setTotalPrice(calculatedTotalPrice);
        } else {
          console.error('Invalid response structure:', response.data);
        }
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('https://yiqflea2z8.execute-api.us-east-1.amazonaws.com/dev-cors', {
        user_id: userId,
        booking_id: bookingId, // Include generated booking ID
        first_name: firstName,
        last_name: lastName,
        room_number: roomNumber,
        room_type: roomType,
        amenities: amenities,
        total_guest: totalGuest,
        total_night: totalNight,
        currency: currency,
        room_price: roomPrice,
        discount: discount,
        total_price: totalPrice, // Use calculated total price
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
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
              label="User ID"
              fullWidth
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Room Number"
              fullWidth
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              onBlur={handleRoomNumberBlur}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="First Name"
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Last Name"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Room Type"
              fullWidth
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              label="Amenities"
              fullWidth
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Total Guests"
              fullWidth
              value={totalGuest}
              onChange={(e) => setTotalGuest(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Total Nights"
              fullWidth
              value={totalNight}
              onChange={(e) => setTotalNight(e.target.value)}
              onBlur={handleRoomNumberBlur} // Recalculate total price when nights change
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Currency"
              fullWidth
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Room Price"
              fullWidth
              value={roomPrice}
              InputProps={{ readOnly: true }} // Make field read-only
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Discount"
              fullWidth
              value={discount}
              InputProps={{ readOnly: true }} // Make field read-only
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Total Price"
              fullWidth
              value={totalPrice}
              InputProps={{ readOnly: true }} // Make field read-only
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Check-In Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              label="Check-Out Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
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

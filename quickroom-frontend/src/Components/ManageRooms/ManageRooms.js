import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';

export default function ManageRooms() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    RoomNo: '',
    RoomType: '',
    Status: '',
    MaxGuests: '',
    PricePerNight: '',
    Discount: '',
    PriceAfterDiscount: '',
    Amenities: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomExists, setRoomExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'agent') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFetchRoom = async (event) => {
    event.preventDefault();
    const { RoomNo } = formData;

    try {
      const response = await axios.post('https://9kjircr6ld.execute-api.us-east-1.amazonaws.com/v1/fetchRoom', {
        RoomNo: Number(RoomNo)  // Ensure RoomNo is a number
      });

      if (response.data.statusCode === 200 && response.data.room_info) {
        setFormData({
          ...response.data.room_info,
          RoomNo: RoomNo  // keep RoomNo to allow updates
        });
        setRoomExists(true);
      } else {
        setRoomExists(false);
        setFormData({
          RoomNo: RoomNo, // keep RoomNo to allow updates
          RoomType: '',
          Status: '',
          MaxGuests: '',
          PricePerNight: '',
          Discount: '',
          PriceAfterDiscount: '',
          Amenities: ''
        });
      }
      setStep(2);
    } catch (error) {
      console.error('Error fetching room details:', error);
      setRoomExists(false);
      setFormData({
        RoomNo: RoomNo,
        RoomType: '',
        Status: '',
        MaxGuests: '',
        PricePerNight: '',
        Discount: '',
        PriceAfterDiscount: '',
        Amenities: ''
      });
      setStep(2);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      RoomNo,
      RoomType,
      Status,
      MaxGuests,
      PricePerNight,
      Discount,
      PriceAfterDiscount,
      Amenities
    } = formData;

    if (!RoomNo || !RoomType || !Status || !MaxGuests || !PricePerNight || !Discount || !PriceAfterDiscount || !Amenities) {
      alert('All fields are required');
      return;
    }

    const payload = {
      RoomNo: RoomNo.toString(),
      RoomType: RoomType.toString(),
      Status: Status.toString(),
      MaxGuests: MaxGuests.toString(),
      PricePerNight: PricePerNight.toString(),
      Discount: Discount.toString(),
      PriceAfterDiscount: PriceAfterDiscount.toString(),
      Amenities: Amenities.toString()
    };

    try {
      const response = await axios.post('https://9kjircr6ld.execute-api.us-east-1.amazonaws.com/v1/addRoom', payload);

      if (response.status === 200) {
        alert(`Room ${roomExists ? 'updated' : 'created'} successfully!`);
        setFormData({
          RoomNo: '',
          RoomType: '',
          Status: '',
          MaxGuests: '',
          PricePerNight: '',
          Discount: '',
          PriceAfterDiscount: '',
          Amenities: ''
        });
        setRoomExists(false);
        setStep(1);
      } else {
        alert('Error submitting room details');
      }
    } catch (error) {
      console.error('Error submitting room details:', error);
      alert('Error submitting room details');
    }
  };

  if (!isAdmin) {
    return (
      <>
        <Navbar />
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
            <Typography component="h1" variant="h5">
              Admin Access Required
            </Typography>
            <Typography component="p" variant="body1" sx={{ mt: 3 }}>
              Only admins are allowed to see this page.
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
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
          {step === 1 ? (
            <>
              <Typography component="h1" variant="h5">
                Enter Room Number
              </Typography>
              <Box component="form" noValidate onSubmit={handleFetchRoom} sx={{ mt: 3 }}>
                <TextField
                  required
                  fullWidth
                  id="RoomNo"
                  label="Room Number"
                  name="RoomNo"
                  value={formData.RoomNo}
                  onChange={handleChange}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Fetch Room
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography component="h1" variant="h5">
                Room Management
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="RoomNo"
                      label="Room Number"
                      name="RoomNo"
                      value={formData.RoomNo}
                      onChange={handleChange}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="RoomType"
                      label="Room Type"
                      name="RoomType"
                      value={formData.RoomType}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="Status"
                      label="Status"
                      name="Status"
                      value={formData.Status}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="MaxGuests"
                      label="Max Guests"
                      name="MaxGuests"
                      value={formData.MaxGuests}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="PricePerNight"
                      label="Price Per Night"
                      name="PricePerNight"
                      value={formData.PricePerNight}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="Discount"
                      label="Discount"
                      name="Discount"
                      value={formData.Discount}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="PriceAfterDiscount"
                      label="Price After Discount"
                      name="PriceAfterDiscount"
                      value={formData.PriceAfterDiscount}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="Amenities"
                      label="Amenities"
                      name="Amenities"
                      value={formData.Amenities}
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
                  {roomExists ? 'Update Room' : 'Create Room'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </>
  );
}

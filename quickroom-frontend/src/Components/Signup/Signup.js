import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import  { getUserPool } from '../../UserPool';
import { Link, useNavigate } from 'react-router-dom';


export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    question: 'What was the name of your first pet?',
    answer: '',
    cipherKey: 1,
    userType: 'customer'
  });
  const navigate = useNavigate()

  const securityQuestions = [
    "What was the name of your first pet?",
    "What is your mother's Firstname?",
    "What sport do you like?",
    "What is the name of the town where you were born?"
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password, firstName, lastName, question, answer, cipherKey, userType } = formData;

    const userPool = getUserPool(userType)

    try {
      userPool.signUp(email, password, [], null, async (err, data) => {
        if (err) {
          console.log(err);
          alert('Error signing up: ' + err.message);
          return;
        }
        console.log(data);

        //Store additional details in DynamoDB
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/signup`, {
            body: JSON.stringify({
              email,
              firstName,
              lastName,
              role: userType,
              question,
              answer,
              cipher_key: cipherKey,
            })
          });

          if (response.status === 200) {
            alert('Sign up successful!');
            await axios.post(`https://8hzds97iz5.execute-api.us-east-1.amazonaws.com/prod/notifications/registration`,
              {
                email: email
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
            alert('Verify your email to login successfully and registration email has also been sent')
            navigate('/login')
          } else {
            alert('Error storing user details');
          }
        } catch (error) {
          console.error('Error storing user details:', error);
          alert('Error storing user details');
        }
      });
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Error signing up');
    }
  };

  return (
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
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                name="question"
                id="question"
                SelectProps={{ native: true }}
                value={formData.question}
                onChange={handleChange}
              >
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="answer"
                label="Answer"
                id="answer"
                value={formData.answer}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="cipherKey"
                label="Cipher Key (1-25)"
                type="number"
                id="cipherKey"
                inputProps={{ min: 1, max: 25 }}
                value={formData.cipherKey}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                name="userType"
                label="Sign Up As"
                id="userType"
                SelectProps={{ native: true }}
                value={formData.userType}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
              </TextField>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}

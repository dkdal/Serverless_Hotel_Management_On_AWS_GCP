import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import axios from 'axios';
import { getUserPool } from '../../UserPool';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import { Link,useNavigate } from 'react-router-dom';

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [cipherKey, setCipherKey] = useState(0);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [cipherAnswer, setCipherAnswer] = useState('');
  const [randomWord, setRandomWord] = useState('');
  const [dbAnswer, setDbAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [cipheredText, setCipheredText] = useState('');
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    setEmail(email);
    setPassword(password);
  
    const userPool = getUserPool(role);
  
    const user = new CognitoUser({
      Username: email,
      Pool: userPool
    });
  
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
  
    user.authenticateUser(authDetails, {
      onSuccess: async (data) => {
        console.log("onSuccess: ", data);
  
        setLoading(true);
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/signin`, {
            body: JSON.stringify({
              email,
              role: role
            })
          });
          const userData = JSON.parse(response.data.body);
          setSecurityQuestion(userData.question);
          setCipherKey(Number(userData.cipher_key));
          setDbAnswer(userData.answer);
  
          // Generate a random word
          const randomWord = generateRandomWord();
          setRandomWord(randomWord);
  
          // Generate ciphered text
          const cipheredText = applyShiftCipher(randomWord, cipherKey);
          setCipheredText(cipheredText);
  
          setLoading(false);
          setStep(2); // Proceed to the security question step
        } catch (error) {
          console.error('Error fetching user details:', error);
          alert('Error fetching user details');
          setLoading(false);
        }
      },
  
      onFailure: (err) => {
        console.log("onFailure: ", err);
        alert('Authentication failed: ' + err.message);
      },
  
      newPasswordRequired: (data) => {
        console.log("newPasswordRequired: ", data);
      }
    });
  };
  

  const handleVerificationSubmit = async (event) => {
    event.preventDefault();
    if (step === 2) {
      // Handle security answer validation
      if (securityAnswer !== dbAnswer) {
        alert('Security answer is incorrect');
        return;
      }
      setStep(3); // Proceed to the cipher verification step
    } else if (step === 3) {
      // Handle cipher answer validation
      const decipheredText = applyShiftCipher(cipherAnswer, -cipherKey);
      if (decipheredText !== randomWord) {
        alert('Cipher key answer is incorrect');
        return;
      }
      await axios.post(`https://8hzds97iz5.execute-api.us-east-1.amazonaws.com/prod/notifications/login`,
        {
          email: email
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const response = await axios.post('https://us-central1-sharp-avatar-428014-f8.cloudfunctions.net/savelogin', {
        email,
        role
      });
      if (response.status === 200) {
        alert('Login successful!');
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        navigate("/");
      } else {
        console.error('Error logging in:', response.data.error);
      }
    }
  };
  

  const generateRandomWord = () => {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'school', 'academics', 'Utopia'];
    return words[Math.floor(Math.random() * words.length)];
  };

  const applyShiftCipher = (text, shift) => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(start + (char.charCodeAt(0) - start + shift + 26) % 26);
    });
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: 'url(https://unsplash.it/1920/1080?random)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {step === 1 ? 'Sign in' : step === 2 ? 'Security Verification' : 'Cipher Verification'}
          </Typography>
          {step === 1 ? (
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="role-label">Sign in as</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Sign in as"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item>
                  <Link to="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          ) : step === 2 ? loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" noValidate onSubmit={handleVerificationSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="securityAnswer"
                label={securityQuestion}
                name="securityAnswer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Submit Answer
              </Button>
            </Box>
          ) : (
            <Box component="form" noValidate onSubmit={handleVerificationSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="cipheredText"
                label={`${cipheredText} (Cipher text using your key)`}
                name="cipherAnswer"
                value={cipherAnswer}
                onChange={(e) => setCipherAnswer(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Verify
              </Button>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
  
}

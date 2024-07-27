import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import bookingLogo from '../../bookingcom.svg';
import { useNavigate } from 'react-router-dom';

const pages = ['Rooms', 'Reviews', 'Feedback', 'Book Room'];
const settings = ['Dashboard', 'ManageRooms', 'Logout'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!email);
    setUserRole(role);
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (setting) => {
    setAnchorElUser(null);
    if (setting === 'Dashboard') {
      navigate("/dashboard");
    } else if (setting === 'ManageRooms') {
      navigate("/managerooms");
    } else if (setting === 'Logout') {
      handleLogout(); 
      navigate("/");
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handlePageClick = (page) => {
    if (page === 'Rooms') {
      navigate("/rooms");
    } else if (page === 'Reviews') {
      navigate("/reviews");
    } else if (page === 'Feedback') {
      navigate("/feedback");
    } else if (page === 'Book Room') {
      navigate("/bookings")
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img src={bookingLogo} alt="Logo" style={{ height: '3%', width: '3%', cursor: 'pointer' }} onClick={handleLogoClick} />
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handlePageClick(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handlePageClick(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={() => handleCloseUserMenu(null)}
                >
                  {settings.map((setting) => (
                    (setting === 'Dashboard' && userRole !== 'agent') ? null : (
                      <MenuItem
                        key={setting}
                        onClick={() => handleCloseUserMenu(setting)}
                      >
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    )
                  ))}
                </Menu>
              </>
            ) : (
              <Button onClick={handleLogin} sx={{ my: 2, color: 'white', display: 'block' }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;

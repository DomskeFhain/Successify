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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContex/AuthContex';
import logo from '../../assets/logo-v2.png';

const pages = [{ name: "Scheduler", link: "/scheduler" }, { name: "Finances", link: "/finances" }, { name: "Shopping-List", link: "/shoppinglist" }, { name: "To-Do", link: "/todo" }, { name: "Pomodoro-Timer", link: "/pomodoro" }];


function Navbar() {
  const { token, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };



  return (
    <AppBar position="static" sx={{ backgroundColor: "white" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img
            src={logo}
            alt="Logo"
            onClick={() => { navigate("/") }}
            className="navbar-logo-desktop"
            style={{ height: '80px', marginRight: '8px', cursor: 'pointer', display: 'none' }}
          />
          <img
            src={logo}
            alt="Logo"
            onClick={() => { navigate("/") }}
            className="navbar-logo-mobile"
            style={{ height: '80px', marginRight: '8px', cursor: 'pointer', display: 'flex' }}
          />
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: '#8B0000' }}
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
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={() => { handleCloseNavMenu(); navigate(page.link) }}>
                  <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => { handleCloseNavMenu(); navigate(page.link) }}
                sx={{ my: 2, color: '#8B0000', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 1, alignItems: 'center' }}>
            {token ? (<><Tooltip title="Open settings">
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
                onClose={handleCloseUserMenu}
              >

                <MenuItem key="Profile" onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                  <Typography sx={{ textAlign: 'center' }}>Profile</Typography>
                </MenuItem>
                <MenuItem key="Logout" onClick={() => { handleCloseUserMenu(); logout(); navigate('/'); }}>
                  <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                </MenuItem>

              </Menu></>) : (
              <>
                <Button onClick={() => navigate("/register")} sx={{ color: '#8B0000', display: { xs: 'flex', md: 'flex' } }}>
                  Register
                </Button>
                <Button onClick={() => navigate("/login")} sx={{ color: '#8B0000', display: { xs: 'flex', md: 'flex' } }}>
                  Login
                </Button>
              </>
            )}

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;

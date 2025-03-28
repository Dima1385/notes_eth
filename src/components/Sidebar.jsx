import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import { 
  Home as HomeIcon,
  Note as NoteIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountBalanceWallet as WalletIcon,
  LogoutOutlined as LogoutIcon
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

const drawerWidth = 240;

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const { account, networkName, disconnectWallet } = useWeb3();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/'
    },
    {
      text: 'Notes',
      icon: <NoteIcon />,
      path: '/notes'
    }
  ];

  // Abbreviate the wallet address for display
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 65,
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 65,
          overflowX: 'hidden',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxSizing: 'border-box',
          backgroundColor: '#121212',
          borderRight: '1px solid #333',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        {open && <Typography variant="h6" component="div" sx={{ color: '#90caf9' }}>ETH Notes</Typography>}
        <IconButton onClick={toggleDrawer} sx={{ color: '#fff' }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ backgroundColor: '#333' }} />

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        my: 2, 
        justifyContent: 'center', 
        width: '100%'
      }}>
        <Avatar sx={{ mb: 1, bgcolor: '#1e88e5', width: open ? 60 : 40, height: open ? 60 : 40 }}>
          <WalletIcon />
        </Avatar>
        {open && (
          <>
            <Typography variant="subtitle2" sx={{ color: '#fff', mt: 1 }}>
              {shortenAddress(account)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#bbb' }}>
              {networkName}
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ backgroundColor: '#333' }} />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: '#333',
                  '&:hover': {
                    backgroundColor: '#444',
                  },
                },
                '&:hover': {
                  backgroundColor: '#222',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? '#90caf9' : '#fff',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText primary={item.text} sx={{ color: '#fff' }} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-start', 
        p: 2, 
        position: 'sticky',
        bottom: 0,
        left: 0
      }}>
        <Tooltip title="Disconnect wallet">
          <IconButton 
            onClick={disconnectWallet} 
            size="small"
            sx={{ 
              color: '#f44336',
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: 1,
              p: 0.8,
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.2)',
              }
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {open && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#aaa', 
              ml: 1.5, 
              alignSelf: 'center', 
              fontSize: '0.7rem',
              userSelect: 'none'
            }}
          >
            Disconnect
          </Typography>
        )}
      </Box>
    </Drawer>
  );
} 
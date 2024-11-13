import { useState } from 'react'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import MenuIcon from '@mui/icons-material/Menu'
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Box,
  Collapse,
  ListItemButton,
} from '@mui/material'

import { useQuery } from '@redwoodjs/web'

import { useAuth } from 'src/auth'

const SUBMISSIONS_QUERY = gql`
  query SubmissionsQuery {
    submissions {
      id
      location
      lat
      lon
      weather
      clothing
      createdAt
    }
  }
`

type SidebarProps = {
  onSubmissionSelect: (submission: any) => void
}

const Sidebar = ({ onSubmissionSelect }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const { isAuthenticated, currentUser, logOut, logIn } = useAuth()
  const { data, loading } = useQuery(SUBMISSIONS_QUERY, {
    skip: !isAuthenticated,
  })

  const firstName =
    currentUser?.given_name ||
    currentUser?.name?.split(' ')[0] ||
    currentUser?.nickname ||
    currentUser?.email?.split('@')[0]

  const handleLogOut = async () => {
    try {
      await logOut({
        returnTo: window.location.origin,
      })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleSignIn = async () => {
    try {
      await logIn()
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleSubmissionClick = (submission) => {
    onSubmissionSelect(submission)
    setIsOpen(false) // Close sidebar after selection
  }

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{ position: 'absolute', left: 24, top: 16 }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)}>
        <Box
          sx={{
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {isAuthenticated && (
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                Welcome back
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLogOut}
                sx={{
                  textTransform: 'none',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  minWidth: 'auto',
                }}
              >
                Log Out
              </Button>
            </Box>
          )}

          <Box sx={{ p: 3, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Previous Submissions
            </Typography>
            {isAuthenticated ? (
              <List>
                {loading ? (
                  <ListItem>
                    <ListItemText primary="Loading..." />
                  </ListItem>
                ) : data?.submissions?.length ? (
                  data.submissions.map((submission) => (
                    <Box key={submission.id}>
                      <ListItemButton
                        onClick={() => handleSubmissionClick(submission)}
                      >
                        <ListItemText
                          primary={submission.location}
                          secondary={formatDate(submission.createdAt)}
                        />
                      </ListItemButton>
                    </Box>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No submissions yet" />
                  </ListItem>
                )}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ mb: 2 }}>
                  Sign in to view your previous submissions
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSignIn}
                  sx={{
                    backgroundColor: '#2196f3',
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default Sidebar

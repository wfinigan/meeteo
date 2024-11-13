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
  const { isAuthenticated, signUp } = useAuth()
  const { data, loading } = useQuery(SUBMISSIONS_QUERY, {
    skip: !isAuthenticated,
  })

  const handleSignUp = async () => {
    try {
      await signUp({
        redirectTo: window.location.origin,
        appState: {
          targetUrl: window.location.pathname,
        },
      })
    } catch (error) {
      console.error('Auth error:', error)
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
        <Box sx={{ width: 300, p: 3 }}>
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
                onClick={handleSignUp}
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
      </Drawer>
    </>
  )
}

export default Sidebar

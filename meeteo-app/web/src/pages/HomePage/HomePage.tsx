import { useState } from 'react'

import CloudIcon from '@mui/icons-material/Cloud'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import {
  TextField,
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link as MuiLink,
  Collapse,
  IconButton,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import { Form, Submit } from '@redwoodjs/forms'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

type UnsplashImage = {
  url: string;
  photographerName: string;
  photographerUrl: string;
}

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessageMutation($message: String!) {
    sendMessage(message: $message) {
      location {
        place_name
        lat
        lon
      }
      weather {
        temp
        feels_like
        humidity
        description
      }
      clothing {
        footwear {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
        top {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
        bottom {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
        accessories {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
        wildcard1 {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
        wildcard2 {
          recommendation
          productTitle
          purchaseUrl
          image
          photographer
          photographerUrl
          imageId
        }
      }
    }
  }
`

const HomePage = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION)
  const [result, setResult] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [showExample, setShowExample] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const resetState = () => {
    setResult(null)
    setInputValue('')
    setShowExample(true)
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      setShowExample(false)
      const response = await sendMessage({
        variables: { message: inputValue },
      })
      setResult(response.data.sendMessage)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, bgcolor: 'transparent' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: { xs: 8, sm: 10 },
            mt: { xs: 4, sm: 8 },
          }}
        >
          <Typography
            component="h1"
            sx={{
              display: 'flex',
              fontFamily: '"Darker Grotesque", sans-serif',
              fontSize: {
                xs: '3.5rem', // mobile (56px)
                sm: '5.5rem', // tablet (88px)
                md: '7rem', // desktop (112px)
                lg: '8.5rem', // large desktop (136px)
              },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            <Link
              to={routes.home()}
              style={{ textDecoration: 'none', display: 'flex' }}
              onClick={resetState}
            >
              <Typography
                component="span"
                sx={{
                  color: '#000',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              >
                Meet
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: '#2196f3',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              >
                Eo
              </Typography>
            </Link>
          </Typography>
        </Box>
        <Form onSubmit={onSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              name="message"
              label="Describe a location"
              variant="outlined"
              fullWidth
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '8px',
                },
              }}
            />
            <Box
              sx={{
                minWidth: '140px',
                '& button': {
                  // This targets the Submit button inside
                  width: '100%',
                  height: '56px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  border: 'none',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                  '&:disabled': {
                    backgroundColor: '#2196f3',
                    opacity: 0.5,
                  },
                },
              }}
            >
              <Submit disabled={loading || inputValue.trim().length === 0}>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Ask Eo'
                )}
              </Submit>
            </Box>
          </Box>
          {showExample && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Try an example:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setInputValue('City where the Boston Red Sox play')
                }
                sx={{
                  textTransform: 'none',
                  mr: 1,
                }}
              >
                City where the Boston Red Sox play
              </Button>
            </Box>
          )}
        </Form>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {result.location.place_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {result.location.lat.toFixed(4)}°N,{' '}
                {result.location.lon.toFixed(4)}°W
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <ThermostatIcon color="primary" />
                        <Typography variant="h6" component="div">
                          Temperature
                        </Typography>
                      </Box>
                      <Box>
                        <Typography component="div" variant="body1">
                          {result.weather.temp}°F
                        </Typography>
                        <Typography
                          component="div"
                          variant="body2"
                          color="text.secondary"
                        >
                          Feels like: {result.weather.feels_like}°F
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <WaterDropIcon color="primary" />
                        <Typography variant="h6" component="div">
                          Humidity
                        </Typography>
                      </Box>
                      <Typography component="div" variant="body1">
                        {result.weather.humidity}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} sm={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <CloudIcon color="primary" />
                        <Typography variant="h6" component="div">
                          Conditions
                        </Typography>
                      </Box>
                      <Typography component="div" variant="body1">
                        {result.weather.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
                Suggested Outfit
              </Typography>
              <Box
                sx={{
                  columnCount: {
                    xs: 2,
                    sm: 3,
                  },
                  columnGap: 2,
                }}
              >
                {[
                  { label: 'Footwear', item: result.clothing.footwear },
                  { label: 'Top', item: result.clothing.top },
                  { label: 'Weather Bonus', item: result.clothing.wildcard1 },
                  { label: 'Style Boost', item: result.clothing.wildcard2 },
                  { label: 'Bottom', item: result.clothing.bottom },
                  { label: 'Accessories', item: result.clothing.accessories },
                ].map((item) => (
                  <Card
                    key={item.label}
                    sx={{
                      display: 'inline-block',
                      width: '100%',
                      height: 'auto',
                      overflow: 'hidden',
                      boxShadow: 'none',
                      mb: 2,
                      borderRadius: 0,
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={item.item.image}
                        alt={item.label}
                        style={{
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onLoad={() => {
                          // Trigger download event when image is loaded
                          fetch(`https://api.unsplash.com/photos/${item.item.imageId}/download`, {
                            headers: {
                              Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                            },
                          })
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          p: 1,
                          textAlign: 'center',
                        }}
                      >
                        Photo by{' '}
                        <MuiLink
                          href={item.item.photographerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: 'white' }}
                        >
                          {item.item.photographer}
                        </MuiLink>{' '}
                        on{' '}
                        <MuiLink
                          href="https://unsplash.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: 'white' }}
                        >
                          Unsplash
                        </MuiLink>
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>

              <Box sx={{ mt: 8 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    mb: 3,
                  }}
                  onClick={() => setDetailsOpen(!detailsOpen)}
                >
                  <Typography variant="h5" component="h2">
                    Item Details
                  </Typography>
                  <IconButton
                    aria-label="toggle details"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    {detailsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </Box>

                <Collapse in={detailsOpen}>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{
                      minWidth: 650,
                      '& th, & td': {
                        borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
                        padding: '16px',
                      },
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              backgroundColor: 'transparent',
                              fontSize: '0.875rem',
                              letterSpacing: '0.01em',
                            }}
                          >
                            Recommendation
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              backgroundColor: 'transparent',
                              fontSize: '0.875rem',
                              letterSpacing: '0.01em',
                            }}
                          >
                            Product Idea
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { label: 'Footwear', item: result.clothing.footwear },
                          { label: 'Top', item: result.clothing.top },
                          { label: 'Bottom', item: result.clothing.bottom },
                          { label: 'Accessories', item: result.clothing.accessories },
                          { label: 'Weather Bonus', item: result.clothing.wildcard1 },
                          { label: 'Style Boost', item: result.clothing.wildcard2 },
                        ].map(({ label, item }) => (
                          <TableRow
                            key={label}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              },
                            }}
                          >
                            <TableCell sx={{ color: 'text.primary' }}>
                              {item.recommendation}
                            </TableCell>
                            <TableCell>
                              <MuiLink
                                href={item.purchaseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  color: '#2196f3',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                  fontWeight: 500,
                                }}
                              >
                                {item.productTitle}
                              </MuiLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Collapse>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default HomePage

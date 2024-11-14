import { useState, useRef } from 'react'

import CloudIcon from '@mui/icons-material/Cloud'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import UploadIcon from '@mui/icons-material/Upload'
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

import { Form, Submit } from '@redwoodjs/forms'
import { Link, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import { useAuth } from 'src/auth'
import Sidebar from 'src/components/Sidebar/Sidebar'

type UnsplashImage = {
  url: string
  photographerName: string
  photographerUrl: string
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

const INITIATE_ANALYSIS_MUTATION = gql`
  mutation InitiateAnalysisMutation($input: AnalyzeOutfitInput!) {
    initiateAnalysis(input: $input) {
      analysisId
      status
      error
    }
  }
`

const GET_ANALYSIS_STATUS_MUTATION = gql`
  mutation GetAnalysisStatusMutation($analysisId: String!) {
    getAnalysisStatus(analysisId: $analysisId) {
      status
      feedback
    }
  }
`

const HomePage = () => {
  const { isAuthenticated, signUp, currentUser, logOut } = useAuth()

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

  const handleLogOut = async () => {
    try {
      await logOut({ returnTo: window.location.origin })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION)
  const [result, setResult] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [showExample, setShowExample] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const fileInputRef = useRef(null)
  const [typingFeedback, setTypingFeedback] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasUploaded, setHasUploaded] = useState(false)
  const [error, setError] = useState(null)

  const [initiateAnalysis] = useMutation(INITIATE_ANALYSIS_MUTATION)
  const [getAnalysisStatus] = useMutation(GET_ANALYSIS_STATUS_MUTATION)

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

  const handleSubmissionSelect = (submission) => {
    setResult({
      location: {
        place_name: submission.location,
        lat: submission.lat,
        lon: submission.lon,
      },
      weather: submission.weather,
      clothing: submission.clothing,
    })
    setShowExample(false)
  }

  const typewriterEffect = (text) => {
    setIsTyping(true)
    setTypingFeedback('')
    let index = 0

    const typewriter = setInterval(() => {
      if (index < text.length) {
        setTypingFeedback(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(typewriter)
        setIsTyping(false)
      }
    }, 25)

    return () => clearInterval(typewriter)
  }

  const loadingDotsEffect = () => {
    let dots = ''
    return setInterval(() => {
      dots = dots.length >= 3 ? '' : dots + '.'
      setTypingFeedback(`Analyzing${dots}`)
    }, 500)
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsAnalyzing(true)
      setHasUploaded(true)
      const loadingInterval = loadingDotsEffect()

      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Image = e.target.result as string
        console.log('Image format check:', {
          startsWithData: base64Image.startsWith('data:image/'),
          length: base64Image.length,
        })

        const initResponse = await initiateAnalysis({
          variables: {
            input: {
              image: base64Image,
              weather: {
                temp: result.weather.temp,
                feelsLike: result.weather.feels_like,
                description: result.weather.description,
              },
            },
          },
        })

        if (initResponse.data.initiateAnalysis.analysisId) {
          const pollInterval = setInterval(async () => {
            const statusResponse = await getAnalysisStatus({
              variables: {
                analysisId: initResponse.data.initiateAnalysis.analysisId,
              },
            })

            const status = statusResponse.data.getAnalysisStatus
            if (status.status === 'completed') {
              clearInterval(pollInterval)
              clearInterval(loadingInterval)
              setIsAnalyzing(false)
              typewriterEffect(status.feedback)
            } else if (status.status === 'error') {
              clearInterval(pollInterval)
              clearInterval(loadingInterval)
              setIsAnalyzing(false)
              toast.error('Analysis failed')
            }
          }, 2000)
        } else {
          clearInterval(loadingInterval)
          setIsAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setIsAnalyzing(false)
      console.error('Upload error:', error)
      toast.error('Failed to analyze image')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Sidebar onSubmissionSelect={handleSubmissionSelect} />

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
            <Paper
              elevation={1}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 3, sm: 0 },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                backgroundColor: '#f3e5f5',
                border: '1px solid #e1bee7',
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 400,
                  flexGrow: 1,
                  wordWrap: 'break-word',
                }}
              >
                {isAnalyzing || isTyping || typingFeedback
                  ? typingFeedback
                  : "Check your fit: Upload an image to ask Eo if it's a good match for the weather"}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                }}
              >
                {!hasUploaded && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#9c27b0',
                      letterSpacing: '0.1em',
                      flexShrink: 0,
                    }}
                  >
                    NEW
                  </Typography>
                )}
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    backgroundColor: '#9c27b0',
                    '&:hover': {
                      backgroundColor: '#7b1fa2',
                    },
                    textTransform: 'none',
                    flexShrink: 0,
                  }}
                >
                  Upload Image
                </Button>
              </Box>
            </Paper>

            <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {result.location.place_name}
              </Typography>
              {result.location.lat !== 0 && result.location.lon !== 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {result.location.lat.toFixed(2)}°N,{' '}
                  {result.location.lon.toFixed(2)}°W
                </Typography>
              )}

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
                          {Math.round(result.weather.temp)}°F
                        </Typography>
                        <Typography
                          component="div"
                          variant="body2"
                          color="text.secondary"
                        >
                          Feels like: {Math.round(result.weather.feels_like)}°F
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
                Your outfit mood board
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
                          if (!selectedSubmission && item.item.imageId) {
                            fetch(
                              `https://api.unsplash.com/photos/${item.item.imageId}/download`,
                              {
                                headers: {
                                  Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
                                },
                              }
                            )
                          }
                        }}
                      />
                      {item.item.photographer &&
                        item.item.photographerUrl?.includes('unsplash.com') && (
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
                        )}
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
                    Recreate the fit
                  </Typography>
                  <IconButton
                    aria-label="toggle details"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    {detailsOpen ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </Box>

                <Collapse in={detailsOpen}>
                  <Box>
                    {[
                      { label: 'Footwear', item: result.clothing.footwear },
                      { label: 'Top', item: result.clothing.top },
                      { label: 'Bottom', item: result.clothing.bottom },
                      {
                        label: 'Accessories',
                        item: result.clothing.accessories,
                      },
                      {
                        label: 'Weather Bonus',
                        item: result.clothing.wildcard1,
                      },
                      { label: 'Style Boost', item: result.clothing.wildcard2 },
                    ].map(({ label, item }) => {
                      // Extract base URL
                      const baseUrl = item.purchaseUrl
                        ? new URL(item.purchaseUrl).hostname.replace('www.', '')
                        : ''

                      return (
                        <Box
                          key={label}
                          sx={{
                            mb: 3,
                            pb: 3,
                            borderBottom: '1px solid rgba(224, 224, 224, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              mb: 1,
                            }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            sx={{
                              mb: 2,
                              flexGrow: 1,
                            }}
                          >
                            {item.recommendation}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                              }}
                            >
                              {baseUrl && `${baseUrl}:`}
                            </Typography>
                            <MuiLink
                              href={item.purchaseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: '#2196f3',
                                textDecoration: 'none',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              {item.productTitle}
                            </MuiLink>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Collapse>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </Container>
  )
}

export default HomePage

import { Form, Submit } from '@redwoodjs/forms'
import { useMutation } from '@redwoodjs/web'
import { useState } from 'react'
import {
  TextField,
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import CloudIcon from '@mui/icons-material/Cloud'

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessageMutation($message: String!) {
    sendMessage(message: $message) {
      city
      state
      weather {
        temp
        feels_like
        humidity
        description
      }
      clothing {
        footwear
        top
        bottom
        accessories
        wildcard1
        wildcard2
      }
    }
  }
`

const MyPagePage = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION)
  const [result, setResult] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    try {
      setLoading(true)
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
          </Typography>
        </Box>
        <Form onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              name="message"
              label="Describe a location"
              variant="outlined"
              fullWidth
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '8px',
                },
              }}
            />
            <Submit
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              style={{ minWidth: '140px', height: '56px' }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Find Location'
              )}
            </Submit>
          </Box>
        </Form>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {result.city}, {result.state}
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
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr', // mobile: single column
                    sm: 'repeat(3, 1fr)', // tablet & up: three columns
                  },
                  gap: 2,
                }}
              >
                {[
                  { label: 'Footwear', value: result.clothing.footwear },
                  { label: 'Top', value: result.clothing.top },
                  { label: 'Weather Bonus', value: result.clothing.wildcard1 },
                  { label: 'Style Boost', value: result.clothing.wildcard2 },
                  { label: 'Bottom', value: result.clothing.bottom },
                  { label: 'Accessories', value: result.clothing.accessories },
                ].map((item) => (
                  <Card key={item.label} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                        component="div"
                      >
                        {item.label}
                      </Typography>
                      <Typography component="div" variant="body1">
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default MyPagePage

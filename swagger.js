require('dotenv').config()

const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./src/app.ts']

const doc = {
  info: {
    version: '1.0.0',
    title: 'XIMI Server API',
    description: 'API documentation list for project XIMI'
  },
  host: process.env.HOST_NAME,
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Rooms',
      description: 'List of endpoints related to room'
    }
  ]
}

swaggerAutogen(outputFile, endpointsFiles, doc)

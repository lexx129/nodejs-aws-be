import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service-ts-new',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    getAllProducts: {
      handler: 'handlers/product-service/getProductsList.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    getProductById: {
      handler: 'handlers/product-service/getProductById.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}',
            cors: true,
          }
        }
      ]
    },
    createProduct: {
      handler: 'handlers/product-service/createProduct.handler',
      events: [
        {
          http: {
            method: 'put',
            path: 'products',
            cors: true,
          }
        }
      ]
    },
    initDb: {
      handler: 'handlers/product-service/pgClient.init',
      events: [
        {
          http: {
            method: 'get',
            path: 'dbProducts',
          }
        }
      ]
    },
    importProductsFile1: {
      handler: 'handlers/import-service/importProductsFile.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true
          }
        }
      ]
    },
    importFileParser2: {
      handler: 'handlers/import-service/importFileParser.handler',
      events: [
        {
          s3: {
            bucket: 'gavr-products-import',
            event: 's3:ObjectCreated:*',
            existing: true,
            rules: [
              {
                prefix: 'uploaded/',
                suffix: '.csv',
              },
            ]
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;

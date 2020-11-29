import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
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
  resources: {
    Resources: { },
    Outputs: {
      AuthorizerARN: {
        Value: {
          "Fn::GetAtt": ['TokenAuthorizerLambdaFunction', 'Arn'],
        },
        Export: {
          Name: 'AuthorizerARN'
        }
      }
    },
  },
  functions: {
    tokenAuthorizer: {
      handler: 'handlers/tokenAuthorizer.handler',
    }
  }
}

module.exports = serverlessConfiguration;

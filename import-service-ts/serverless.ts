import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service-ts',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    },
    authorizerArn: {
      "Fn::ImportValue": "AuthorizerARN",
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
      SQS_URL: {
        Ref: 'SQSQueue'
      },
      SNS_ARN: {
        Ref: 'SNSTopic',
      }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: {
          "Fn::GetAtt": ['SQSQueue', 'Arn']
        },
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'SNSTopic',
        }
      }
    ]
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'gavr-parsed-products-sqs-queue'
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'gavr-created-products-sns-topic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'aleks02.94@mail.ru',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic'
          }
        }
      },
      GatewayResponseDefault400: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      },
      GatewayResponseAccessDenied: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'ACCESS_DENIED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      },
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi'
          }
        }
      }
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: 'SQSQueue'
        }
      }
    }
  },
  functions: {
    importProductsFile: {
      handler: 'handlers/importProductsFile.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            authorizer: {
              name: 'tokenAuthorizer',
              arn: '${self:custom.authorizerArn}',
              identitySource: 'method.request.header.Authorization',
              type: 'token',
            }
          }
        },
      ],
    },
    importFileParser: {
      handler: 'handlers/importFileParser.handler',
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
    },
    catalogBatchProcess: {
      handler: 'handlers/catalogBatchProcess.handler',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              "Fn::GetAtt": ['SQSQueue', 'Arn']
            }
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;

import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';

import { CORS_RESPONSE_HEADERS } from '../../shared/constants';
import { BUCKET, INBOUND_DIR } from './constants';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Got the following event: ', event);
  try {
    const fileName = event.queryStringParameters.name;
    const s3 = new S3({region: 'eu-west-1', signatureVersion: 'v4'});

    const params = {
      Bucket: BUCKET,
      Key: `${INBOUND_DIR}/${fileName}`,
      Expires: 60,
      ContentType: 'text/csv',
    }

    const signedUrl = s3.getSignedUrl('putObject', params);
    console.log('Got a signed URL: ', signedUrl);

    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 200,
      body: signedUrl,
    }
  } catch (e){
    console.log(e);

    return {
      headers: CORS_RESPONSE_HEADERS,
      statusCode: 500,
      body: 'Error while importing file'
    }
  }
}
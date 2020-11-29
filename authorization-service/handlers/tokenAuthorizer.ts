import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';

const { NAME, PASSWORD } = process.env;

enum AuthorizationEffect {
  Allow = 'Allow',
  Deny = 'Deny'
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent, _, callback) => {
  console.log('Got an event: ', event);

  if(event.type != 'TOKEN'){
    callback('Unauthorized');
  }

  try {
    const token = event.authorizationToken;
    const encodedCreds = token.split(' ')[1];
    const decodedCreds = Buffer
      .from(encodedCreds, 'base64')
      .toString('utf-8')
      .split(':');
    const [user, password] = decodedCreds;
    console.log(`User: ${user}, password: ${password}`);

    const effect = (user === NAME && password === PASSWORD) ? AuthorizationEffect.Allow : AuthorizationEffect.Deny;

    const policy = {
      principalId: encodedCreds,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: event.methodArn,
          }
        ],
      },
    };

    callback(null, policy);
  } catch (err){
    callback(`Unauthorized: ${err.message}`);
  }
}

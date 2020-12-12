import express, { Request, Response } from 'express';
import axios, { AxiosRequestConfig, Method } from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.all('/*', (req: Request, res: Response) => {
  const { originalUrl, method, body } = req;
  console.log('original url: ', originalUrl);
  console.log('method: ', method);
  console.log('body: ', body);

  const targetService = originalUrl.split('/')[1];
  const targetServiceUrl = process.env[targetService];
  console.log('Target: ', targetService, ' with url: ', targetServiceUrl);
  if (targetServiceUrl) {
    const axiosConfig: AxiosRequestConfig = {
      method: method as Method,
      url: `${ targetServiceUrl }${ originalUrl }`,
      ...(Object.keys(body || {}).length > 0 && { data: body })
    };
    console.log('Got the following request config: ', axiosConfig);

    axios(axiosConfig)
      .then(targetResponse => {
        console.log('Got the following response: ', targetResponse);
        res.json(targetResponse.data);
      })
      .catch(error => {
        console.log('Some error happened: ', JSON.stringify(error));

        if (error.response){
          const {status, data} = error.response;

          res.status(status).json(data);
        } else {
          res.status(500).json({error: error.message});
        }
      });
  } else {
    res.status(502).json({error: 'Cant process this request'});
  }
});

app.listen(PORT, () => {
  console.log('Listening to port: ', PORT);
})
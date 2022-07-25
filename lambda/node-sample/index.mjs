import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import xray from 'aws-xray-sdk'
import https from 'https'

const { captureAWSv3Client, captureHTTPs } = xray

const httpClient = captureHTTPs(https)

const ddbClient = captureAWSv3Client(new DynamoDBClient({
  region: 'ap-northeast-1'
}))

export async function handler(event) {
  const params = JSON.stringify(event.multiValueQueryStringParameters)
  const msg = await ddbAccess()
  const res = await httpAccess()
  return {
    statusCode: 200,
    body: `node-sample ${params}, ${msg}, ${res}`
  }
}

async function ddbAccess() {
  const res = await ddbClient.send(new GetItemCommand({
    TableName: 'RustLambdaSampleTable',
    Key: { Id: { S: 'node-sample' } }
  }))
  return JSON.stringify(res.Item)
}

const URL = 'https://httpbin.org/get?name=node-sample'

function httpAccess() {
  return new Promise(function (resolve, reject) {
    const req = httpClient.request(URL, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('statusCode=' + res.statusCode))
      }
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        const ret = JSON.parse(data).args.name
        resolve(ret)
      })
    })
    req.on('error', reject)
    req.end()
  })
}

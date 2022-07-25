import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import pkg from 'aws-xray-sdk'

const { captureAWSv3Client } = pkg;

console.log(`func<${captureAWSv3Client}>`)

const client = captureAWSv3Client(new DynamoDBClient({
  region: 'ap-northeast-1'
}))

export async function handler(event) {
  const params = JSON.stringify(event.multiValueQueryStringParameters)
  const msg = await getItem()
  return {
    statusCode: 200,
    body: `node-sample ${params}, ${msg}`
  }
}

async function getItem() {
  const res = await client.send(new GetItemCommand({
    TableName: 'RustLambdaSampleTable',
    Key: { Id: { S: 'node-sample' } }
  }))
  return JSON.stringify(res.Item)
}

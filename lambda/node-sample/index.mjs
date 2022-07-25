import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
// import { captureAWSv3Client } from 'aws-xray-sdk'
//
// const patchedDynamoDBClient = captureAWSv3Client(
//   new DynamoDBClient({
//     apiVersion: '2012-08-10',
//     region: 'ap-northeast-1',
//   })
// )
//
// const client = DynamoDBDocumentClient.from(patchedDynamoDBClient)

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    apiVersion: '2012-08-10',
    region: 'ap-northeast-1',
  })
)

export async function handler(event) {
  const msg = await getItem()
  return {
    statusCode: 200,
    body: `node-sample ${event.name || 'stranger'}, ${msg}`
  }
}

async function getItem() {
  const res = await client.send(new GetCommand({
    TableName: 'RustLambdaSampleTable',
    Key: { Id: { S: 'rust-sample' } }
  }))
  return JSON.stringify(res.Item)
}

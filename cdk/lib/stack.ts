import { aws_apigateway as apigw, aws_dynamodb as ddb, aws_lambda as lambda, aws_iam as iam, Stack, StackProps, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Tracing } from 'aws-cdk-lib/aws-lambda'

export async function buildStack(
  scope: Construct,
  id: string,
  props?: StackProps,
): Promise<Stack> {
  const stack = new Stack(scope, id, props)

  // api gateway
  const restApi = new apigw.RestApi(stack, 'RustLambdaSampleApi', {
    restApiName: 'RustLambdaSampleApi',
    deployOptions: { tracingEnabled: true }
  })

  // ddb table
  const table = new ddb.Table(stack, 'RustLambdaSampleTable', {
    tableName: 'RustLambdaSampleTable',
    partitionKey: {
      name: 'Id',
      type: ddb.AttributeType.STRING
    },
  })

  // rust lambda
  const rustFunc = new lambda.Function(stack, 'RustLambdaSampleFunction', {
    functionName: 'RustLambdaSampleFunction',
    runtime: lambda.Runtime.PROVIDED_AL2,
    handler: 'RustLambdaSampleFunction',
    code: lambda.Code.fromAsset(`${__dirname}/../../lambda/rust-sample/target/cdk/release`),
    tracing: Tracing.ACTIVE,
    insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_135_0
  })

  rustFunc.addToRolePolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: [table.tableArn],
    actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:UpdateItem']
  }))

  restApi.root.addResource('rust').addMethod('GET', new apigw.LambdaIntegration(rustFunc))

  // node lambda
  const nodeFunc = new lambda.Function(stack, 'NodeLambdaSampleFunction', {
    functionName: 'NodeLambdaSampleFunction',
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'index.handler',
    timeout: Duration.seconds(15),
    code: lambda.Code.fromAsset(`${__dirname}/../../lambda/node-sample`),
    tracing: Tracing.ACTIVE,
    insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_135_0
  })

  nodeFunc.addToRolePolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: [table.tableArn],
    actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:UpdateItem']
  }))

  restApi.root.addResource('node').addMethod('GET', new apigw.LambdaIntegration(nodeFunc))

  return stack
}

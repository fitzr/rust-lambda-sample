import { aws_apigateway as apigw, aws_dynamodb as ddb, aws_lambda as lambda, aws_iam as iam, Stack, StackProps } from 'aws-cdk-lib'
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

  // lambda
  const func = new lambda.Function(stack, 'RustLambdaSampleFunction', {
    functionName: 'RustLambdaSampleFunction',
    runtime: lambda.Runtime.PROVIDED_AL2,
    handler: 'RustLambdaSampleFunction',
    code: lambda.Code.fromAsset(`${__dirname}/../../lambda/hello/target/cdk/release`),
    tracing: Tracing.ACTIVE,
    insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_135_0
  })

  func.addToRolePolicy(new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    resources: [table.tableArn],
    actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:UpdateItem']
  }))

  // rest method
  restApi.root.addResource('hello').addMethod('GET', new apigw.LambdaIntegration(func))

  return stack
}

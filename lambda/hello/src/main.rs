use lambda_http::{service_fn, Error, IntoResponse, Request, RequestExt};
use aws_sdk_dynamodb::{Client, model::AttributeValue };

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_http::run(service_fn(hello)).await?;
    Ok(())
}

async fn hello(
    request: Request
) -> Result<impl IntoResponse, std::convert::Infallible> {
    let _context = request.lambda_context();
    let name = request.query_string_parameters().first("name").unwrap_or_else(|| "stranger").to_owned();
    let msg = get_item().await;

    Ok(format!("hello {}, msg {}", name, msg))
}

// access to dynamodb
async fn get_item() -> String {
    let shared_config = aws_config::load_from_env().await;
    let client = Client::new(&shared_config);
    let out = client.get_item()
        .table_name("RustLambdaSampleTable")
        .key("Id", AttributeValue::S("hello".into()))
        .send()
        .await;
    out.unwrap().item.unwrap().get("Message").unwrap().as_s().unwrap().to_owned()
}

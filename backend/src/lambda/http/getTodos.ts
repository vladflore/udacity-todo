import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {getUserId} from "../utils";

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const result = await dynamodb.query({
        TableName: process.env.TODOS_TABLE,
        IndexName: process.env.USER_ID_CREATED_AT_INDEX,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': getUserId(event)
        }
    })
        .promise()

    // const result = await dynamodb.scan({
    //     TableName: process.env.TODOS_TABLE
    // }).promise()

    const todos = result.Items

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items: todos
        })
    }
}

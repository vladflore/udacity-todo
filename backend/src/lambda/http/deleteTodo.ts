import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {getUserId} from "../utils";

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const result = await dynamodb.get({
        TableName: process.env.TODOS_TABLE,
        Key: {
            userId: getUserId(event),
            todoId: todoId
        }
    }).promise()

    if (!result.Item) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: `Todo with id ${todoId} does not exit!`
            })
        }
    }

    console.log(`Deleting todo with id: ${todoId}`)

    await dynamodb.delete({
        TableName: process.env.TODOS_TABLE,
        Key: {
            userId: getUserId(event),
            todoId: todoId
        }
    }).promise()

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
    }

}

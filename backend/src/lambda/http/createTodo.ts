import 'source-map-support/register'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from '../../models/TodoItem'
import {getUserId} from "../utils";

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const newTodoItem: TodoItem = {
        userId: getUserId(event),
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        ...newTodo,
        done: false
    }

    await dynamodb.put({
        TableName: process.env.TODOS_TABLE,
        Item: newTodoItem
    }).promise()

    delete newTodoItem['userId']

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: newTodoItem
        })
    }
}

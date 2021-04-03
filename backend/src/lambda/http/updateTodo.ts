import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const dynamodb = new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const result = await dynamodb.get({
    TableName: process.env.TODOS_TABLE,
    Key: {
      //TODO fetch the user id dynamically
      userId: '66029f19-8063-4125-93fa-c64dc41dd718',
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

  console.log(`Updating todo with id: ${todoId}`)

  await dynamodb.update({
    TableName: process.env.TODOS_TABLE,
    Key: {
      //TODO fetch the user id dynamically
      userId: '66029f19-8063-4125-93fa-c64dc41dd718',
      todoId: todoId
    },
    UpdateExpression: 'set #theName = :n, dueDate = :dd, done = :d',
    ExpressionAttributeValues: {
      ':n': updatedTodo.name,
      ':dd': updatedTodo.dueDate,
      ':d': updatedTodo.done
    },
    ExpressionAttributeNames: {
      '#theName': 'name'
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

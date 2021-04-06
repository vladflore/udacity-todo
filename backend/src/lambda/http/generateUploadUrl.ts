import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import {getUserId} from "../utils";

const dynamodb = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

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

    await dynamodb.update({
        TableName: process.env.TODOS_TABLE,
        Key: {
            userId: getUserId(event),
            todoId: todoId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues: {
            ':url': `https://${process.env.TODO_IMAGES_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        }
    }).promise()

    const uploadUrl = getUploadUrl(todoId)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            uploadUrl
        })
    }

}

function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: process.env.TODO_IMAGES_S3_BUCKET,
        Key: todoId,
        Expires: 300
    })
}

import {DocumentClient} from "aws-sdk/clients/dynamodb";
import * as AWS from "aws-sdk";
import {TodoItem} from "./models/TodoItem";
import {UpdateTodoRequest} from "./requests/UpdateTodoRequest";
import {S3} from "aws-sdk/clients/browser_default";

export class TodosCloudManager {
    constructor(
        private readonly dynamodb: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly s3: S3 = new AWS.S3({signatureVersion: 'v4'}),
        private readonly todosTable: string = process.env.TODOS_TABLE,
        private readonly index: string = process.env.USER_ID_CREATED_AT_INDEX,
        private readonly attachmentsBucket: string = process.env.TODO_IMAGES_S3_BUCKET
    ) {
    }

    async saveTodo(todo: TodoItem) {
        await this.dynamodb.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
    }

    async updateTodo(todoId: string, userId: string, updateTodoData: UpdateTodoRequest) {
        await this.dynamodb.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #theName = :n, dueDate = :dd, done = :d',
            ExpressionAttributeValues: {
                ':n': updateTodoData.name,
                ':dd': updateTodoData.dueDate,
                ':d': updateTodoData.done
            },
            ExpressionAttributeNames: {
                '#theName': 'name'
            }
        }).promise()
    }

    async addTodoAttachment(todoId: string, userId: string) {
        await this.dynamodb.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :url',
            ExpressionAttributeValues: {
                ':url': `https://${process.env.TODO_IMAGES_S3_BUCKET}.s3.amazonaws.com/${todoId}`
            }
        }).promise()
    }

    async deleteTodo(todoId: string, userId: string) {
        await this.dynamodb.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    async findTodo(todoId: string, userId: string): Promise<TodoItem> | undefined {
        const result = await this.dynamodb.get({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()

        if (result.Item) {
            return result.Item as TodoItem
        }

        return undefined
    }


    async getTodos(userId: string) {
        const result = await this.dynamodb.query({
            TableName: this.todosTable,
            IndexName: this.index,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
            .promise()

        return result.Items
    }

    getUploadUrlForTodo(todoId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.attachmentsBucket,
            Key: todoId,
            Expires: 300
        })
    }
}
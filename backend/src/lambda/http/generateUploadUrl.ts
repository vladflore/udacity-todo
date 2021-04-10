import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getUserId} from "../utils";
import {TodoItem} from "../../models/TodoItem";
import {TodosManager} from "../../data_layer/todosManager";

const todosManager = new TodosManager()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);

    const todo: TodoItem = await todosManager.getTodo(todoId, userId)
    if (!todo) {
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

    await todosManager.updateTodoAttachment(todoId, userId)
    const uploadUrl = todosManager.getUploadUrl(todoId)

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

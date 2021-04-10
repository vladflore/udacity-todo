import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {getUserId} from "../utils";
import {TodosManager} from "../../data_layer/todosManager";
import {TodoItem} from "../../models/TodoItem";

const todosManager = new TodosManager()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const todo: TodoItem = await todosManager.getTodo(todoId, getUserId(event))

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

    await todosManager.deleteTodo(todoId, getUserId(event))

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
    }

}

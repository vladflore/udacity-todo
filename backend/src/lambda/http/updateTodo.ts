import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'

import {UpdateTodoRequest} from '../../requests/UpdateTodoRequest'
import {getUserId} from "../utils";
import {TodosManager} from "../../data_layer/todosManager";

const todosManager = new TodosManager()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event);

    const todoItem = await todosManager.getTodo(todoId, userId);
    if (!todoItem) {
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

    await todosManager.updateTodo(todoId, userId, updatedTodo)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({})
    }
}

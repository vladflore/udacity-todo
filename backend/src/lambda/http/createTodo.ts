import 'source-map-support/register'
import * as uuid from 'uuid'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from '../../models/TodoItem'
import {getUserId} from "../utils";
import {TodosManager} from "../../data_layer/todosManager";

const todosManager = new TodosManager()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const newTodoItem: TodoItem = {
        userId: getUserId(event),
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        ...newTodo,
        done: false
    }

    const savedTodo: TodoItem = await todosManager.createTodo(newTodoItem)
    delete savedTodo['userId']

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: savedTodo
        })
    }
}

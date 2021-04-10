import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {TodosService} from "../../todosService";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {getUserId} from "../utils";

const todosService = new TodosService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodoData: CreateTodoRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: await todosService.createNew(newTodoData, userId)
        })
    }
}

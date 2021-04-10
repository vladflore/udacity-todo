import * as uuid from "uuid";
import {CreateTodoRequest} from "./requests/CreateTodoRequest";
import {TodosCloudManager} from "./todosCloudManager";
import {TodoItem} from "./models/TodoItem";
import {UpdateTodoRequest} from "./requests/UpdateTodoRequest";
import {createLogger} from "./utils/logger";

const todosCloudManager = new TodosCloudManager()
const logger = createLogger("todos-service")

export class TodosService {
    async createNew(newTodoData: CreateTodoRequest, userId: string) {
        const newTodo: TodoItem = {
            userId: userId,
            todoId: uuid.v4(),
            createdAt: new Date().toISOString(),
            ...newTodoData,
            done: false
        }
        await todosCloudManager.saveTodo(newTodo)
        logger.info(`User ${userId} created new todo with id: ${newTodo.todoId}.`)
        delete newTodo['userId']
        return newTodo
    }

    async delete(todoId: string, userId: string) {
        const todo = await todosCloudManager.findTodo(todoId, userId)
        if (todo) {
            await todosCloudManager.deleteTodo(todoId, userId);
            logger.info(`User ${userId} deleted todo with id: ${todoId}.`)
            return todo
        }
        return undefined
    }

    async createAttachment(todoId: string, userId: string) {
        const todo = await todosCloudManager.findTodo(todoId, userId)
        if (todo) {
            await todosCloudManager.addTodoAttachment(todoId, userId);
            logger.info(`User ${userId} added attachment for todo with id: ${todoId}.`)
            return todosCloudManager.getUploadUrlForTodo(todoId)
        }
        return undefined
    }

    async findAll(userId: string) {
        logger.info(`User ${userId} requested all todos.`)
        return await todosCloudManager.getTodos(userId)
    }

    async update(todoId: string, updateTodoData: UpdateTodoRequest, userId: string) {
        const oldTodo = await todosCloudManager.findTodo(todoId, userId)
        if (oldTodo) {
            await todosCloudManager.updateTodo(todoId, userId, updateTodoData)
            logger.info(`User ${userId} updated todo with id: ${todoId}`)
            return oldTodo
        }
        return undefined
    }
}
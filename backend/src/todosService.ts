import * as uuid from "uuid";
import {CreateTodoRequest} from "./requests/CreateTodoRequest";
import {TodosCloudManager} from "./todosCloudManager";
import {TodoItem} from "./models/TodoItem";
import {UpdateTodoRequest} from "./requests/UpdateTodoRequest";

const todosCloudManager = new TodosCloudManager()

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
        delete newTodo['userId']
        return newTodo
    }

    async delete(todoId: string, userId: string) {
        const todo = await todosCloudManager.findTodo(todoId, userId)
        if (todo) {
            await todosCloudManager.deleteTodo(todoId, userId);
            return todo
        }
        return undefined
    }

    async createAttachment(todoId: string, userId: string) {
        const todo = await todosCloudManager.findTodo(todoId, userId)
        if (todo) {
            await todosCloudManager.addTodoAttachment(todoId, userId);
            return todosCloudManager.getUploadUrlForTodo(todoId)
        }
        return undefined
    }

    async findAll(userId: string) {
        return await todosCloudManager.getTodos(userId)
    }

    async update(todoId: string, updateTodoData: UpdateTodoRequest, userId: string) {
        const oldTodo = await todosCloudManager.findTodo(todoId, userId)
        if (oldTodo) {
            await todosCloudManager.updateTodo(todoId, userId, updateTodoData)
            return oldTodo
        }
        return undefined
    }
}
import{Task} from'../../../shared/types'
import { saveData, loadData, STORAGE_KEYS } from './database'

export const getAllTasks=async():Promise<Task[]>=>{
    const tasks = await loadData<Task[]>(STORAGE_KEYS.TASKS)
    return tasks ??[]


}
export const saveTask =async(task:Task):Promise<void> =>{
    const tasks=await getAllTasks()


    const existingIndex=tasks.findIndex(t=>t.taskId===task.taskId)

    if(existingIndex>=0){
        tasks[existingIndex]=task
    }else{
        tasks.push(task)

    }
    await saveData(STORAGE_KEYS.TASKS,tasks)

}
export const saveManyTasks= async(incomingTasks: Task[]):Promise<void>=>{
    for(const task of incomingTasks){
        await saveTask(task)

    }
}

export const getTasksByChapter=async(chapterId:string):Promise<Task[]>=>{
    const tasks=await getAllTasks()

    return tasks.filter(
        task=>task.chapterId===chapterId&&!task.isDeleted
    )

}
export const deleteTask=async(taskId:string,deviceId:string,clock:number):Promise<void>=>{
    const tasks=await getAllTasks()
    const existingIndex=tasks.findIndex(t=>t.taskId===taskId)

    if(existingIndex>=0){
        tasks[existingIndex]={
            ...tasks[existingIndex],
            isDeleted:true,
            deviceId,
            logicalClock:clock,
            isSynced:false

        }
    }
    await saveData(STORAGE_KEYS.TASKS,tasks)
}
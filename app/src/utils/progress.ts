import{Task } from'../../../shared/types'

export const calculateChapterProgress =(tasks:Task[]) : number =>{
    if(tasks.length===0)
        return 0

    const completedTasks=tasks.filter(
        task=>task.status==='done'&&!task.isDeleted
    )


    const totalTasks =tasks.filter(task=>!task.isDeleted)

    if(totalTasks.length===0)
        return 0

    return Math.round((completedTasks.length/totalTasks.length)*100)



}

export const calculateSubjectProgress=(chapterProgressList:number[]):number=>{
    if(chapterProgressList.length===0) return 0

    const total=chapterProgressList.reduce((sum,progress)=>sum+progress,0)

    return Math.round(total/chapterProgressList.length)

    
}
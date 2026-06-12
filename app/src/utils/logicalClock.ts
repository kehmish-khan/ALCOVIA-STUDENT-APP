export const incrementClock=(currentClock:number):number =>{
    return currentClock+1

}

export const shouldUpdate=(
    incomingClock:number,
    incomingDeviceId:string,
    existingClock:number,
    existingDeviceId:string

): boolean =>{
    if (incomingClock>existingClock) return true
    if(incomingClock<existingClock) return false 

    return incomingDeviceId>existingDeviceId



}
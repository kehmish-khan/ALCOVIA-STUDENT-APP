import NetInfo from '@react-native-community/netinfo'
type NetworkCallback =(isOnline:boolean)=>void

export const startNetworkMonitor=(callback:NetworkCallback)=>{
    const unsubscribe =NetInfo.addEventListener(state=>{
        const isOnline=state.isConnected??false
        callback(isOnline)

    })
    return unsubscribe 

}

export const checkIsOnline=async():Promise<boolean>=>{
    const state=await NetInfo.fetch()
    return state.isConnected??false
    
}
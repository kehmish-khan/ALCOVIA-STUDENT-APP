import AsyncStorage from '@react-native-async-storage/async-storage'
import {generateId} from './uuid'
const DEVICE_ID_KEY='device_id'

export const getDeviceId=async (): Promise<string>=>{
    const existing =await AsyncStorage.getItem(DEVICE_ID_KEY)

    if(existing){
        return existing
    }

    const newId=generateId()

    await AsyncStorage.setItem(DEVICE_ID_KEY,newId)
    return newId

}


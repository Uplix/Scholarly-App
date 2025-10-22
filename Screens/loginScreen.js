import { StyleSheet, Text, View, Pressable, TextInput } from "react-native";
export default function Login({promptAsync, pressed, setPressed}){
    return(
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
            <Pressable disabled={pressed} onPress={()=>promptAsync()} style={{height:'10%', width:'70%', backgroundColor:'blue', justifyContent:'center', alignItems:'center', borderRadius:10}}>
                <Text style={{color:'white', fontSize:25}}>Sign In with Google</Text>
            </Pressable>
        </View>
    )
}
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
// import { ScheduleContext } from "../Screens/scheduledScreen";
// import { useContext } from "react";

export default function ListComponent({object, i, navigation}:{object:any, i:number, navigation:any}){
    // const context:any = useContext(ScheduleContext);
    // console.log(object);
    return(
        <TouchableOpacity style={styles.button} key={i} activeOpacity={.5} 
        onPress={()=> {
            let theObject = object;
            theObject.value.date = new Date(object.value.date).getTime();
            navigation.navigate("AvailableDetails", {object:object})
        }}
        id={object.key}
        >
            <View style={{
                width:7,
                borderTopRightRadius:70,
                borderBottomRightRadius:70,
                height:"100%",
                backgroundColor:(object.value.location == "Google Meets")? "#22c55e":"#eab308",
                marginLeft: -3
            }} />
            <View style={styles.details}>
                <Text style={styles.dateText}>{new Date(object.value.date).toDateString()}</Text>
                <Text style={styles.classText}>{object.value.subject}</Text>
                <View style={styles.bottomDetailContainer}>
                    <Text style={styles.personText}><Ionicons name="person-outline" size={18.5} color="black" /> {object.value.name}</Text>
                    <Text style={styles.timeText}><Ionicons name="time-outline" size={18.5} color="black" /> {object.value.time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button:{
        width:"94%",
        height:"auto",
        flexDirection:"row",
        alignContent:"center",
        justifyContent:'flex-start',
        backgroundColor:"#F4F4F4",
        borderRadius:16,
        shadowRadius:8,
        shadowColor:"#1e293b",
        shadowOpacity:.4,
        paddingVertical:22
    },
    details:{
        flexGrow:1,
        flexDirection:"column",
        height:"auto",
        paddingVertical:5,
        alignItems:"flex-start",
        justifyContent:"flex-start",
        marginHorizontal:12
    },
    dateText:{
        color:"#181818",
        opacity:.7,
        fontSize:18,
        fontWeight:"300"
    },
    classText:{
        color:"#181818",
        fontSize:24,
        marginTop:10,
        fontWeight:"500"
    },
    bottomDetailContainer:{
        flexDirection:"row",
        marginTop:15,
        justifyContent:"center",
        marginRight:7
    },
    personText:{
        color:"#181818",
        fontSize:18.5,
        width:"auto",
        fontWeight:"400",
        alignItems:"center"
    },
    timeText:{
        color:"#181818",
        fontSize:18.5,
        flexGrow:1,
        textAlign:"right",
        fontWeight:"400",
        alignItems:"center"
    }

})
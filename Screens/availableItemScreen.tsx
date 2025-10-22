import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AvailableContext } from "./availableScreen";
import { useContext } from "react";
import { Modal } from "@ui-kitten/components";

export default function ItemScreen({route}){
    const object = route.params.object.value;
    const [loading, setLoading] = React.useState(false);
    const [cancelModal, setCancelModal] = React.useState(false);
    const context = useContext(AvailableContext);

    const acceptEvent = async ()=>{
        setCancelModal(false);
        setLoading(true);
        try{
            await context.acceptEvent(route.params.object);
            setLoading(false);
            context.navigation.goBack();
        }catch(e){
            setLoading(false);
            context.navigation.goBack();
            alert(e);
        }
    }

    // React.useEffect(()=>{
    //     setTimeout(()=>{
    //         setLoading(false);
    //     }, 500)
    // }, []);

    if(object.subject == undefined)return(
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
            <ActivityIndicator size={"large"}/>
        </View>
    )



    return(
        <SafeAreaView style={{flex:1, flexDirection:"column"}}>
            <ScrollView>
                <TouchableOpacity onPress={()=>context.navigation.goBack()} activeOpacity={.5} style={styles.topPart}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.screen}>
                    <Text style={styles.whatIs}>Posted By:</Text>
                    <Text style={styles.post}>{object.name}</Text>
                    <Text style={styles.whatIs}>Tutor:</Text>
                    <Text style={styles.post}>{((object.hasOwnProperty('tutorer'))?((object.tutorer.hasOwnProperty('name'))?object.tutorer.name:"No current tutor"):"No current tutor")}</Text>
                    <Text style={styles.whatIs}>Subject:</Text>
                    <Text style={styles.post}>{object.subject}</Text>
                    <Text style={styles.whatIs}>Grade:</Text>
                    <Text style={styles.post}>{object.grade}</Text>
                    <Text style={styles.whatIs}>Location:</Text>
                    <Text style={styles.post}>{object.location}</Text>
                    <Text style={styles.whatIs}>Date:</Text>
                    <Text style={styles.post}>{new Date(object.date).toDateString()}</Text>
                    <Text style={styles.whatIs}>Time:</Text>
                    <Text style={styles.post}>{object.time}</Text>
                    <Text style={styles.whatIs}>Description:</Text>
                    <Text style={styles.post}>{object.text}</Text>
                </View>
                <TouchableOpacity onPress={()=>setCancelModal(true)} style={styles.acceptButton} activeOpacity={.75}>
                    <Text style={styles.cancelText}>Accept</Text>
                </TouchableOpacity>
            </ScrollView>
            <Modal visible={cancelModal} onBackdropPress={()=>setCancelModal(false)} style={styles.modal} backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}} animationType="fade">
                <Text style={styles.modalText}>Are you sure you want to accept?</Text>
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity onPress={()=>setCancelModal(false)} activeOpacity={.75} style={{
                        ...styles.modalButton, 
                        backgroundColor:"#D0D0D0",
                        }}>
                        <Text style={{
                            ...styles.modalButtonText,
                            color:"#0F0F0F"
                        }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>acceptEvent()} activeOpacity={.75} style={{
                        ...styles.modalButton, 
                        backgroundColor:"#34d399",
                        marginLeft:20
                        }}>
                        <Text style={{
                            ...styles.modalButtonText,
                            color:"#F0F0F0"
                        }}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={loading} animationType="fade" backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)',}}>
                <ActivityIndicator size={"large"}/>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        flexDirection:'column',
        marginLeft:26,
        marginTop:2,
        paddingRight:7
    },
    topPart:{
        marginTop:5,
        marginLeft:15,
    },
    whatIs:{
        color:"#181818",
        // opacity:.75,
        fontSize:18,
        fontWeight:"200",
        marginTop:20
    },
    post:{
        color:"#181818",
        fontSize:20,
        fontWeight:"400",
        marginLeft:10,
        marginTop:5
    },
    acceptButton:{
        backgroundColor:"#34d399",
        marginHorizontal:23,
        paddingVertical:5,
        borderRadius:24,
        width:"auto",
        marginTop:28,
        justifyContent:'center',
        shadowColor:"#0D0D0D",
        shadowOpacity:.3,
        shadowRadius:9,
    },
    cancelText:{
        fontSize:29,
        fontWeight:"400",
        color:"#F0F0F0",
        textAlign:'center',
        width:'auto'
    },
    modal:{
        height:"auto",
        flexDirection:"column",
        paddingTop:28,
        paddingBottom:32,
        alignItems:'center',
        backgroundColor:"#F0F0F0",
        borderRadius:25,
        marginHorizontal:1

    },
    modalText:{
        fontSize:22,
        fontWeight:"300",
        textAlign:'center',
        paddingHorizontal:20
    },
    modalButtonContainer:{
        marginTop:28,
        flexDirection:"row",
        justifyContent:'center',
        alignItems:"center"
    },
    modalButton:{
        width:"40%",
        paddingVertical:9,
        borderRadius:25,
        alignItems:'center'
    },
    modalButtonText:{
        fontSize:23,
        textAlign:'center',
        fontWeight:"700"
    }
});
import * as React from 'react'
import { deleteUser } from "firebase/auth";
import { View, Text, Pressable, Image, ScrollView, StyleSheet, TextInput, SafeAreaView, ActivityIndicator, TouchableOpacity } from "react-native";
import { auth, db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Button, Input, Modal } from '@ui-kitten/components';
import { onValue, ref, set } from 'firebase/database';
import { AppContext } from '../App';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Settings({route}){
    const signouting = React.useContext(AppContext).siginingOut;
    const [update, setUpdate] = React.useState(0);
    const [status, setStatus] = React.useState("primary");
    const [theRating, setTheRating] = React.useState(0);
    const [theCount, setTheCount] = React.useState(0);
    // const [coder, setCoder] = React.useState();
    const [isTutor, setIsTutor] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [modalDisplay, setModalDisplay] = React.useState(false);
    const [whatToDo, setWhatToDo] = React.useState(null);
    const [district, setDistrict] = React.useState('none');
    const [school, setSchool] = React.useState("Couldn't fetch");
    const [grade, setGrade] = React.useState("Couldn't fetch");

    React.useEffect(()=>{
        setLoading(true);
        fetchDistrict();
    }, [])

    React.useEffect(()=>{
        // fetchDistrict();
        setLoading(true);
        var theUpdate = update;
        var sumRating = 0;
        var count = 0;
        var currentRating = 0;
        var isATutor = false;
        var theSchool = "Couldn't fetch";
        var theGrade = "Couldn't fetch";
        if(district != undefined || district != null || district != ""){
            onValue(ref(db, district + '/users/' + auth.currentUser?.uid + '/isTutor'), (snapshot)=>{
                if(snapshot.exists() && snapshot.val() === true){
                    isATutor = snapshot.val();
                }
            })
            onValue(ref(db, district + '/users/' + auth.currentUser?.uid + '/ratings'), (snapshot)=>{
                snapshot.forEach((id)=>{
                    var theRate = id.val();
                    sumRating += theRate;
                    count+=1;
                })
                if(count != 0){
                    currentRating = sumRating/count;
                    currentRating *= 10;
                    currentRating = Math.round(currentRating);
                    currentRating /= 10;
                    
                }
            })
            onValue(ref(db, district + '/users/' + auth.currentUser?.uid + '/school'), (snapshot)=>{
                theSchool = snapshot.val();
            })
            onValue(ref(db, district + '/users/' + auth.currentUser?.uid + '/grade'), (snapshot)=>{
                theGrade = snapshot.val();
            })
    
            setTimeout(()=>{
                setTheRating(currentRating);
                setTheCount(count);
                setIsTutor(isATutor);
                setSchool(theSchool);
                setGrade(theGrade);
                setTimeout(()=>setLoading(false), 100)
            }, 900);
        }
    }, [district])
    const fetchDistrict = async ()=>{
        let theDistrict = await AsyncStorage.getItem("district");
        setDistrict(theDistrict);
    }

    if(update == 0){
        setUpdate(1);
    }
    
    const deleteAccount = async () =>{
        try{
            set(ref(db, district + "/schedule/" + auth.currentUser.uid), null);
            set(ref(db, district + "/sessions/" + auth.currentUser.uid), null);
            set(ref(db, district + "/user/" + auth.currentUser.uid), null);
            await deleteUser(auth.currentUser);
            signouting();
        }catch(e){
            alert("An error occured: " + e.message);
        }finally{
            alert("Your account is officially deleted along with all of your information stored in our database");
        }
    }

    // const BecomingTutor = () =>{
    //     const [code, setCode] = React.useState();
    //     const checkCode = () =>{
    //         if(!isTutor){
    //             if(code == "YCL5F9CM"){
    //                 set(ref(db, "mhusd/users/" + auth.currentUser.uid + "/isTutor"), true);
    //                 setUpdate(update + 1);
    //                 alert("You are now a tutor, thank you for volunteering.");
    //             }else{
    //                 setStatus("danger");
    //                 alert("The code does not match what is in our system. Please try again or speak to your counselor");
    //             }
    //         }else{
    //             setStatus("danger");
    //             alert("It seems like you are already a tutor");
    //         }
    //     }
    //     return isTutor?(null):(
    //         <View>
    //             <Input
    //             label={"Would you like to be a tutor. Get the code from your counselor and enter it here. (Only excelling high school students can be tutors)"} 
    //             placeholder='Tutor Code' 
    //             onChange={(event)=>setCode(event.nativeEvent.text)}
    //             style={{marginTop:30, marginHorizontal:50}} 
    //             // onKeyPress={(key)=>setCode(code+key.nativeEvent.key)}
    //             status={status}
    //             autoCapitalize='none'
    //             autoCorrect={false}
    //             // onSubmitEditing={console.log("submitted")}
    //             // onEndEditing={console.log("edditing ended")}
    //             textAlign='center'
    //             />
    //             {/* <Input 
    //                 // style={{marginHorizontal:50, marginTop:30}}
    //                 value={code}
    //                 onChangeText={nextValue=>setCode(nextValue)}
    //                 disabled={false}

    //             /> */}
    //             <Button 
    //             size='large'
    //             onPress={checkCode}
    //             status={status}
    //             appearance='outline'
    //             style={{marginTop:30, marginHorizontal:60}}>Enter</Button>
    //         </View>
    //     )
    // }

    const clickHandler = () =>{
        if(whatToDo == null){
            alert("Something weird happened, please try again");
            setModalDisplay(false);
            setWhatToDo(null);
        }else if(whatToDo){
            signouting();
            setModalDisplay(false);
            setWhatToDo(null);
        }else if(whatToDo == false){
            deleteAccount();
            setModalDisplay(false);
            setWhatToDo(null);
        }else{
            alert("Something weird happened, please try again");
            setModalDisplay(false);
            setWhatToDo(null)
        }
    }

    const name = auth.currentUser.displayName.split(" ");
    if(loading)return<View style={{justifyContent:'center', alignItems:'center', flex:1}}>
        <ActivityIndicator style={{marginVertical:80}} size={"large"}/>
    </View>
    return(
        <View style={{flex:1}}>
            <ScrollView contentContainerStyle={{alignItems:'center'}}>
                <Image source={{uri:auth.currentUser.photoURL}} style={{width:120, height:120, marginTop:70, borderRadius:120}}/>
                <Text style={{alignContent:'center', marginTop:20, fontSize:35}}>Hi {name[0]}</Text>
                <View style={{alignSelf:'flex-start', marginLeft:30, marginTop:30}}>
                    <Text style={styles.profileText}>Email: {auth.currentUser.email}</Text>
                    <Text style={styles.profileText}>District: {district.toUpperCase()}</Text>
                    <Text style={styles.profileText}>School: {school}</Text>
                    <Text style={styles.profileText}>Grade: {grade}</Text>
                    <Text style={styles.profileText}>Currently a Tutor: {isTutor? "Yes":"No"}</Text>
                    <Text style={styles.profileText}>You Have {theCount} {(theCount == 1)? "Rating":"Ratings"}</Text>
                </View>
                <View style={{flexDirection:'row', marginTop:55}}>
                    {(theRating > 0)? <StarSelect/>:<NotStar/>}
                    {(theRating >= 2)? <StarSelect/>:<NotStar/>}
                    {(theRating >= 3)? <StarSelect/>:<NotStar/>}
                    {(theRating >= 4)? <StarSelect/>:<NotStar/>}
                    {(theRating >= 5)? <StarSelect/>:<NotStar/>}
                    <Text style={{position:'absolute', fontSize:18, right:-30, top:25, textAlign:'right'}}>{"(" + theRating + ")"}</Text>
                </View>
                {/* <Pressable onPress={()=>getUid()} style={{backgroundColor:'blue', height:100, width:100, marginTop:80}}></Pressable> */}
                <Button onPress={()=>{setModalDisplay(true); setWhatToDo(true)}}
                status='danger'
                appearance='outline'
                size='large'
                style={{marginTop:60, width:200}}
                >
                    <Text style={{fontSize:30}}>Log Out</Text>
                </Button>
                <Button 
                    status='danger'
                    appearance='outline'
                    size='large'
                    style={{marginTop:80, width:200}}
                    onPress={()=>{setWhatToDo(false); setModalDisplay(true)}}
                >Delete Account</Button>
                <Text style={{marginTop:95, fontSize:28, width:"90%", textAlign:'center'}}>Image Attribution:</Text>
                <Text style={{marginTop:10, fontSize:15, width:'80%'}}>"https://www.vecteezy.com/free-vector/sad" Sad Vectors by Vecteezy</Text>
                <Text style={{marginTop:10, fontSize:15, width:'80%'}}>"https://www.vecteezy.com/free-vector/video-call Video Call Vectors by Vecteezy</Text>
                <Text style={{marginTop:10, fontSize:15, width:'80%'}}>"https://www.vecteezy.com/free-vector/request" Request Vectors by Vecteezy</Text>
            </ScrollView>
            <Modal visible={modalDisplay}
                onBackdropPress={()=>{setModalDisplay(false); setWhatToDo(null)}} 
                backdropStyle={{backgroundColor:'rgba(0, 0, 0, 0.5)'}}
                style={styles.modal}
                animationType='fade'
            >
                <Text style={styles.modalText}>{whatToDo? "Are you sure that you want to sign out of your account?":"Are you sure the you want to delete your account? This cannot be undone"}</Text>
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity onPress={()=>setModalDisplay(false)} activeOpacity={.75} style={{
                        ...styles.modalButton, 
                        backgroundColor:"#D0D0D0",
                        }}>
                        <Text style={{
                            ...styles.modalButtonText,
                            color:"#0F0F0F"
                        }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clickHandler} activeOpacity={.75} style={{
                        ...styles.modalButton, 
                        backgroundColor:"#ef4444",
                        marginLeft:20
                        }}>
                        <Text style={{
                            ...styles.modalButtonText,
                            color:"#F0F0F0"
                        }}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

const StarSelect = () =>{
    return <MaterialCommunityIcons name='star' size={50} color={'#FFCD3C'}/>
}

const NotStar = () =>{
    return <MaterialCommunityIcons name='star-outline' size={50} color={'#8F9BB3'}/>
}

const styles = StyleSheet.create({
    profileText:{
        fontSize:21,
        marginTop:14
    },
    modal:{
        height:"auto",
        flexDirection:"column",
        paddingTop:25,
        paddingBottom:33,
        alignItems:'center',
        backgroundColor:"#F0F0F0",
        borderRadius:25,
        marginHorizontal:1

    },
    modalText:{
        fontSize:22,
        fontWeight:"300",
        textAlign:'center',
        paddingHorizontal:10
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
})
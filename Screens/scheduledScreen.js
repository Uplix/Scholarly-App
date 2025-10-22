import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl, Image, SafeAreaView } from 'react-native';
import { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';
// import constants from '../constants';
// import { Modal, Button, List, Divider, ListItem } from '@ui-kitten/components';
import { ref, onValue, remove, set } from 'firebase/database';
import { auth, db } from '../firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ItemScreen from './scheduleItemScreen';
import ListComponent from '../components/listComponentSchedule';
import { useNavigation } from '@react-navigation/native';
import { delay } from '../components/functions';

// import Individual from '../Components/individual';


// var peopleAvailable = [["John", "Fighting", "8th"], ["Harold", "Computers", "5th"], ["Danny", "Math", "11th"], ["Dude", "English", "1st"]];
// var peopleScheduled = constants.schedule;
// var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var now = new Date();
const Stack = createNativeStackNavigator();
export const ScheduleContext = createContext();

export default function Schedule({route}){
  // const [myOppurtunities, setMyOppurtunities] = useState();
  // const [myAccpeted, setMyAccepted] = useState();
  // const [peopleScheduled, setPeopleSceheduled] = useState();
  // const {userInfo} = route.params;
  // const mySchedyleRef = ref(db, 'mhusd/oppurtunities/' + userInfo.user.id);
  // const myAcceptedRef = ref(db, 'mhusd/schedule/' + userInfo.user.id);
  // var [overlay, setOverlay] = useState(false);
  // var [displaying, setDisplaying] = useState(null);
  // var [place, setPlace] = useState(null);
  // const [keyed, setKeyed] = useState(null);
  // var [modalDisplay, setModalDisplay] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [update, setUpdate] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(()=>{
    const updating = update;
    // var sending = auth.currentUser? auth.currentUser.uid : "noUserId"
    const scheduleRef = ref(db, "mhusd/schedule/" + auth.currentUser.uid);
    onValue(scheduleRef, (snapshot) =>{
      var returnVal = [];
      snapshot.forEach((child)=>{
        var value = child.val();
        value.date = new Date(value.date);
        var indiv = {
          key:child.key,
          value:value
        }
        returnVal.push(indiv);
      })
      setSchedule(returnVal);
    })
    // console.log("refreshed");
    // console.log(schedule);
  }, []);
  // var overlayInfo = {
  //   overlay: overlay,
  //   setOverlay:setOverlay, 
  //   displaying:displaying,
  //   setDisplaying:setDisplaying,
  //   place:place,
  //   setPlace:setPlace,
  //   modalDisplay:modalDisplay,
  //   setModalDisplay:setModalDisplay,
  //   navigation:navigation,
  //   schedule:schedule,
  //   keyed:keyed,
  //   setKeyed:setKeyed,
  //   update:update,
  //   setUpdate:setUpdate,
  //   onRefresh:onRefresh,
  //   refreshing:refreshing
  // }

  const onRefresh = useCallback(()=>{
    setRefreshing(true);
    setUpdate(update+1);
    setTimeout(()=>{
      setRefreshing(false);
    }, 750);
  }, [])

  const deleteFromSchedule = useCallback(async (object)=>{
    const objectDate = new Date(object.value.date);
    if(!object.value.available){
      if(now.getMonth() < objectDate.getMonth() || now.getDate() + 2 < objectDate.getDate()){
        //Don't know if I can delete with a http request
        // const token = (await GoogleSignin.getTokens()).accessToken;
        // await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/" + overlayInfo.keyed, {
        //   method:"DELETE",
        //   headers:{
        //     'Authorization':'Bearer ' + token,
        //   },
        //   sendUpdates:"all"
        // }).then((data)=>{
        //   console.log(JSON.stringify(data));
        // })
        if(object.value.tutoree == auth.currentUser.uid){
          remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + object.key));
          remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + object.key));
          // remove(ref(db, "mhusd/schedule/" + overlayInfo.displaying.tutorer.id + "/" + overlayInfo.keyed));
          set(ref(db, "mhusd/schedule/" + object.value.tutorer.id + "/" + object.key + "/studentCanceled"), true);
          // overlayInfo.setUpdate(overlayInfo.update+1);
          // overlayInfo.setModalDisplay(false);
          // overlayInfo.setOverlay(false);
          // console.log("Tutoree canceled")
        }else{
          remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + object.key));
          remove(ref(db, "mhusd/sessions/" + object.value.tutoree + "/" + object.key + "/tutorer"))
          set(ref(db, "mhusd/sessions/" + object.value.tutoree + "/" + object.key + "/available"), true);
          set(ref(db, "mhusd/schedule/" + object.value.tutoree + "/" + object.key + "/available"), true);
          set(ref(db, "mhusd/schedule/" + object.value.tutoree + "/" + object.key + "/tutorer"), {canceled:true});
          // console.log("Tutor canceled")
        }
        alert("removed");
      }else{
        alert("I'm sorry but you can't cancel within two days of your set date when the session is taken. You can contact the other student directly through the google calendar event if you need to.");
      }
    }else{
      remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + object.key));
      remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + object.key));
      alert("removed");
      // console.log("canceled with no tutor");
    }
    // overlayInfo.setUpdate(overlayInfo.update+1);
    await delay(1000);
    onRefresh();
  }, [])

  return(
    <SafeAreaView style={{flex:1, backgroundColor:"#F0F0F0"}}>
      <ScheduleContext.Provider value={{refreshing:refreshing, onRefresh:onRefresh, schedule:schedule, navigation:navigation, deleteFromSchedule:deleteFromSchedule}}>
        <Stack.Navigator screenOptions={{
          headerShown:false
        }}
        initialRouteName='ScheduleScreen'
        >
          <Stack.Screen name='ScheduleScreen' component={LoggedIn}/>
          <Stack.Screen name='ScheduleDetails' component={ItemScreen}/>
        </Stack.Navigator>
      </ScheduleContext.Provider>
    </SafeAreaView>
 );
}




function LoggedIn({route}) {
  const context = useContext(ScheduleContext)
  return(
    <View style={{flex:1, backgroundColor:'#F0F0F0'}}>
      <ScrollView 
      // scrollEnabled={!overlayInfo.overlay} 
      style={{flex: 1}}
      refreshControl={<RefreshControl refreshing={context.refreshing} onRefresh={context.onRefresh}/>}
      >
        <View style={{marginBottom:10, height:'auto', justifyContent:'center', alignItems:'center', marginTop:12}}>
          <Text style={{fontSize:35, color:'#252525'}}>Your Schedule</Text>
        </View>
        {(context.schedule[0] == null)?<Nothing />:<Buttoner schedule={context.schedule} />}
        {/* <View style={{height:30}}/> */}
      </ScrollView>
    </View>
  );
}

const Nothing = () => {
  return(
    <View style={{alignItems:'center', justifyContent:'center', alignSelf:'center', marginTop:60, width:'100%'}}>
      <Image style={{height:250, width:250}} source={require('../Images/sadEmoji.png')}/>
      <Text style={{marginTop:40, fontSize:22, width:'90%', textAlign:'center', color:'#252525'}}>It seems like you don't have anything in your schedule. Add something in the tutor request screen.</Text>
      <Text style={{marginTop:50, fontSize:22, width:'90%', textAlign:'center', color:'#252525'}}>Refresh this page by pulling down</Text>
    </View>
  )
}

const Buttoner = ({schedule}) =>{
  const context = useContext(ScheduleContext);
  const navigation = context.navigation
  return(
    <View style={styles.buttonContainer}>
      {schedule.map((object, i) => ListComponent({object, i, navigation}))}
    </View>
  )
}

// const Individual = props =>{
//   let person = props.object;
//   let overlayInfo = props.overlayInfo;
//   return(
//     <View key={person.key} >
//       <Pressable onPress={() => {
//         if(!overlayInfo.overlay){
//         overlayInfo.setOverlay(true); 
//         overlayInfo.setDisplaying(person.value);
//         overlayInfo.setPlace(props.i);
//         overlayInfo.setKeyed(person.key);
//       }}} 
//       style={{flexDirection:'row', backgroundColor:'#fdfdfd', borderRadius: 50.4, width: '90%', justifyContent: 'center', height: 175, alignItems: 'center', marginTop:25}}
//       >
//         <View style={{width:'50%', height:'100%', flexDirection:'column' ,justifyContent:'center', alignItems:'center'}}>
//           <Text style={{fontSize:29, position:'absolute', top:40, color:'#252525'}}>{person.value.subject}</Text>
//           <Text style={{fontSize:29, position:'absolute', bottom:40, color:'#252525'}}>Grade: {person.value.grade}</Text>
//         </View>
//         <View style={{width:'50%', height:'100%', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
//           <View style={{position:'absolute', backgroundColor:'#9edc9e', borderRadius:12, height:100, width:100, top:10, justifyContent:'center', alignItems:'center'}}>
//             <Text style={{fontSize:20, color:'#252525'}}>{months[person.value.date.getMonth()]} {person.value.date.getDate()}</Text>
//             <Text style={{fontSize:20, color:'#252525'}}>{person.value.date.getFullYear()}</Text>
//           </View>
//           <View style={{position:'absolute', bottom:25, }}>
//             <Text style={{fontSize:25, color:'#252525'}}>{person.value.time}</Text>
//           </View>
//         </View>
//       </Pressable>
//     </View>
//   )
// }

// const OverlayView = props =>{
//   const bringUp = useRef(new Animated.Value(-800)).current;
//   const [passThrough, setPassThrough] = useState(null);
//   const [initial, setInitial] = useState(null);
  
//   useEffect(()=>{
//     Animated.spring(bringUp, {toValue:-250, useNativeDriver:false}).start();
//   }, [bringUp]);

//   return(
//     <Animated.View style={{...props.style, position:'absolute', left:0, bottom: bringUp, shadowColor:'black', shadowOpacity:0.3, shadowRadius:40, columnGap:100}} 
//     onStartShouldSetResponder={()=>true}
//     onMoveShouldSetResponder={()=>true}
//     onTouchStart={(event)=>{setInitial(event.nativeEvent.pageY)}}
//     onResponderMove={(event) => {moveHandler(event, bringUp, setPassThrough, initial)}}
//     onResponderRelease={() => {releaseHandler(bringUp, props.overlayInfo, passThrough)}}
//     >
//       {props.children}
//     </Animated.View>
//   )
// }

// function moveHandler(event, bringUp, setPassThrough, initial){
//   var relative = initial - event.nativeEvent.pageY;
//   if(relative > 0){
//     relative = Math.pow(relative, 3/4);
//   }
//   bringUp.setValue(relative-250);
//   setPassThrough(relative-250);
// }

// function releaseHandler(bringUp, overlayInfo, passThrough){
//   if(passThrough < -450){
//     var toVal = -900;
//     setTimeout(()=>{overlayInfo.setOverlay(false)}, 500);
//   }else{
//     var toVal = -250;
//   }
//   Animated.spring(bringUp, {toValue:toVal, useNativeDriver:false}).start();
// }

// const Overlay = ({overlayInfo}) => {
//   if(overlayInfo.overlay){
//     var person = overlayInfo.displaying;
//     var tutorName = (person.hasOwnProperty('tutorer'))? ((person.tutorer.hasOwnProperty('name'))? person.tutorer.name:null):null;
//     tutorName = (overlayInfo.displaying.tutoree == auth.currentUser.uid)? tutorName:auth.currentUser.displayName
//     return(
//       <OverlayView overlayInfo={overlayInfo} style={{height: 800, width: '100%', backgroundColor:'white', borderRadius:40}}>
//         <View style={{flex:1, height:'100%'}}>
//         <View style={{backgroundColor:'rgba(0, 0, 0, .32)', width:125, height:8, marginTop:20, alignSelf:'center', borderRadius:20}}/>
//         <Text style={styles.descriptionText}>Student: {person.name}</Text>
//         <Text style={styles.descriptionText}>Tutor: {(tutorName == null)? "No current tutor":tutorName}</Text>
//         <Text style={styles.descriptionText}>Subject: {person.subject}</Text>
//         <Text style={styles.descriptionText}>Location: {person.location}</Text>
//         <Text style={styles.descriptionText}>Time: {person.time}</Text>
//         <Text style={styles.descriptionText}>Day: {months[person.date.getMonth()] + '. ' + person.date.getDate() + ', ' + person.date.getFullYear()}</Text>
//         <Text style={{fontSize:24, marginTop:20, alignSelf:'center', width:'95%', textAlign:'center', color:'#252525'}}>Notes: {person.text}</Text>
//         <Button 
//         onPress={()=>{overlayInfo.setModalDisplay(true)}} 
//         style={{height:70, width:'65%',borderRadius:30, justifyContent:'center', alignItems:'center', alignSelf:'center', marginTop:26}} 
//         status='danger' 
//         appearance='outline'>
//           <Text/>
//           <Text style={{fontSize:30, fontWeight:"600"}}>Cancel</Text>
//         </Button>
//         <View style={{height:300}}></View>
//         </View>
//       </OverlayView>
//     );
//   }
// }

// const ModalOverlay=({overlayInfo})=>{
//   return(
//     <Modal visible={overlayInfo.modalDisplay}
//     onBackdropPress={()=>overlayInfo.setModalDisplay(false)} 
//     backdropStyle={{backgroundColor:'rgba(0, 0, 0, 0.5)'}}
//     style={{backgroundColor:'white', height:'40%', width:'80%', position:'absolute', alignSelf:'center', justifyContent:'center', alignItems:'center', borderRadius:35}}>
//       <Text style={{fontSize:25, height:'40%', width:'75%', textAlign:'center', color:'#252525'}}>Are you sure that you want to cancel your session?</Text>
//       <Button appearance='outline' status='danger' onPress={()=>clickHandler({overlayInfo})} style={{height:'22%', width:'70%', borderRadius:35, justifyContent:'center', alignItems:'center'}}>
//         <View/>
//         <Text style={{fontSize:40, textAlign:'center'}}>Confirm</Text>
//       </Button>
//     </Modal>
//   );
// }

const clickHandler = async ({overlayInfo}) =>{
  overlayInfo.setModalDisplay(false);
  overlayInfo.setOverlay(false);
  // var isAvailable;
  // onValue(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + overlayInfo.keyed + "/available"), (snapshot) =>{
  //   isAvailable=snapshot.val();
  // })
  if(!overlayInfo.displaying.available){
    if(now.getMonth() < overlayInfo.displaying.date.getMonth() || now.getDate() + 2 < overlayInfo.displaying.date.getDate()){
      //Don't know if I can delete with a http request
      // const token = (await GoogleSignin.getTokens()).accessToken;
      // await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/" + overlayInfo.keyed, {
      //   method:"DELETE",
      //   headers:{
      //     'Authorization':'Bearer ' + token,
      //   },
      //   sendUpdates:"all"
      // }).then((data)=>{
      //   console.log(JSON.stringify(data));
      // })
      if(overlayInfo.displaying.tutoree == auth.currentUser.uid){
        remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + overlayInfo.keyed));
        remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + overlayInfo.keyed));
        // remove(ref(db, "mhusd/schedule/" + overlayInfo.displaying.tutorer.id + "/" + overlayInfo.keyed));
        set(ref(db, "mhusd/schedule/" + overlayInfo.displaying.tutorer.id + "/" + overlayInfo.keyed + "/studentCanceled"), true);
        overlayInfo.setUpdate(overlayInfo.update+1);
        overlayInfo.setModalDisplay(false);
        overlayInfo.setOverlay(false);
        // console.log("Tutoree canceled")
      }else{
        remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + overlayInfo.keyed));
        set(ref(db, "mhusd/sessions/" + overlayInfo.displaying.tutoree + "/" + overlayInfo.keyed + "/available"), true);
        set(ref(db, "mhusd/schedule/" + overlayInfo.displaying.tutoree + "/" + overlayInfo.keyed + "/available"), true);
        set(ref(db, "mhusd/schedule/" + overlayInfo.displaying.tutoree + "/" + overlayInfo.keyed + "/tutorer"), {canceled:true});
        // console.log("Tutor canceled")
      }
      alert("removed");
    }else{
      alert("I'm sorry but you can't cancel within two days of your set date when the session is taken. You can contact the other student directly through the google calendar event if you need to.");
    }
  }else{
    remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + overlayInfo.keyed));
    remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + overlayInfo.keyed));
    alert("removed");
    // console.log("canceled with no tutor");
  }
  overlayInfo.setUpdate(overlayInfo.update+1);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer:{
    marginTop:20,
    paddingBottom: 20,
    alignItems:'center',
    gap:20
  },
  pressContainer:{
    width:320,
    height:68,
    marginHorizontal:20,
    alignItems: 'center',
    justifyContent: 'center',
    padding:3,
    color:'blue'
  },
  button:{
    buttonRadius:10,
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'row',
  },
  text:{
    fontSize:20,
    color:'black',
    flex: 2/7,
  },
  descriptionText:{
    fontSize:26,
    alignSelf:'center',
    marginTop:20, 
    color:'#252525'
  }
})
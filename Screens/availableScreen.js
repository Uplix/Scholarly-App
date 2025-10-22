import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, RefreshControl, Image, SafeAreaView } from 'react-native';
import { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';
// import constants from '../constants';
import { Modal, Button } from '@ui-kitten/components';
import { ref, onValue, remove, set, push } from 'firebase/database';
import { auth, db } from '../firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AppContext } from '../App';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ItemScreen from './availableItemScreen';
import ListComponent from '../components/listComponentAvailable';
import { useNavigation } from '@react-navigation/native';
import { randomStringGenerator } from '../components/functions';
// import { ScheduleContext } from './scheduledScreen';

// import Individual from '../Components/individual';


// var peopleAvailable = [["John", "Fighting", "8th"], ["Harold", "Computers", "5th"], ["Danny", "Math", "11th"], ["Dude", "English", "1st"]];
// var peopleScheduled = constants.schedule;
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var now = new Date();
const Stack = createNativeStackNavigator();
export const AvailableContext = createContext();

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
  const [available, setAvailable] = useState([]);
  // const [availableJSON, setAvailableJSON] = useState({});
  const [update, setUpdate] = useState(0);
  const [refreshing, setRefreshing] = useState();
  const navigation = useNavigation();
  // const {setLoading, setExplain} = route.params;

  const setLoading = useContext(AppContext).setLoading;
  const setExplain = useContext(AppContext).setExplain;

  useEffect(()=>{
    const updating = update;
    // var sending = auth.currentUser? auth.currentUser.uid : "noUserId"
    const availableRef = (ref(db, "mhusd/sessions/"));
    onValue(availableRef, (snapshot) =>{
        var returnVal = [];
        snapshot.forEach((id) =>{
          if(id.key != auth.currentUser.uid){
            id.forEach((child)=>{
              var value = child.val();
              if(value.date >= now.getTime()){
                if(value.available){
                  value.milliseconds = value.date;
                  value.date = new Date(value.date);
                  var indiv = {
                    key:[id.key, child.key],
                    value:value
                  }
                  returnVal.push(indiv);
                }
              }
            })
          }
        })
        // setAvailableJSON(snapshot);
        setAvailable(returnVal);
    })
  }, []);

  const acceptEvent = useCallback(async (object)=>{
    var isAvailable;
    onValue(ref(db, "mhusd/sessions/" + object.key[0] + "/" + object.key[1] + "/available"), (snapshot)=>{
      isAvailable = snapshot.val();
    })
    if(isAvailable){
      var date = object.value.milliseconds;
      var time = object.value.time;
      var addedMills = 0;
      time = time.split(':');
      if(time[0] != 12){
        addedMills += parseInt(time[0]) * 3600000;
      }
      addedMills += parseInt(time[1].split(" ")[0]) * 60000;
      time = time[1].split(' ');
      if(time[1] == "PM"){
        addedMills += 3600000 * 12;
      }else if(time[1] == "AM"){
      }else{
        throw new Error("An error has occured when calculating the time. Please reload the site and try again.")
        // alert("An error has occured when calculating the time. Please reload the site and try again.");
        // return
      }
      date+=addedMills;
      
      // console.log(date);
      const start = new Date(date);
      const end = new Date(date + 3600000);
      var description = "Subject: " + object.value.subject + "    Grade: " + object.value.grade;
      var requestId = randomStringGenerator(7);
      const myeEvent = {
        summary: "Tutor Session",
        description: description,
        start:{
          dateTime:start.toISOString(),
          timeZone:'America/Los_Angeles'
        },
        end:{
          dateTime:end.toISOString(),
          timeZone:'America/Los_Angeles'
        },
        attendees:[
          {email:auth.currentUser.email},
          {email:object.value.email}
        ],
        conferenceData: {
          createRequest: {
            requestId: requestId,
            conferenceSolutionKey: { 
              type: "hangoutsMeet"
            },
          },
        },
        guestsCanModify:true,
        reminders:{
          overides:[
            {method:"email", minutes:24*60},
            {method:"email", minutes:120}
          ]
        },
        location:(object.value.location == "Google Meets")?"":object.value.location,
      }
      // var name = auth.currentUser.displayName.split(" ");
      // console.log(start.toDateString());
      const token = (await GoogleSignin.getTokens()).accessToken;
      
      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method:"POST",
        headers:{
          'Authorization':'Bearer ' + token,
          conferenceDataVersion: 1,
          sendUpdates:"all",
          supportsAttachments:true,
          eventId:object.key[1] + requestId,
        },
        body:JSON.stringify(myeEvent),
      }).then(data=>{
        // let text = await new Response(JSON.stringify(data));
        if(data.ok){
          // var displaying = object.value;
          // var name = auth.currentUser.displayName.split(" ");
          set(ref(db, "mhusd/sessions/" + object.key[0] + "/" + object.key[1] + "/available"), false);
          set(ref(db, "mhusd/schedule/" + object.key[0] + "/" + object.key[1] + "/tutorer"), {
            name:auth.currentUser.displayName,
            id:auth.currentUser.uid
          });
          // displaying.tutor = auth.currentUser.displayName;
          // overlayInfo.setModalDisplay(false);
          // overlayInfo.setOverlay(false);
          set(ref(db, "mhusd/sessions/" + object.key[0] + "/" + object.key[1] + "/tutorer"), {
            name:auth.currentUser.displayName,
            id:auth.currentUser.uid
          });
          set(ref(db, "mhusd/schedule/" + object.key[0] + "/" + object.key[1] + "/available"), false);
          var upload = object.value;
          upload.date = upload.milliseconds;
          upload.available = false;
          // upload.tutorer.name = auth.currentUser.displayName;
          // upload.id = auth.currentUser.uid;
          delete upload['milliseconds'];
          set(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + object.key[1]), {
            ...upload,
            tutorer:{
              name:auth.currentUser.displayName,
              id:auth.currentUser.uid
            }
          });
          // var niceData = JSON.stringify(data);
          // console.log(niceData);
          alert("Check your google calendar. An event was set for " + start.toDateString());
          // overlayInfo.setLoading(false);
          setExplain(true);
        }else{
          // overlayInfo.setModalDisplay(false);
          // overlayInfo.setOverlay(false);
          throw new Error("You may not have given the app permision to access google calendar. To fix this: logout, sign back in, and give the app permision to acces your google calendar.")
          // alert("An error occured adding event to google calndar. You may not have given the app permision to access google calendar. To fix this: logout, sign back in, and give the app permision to acces your google calendar.")
          // overlayInfo.setLoading(false);
        }
        return data.json();
      }).then(data=>{
        console.log(data);
      }).catch((error)=>{
        // console.log(error);
        throw new Error("An error occured adding to calendar: " + error);
        // overlayInfo.setLoading(false);
      })
    }else{
      throw new Error("I'm sorry, it seems that somebody else has already taken this tutor session");
      // overlayInfo.setLoading(false);
    }
  }, [])
  

  
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
  //   schedule:available,
  //   keyed:keyed,
  //   setKeyed:setKeyed,
  //   update:update,
  //   setUpdate:setUpdate,
  //   availableJSON:availableJSON,
  //   setLoading:setLoading,
  //   setExplain:setExplain
  // }

  const onRefresh = useCallback(()=>{
    setRefreshing(true);
    setUpdate(update+1);
    setTimeout(()=>{
      setRefreshing(false);
    }, 750);
  }, [])
  
  return(
    <View style={{flex:1}}>
        <AvailableContext.Provider value={{refreshing:refreshing, onRefresh:onRefresh, schedule:available, navigation:navigation, acceptEvent:acceptEvent}}>
        <Stack.Navigator screenOptions={{
          headerShown:false
        }}
        initialRouteName='AvailableScreen'
        >
          <Stack.Screen name='AvailableScreen' component={LoggedIn}/>
          <Stack.Screen name='AvailableDetails' component={ItemScreen}/>
        </Stack.Navigator>
      </AvailableContext.Provider>
    </View>
 );
}

function LoggedIn({overlayInfo, refreshing, onRefresh}) {
  const context = useContext(AvailableContext)
  return(
    <SafeAreaView style={{flex:1, backgroundColor:'#F0F0F0'}}>
      <ScrollView 
      // scrollEnabled={!overlayInfo.overlay} 
      style={{flex: 1}}
      refreshControl={<RefreshControl refreshing={context.refreshing} onRefresh={context.onRefresh}/>}
      >
        <View style={{marginBottom:10, height:'auto', justifyContent:'center', alignItems:'center', marginTop:12}}>
          <Text style={{fontSize:35, color:'#252525'}}>Available</Text>
        </View>
        {(context.schedule[0] == null)?<Nothing />:<Buttoner schedule={context.schedule} />}
        {/* <View style={{height:30}}/> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const Nothing = () => {
  return(
    <View style={{alignItems:'center', justifyContent:'center', alignSelf:'center', marginTop:60, width:'100%'}}>
      <Image style={{height:250, width:250}} source={require('../Images/sadEmoji.png')}/>
      <Text style={{marginTop:40, fontSize:22, width:'90%', textAlign:'center', color:'#252525'}}>There's nothing here!!!</Text>
      <Text style={{marginTop:8, fontSize:22, width:'90%', textAlign:'center', color:'#252525'}}>Don't worry, someone will need help soon</Text>
      <Text style={{marginTop:50, fontSize:22, width:'90%', textAlign:'center', color:'#252525'}}>Refresh this page by pulling down</Text>
    </View>
  )
}

const Buttoner = ({schedule}) =>{
  const context = useContext(AvailableContext);
  const navigation = context.navigation;
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
//     <View key={person.key.idKey}>
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
//     Animated.spring(bringUp, {toValue:-275, useNativeDriver:false}).start();
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
//   bringUp.setValue(relative-275);
//   setPassThrough(relative-275);
// }

// function releaseHandler(bringUp, overlayInfo, passThrough){
//   if(passThrough < -450){
//     var toVal = -900;
//     setTimeout(()=>{overlayInfo.setOverlay(false)}, 500);
//   }else{
//     var toVal = -275;
//   }
//   Animated.spring(bringUp, {toValue:toVal, useNativeDriver:false}).start();
// }

// const Overlay = ({overlayInfo}) => {
//   if(overlayInfo.overlay){
//     var person = overlayInfo.displaying;
//     return(
//       <OverlayView overlayInfo={overlayInfo} style={{height: 800, width: '100%', backgroundColor:'white', borderRadius:40}}>
//         <View style={{backgroundColor:'rgba(0, 0, 0, .32)', width:125, height:8, marginTop:20, alignSelf:'center', borderRadius:20}}/>
//         <Text style={styles.descriptionText}>Name: {person.name}</Text>
//         <Text style={styles.descriptionText}>Subject: {person.subject}</Text>
//         <Text style={styles.descriptionText}>Grade Level: {person.grade}</Text>
//         <Text style={styles.descriptionText}>Location: {person.location}</Text>
//         <Text style={styles.descriptionText}>Day: {months[person.date.getMonth()] + '. ' + person.date.getDate() + ', ' + person.date.getFullYear()}</Text>
//         <Text style={styles.descriptionText}>Time: {person.time}</Text>
//         <Text style={{maxHeight:80, fontSize:24, marginTop:20, alignSelf:'center', width:'95%', textAlign:'center', color:'#252525'}}>Notes: {person.text}</Text>
//         <Button 
//         onPress={()=>{overlayInfo.setModalDisplay(true)}} 
//         style={{height:70, width:'65%',borderRadius:30, marginTop:26, alignSelf:'center'}}
//         status='success'
//         appearance='outline'
//         size='large'
//         > <Text/><Text style={{fontSize:30, fontWeight:'600'}}>Accept</Text></Button>
//         <View style={{height:300}}></View>
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
//       <Text style={{fontSize:25, height:'40%', width:'75%', textAlign:'center', color:'#252525'}}>Are you sure that you want to accept the session?</Text>
//       <Button appearance='outline' status='success' onPress={()=>clickHandler({overlayInfo})} style={{height:'22%', width:'70%', borderRadius:35, justifyContent:'center', alignItems:'center'}}>
//         <Text/>
//         <Text style={{fontSize:40}}>Confirm</Text>
//       </Button>
//     </Modal>
//   );
// }

const clickHandler = async ({overlayInfo}) =>{
  overlayInfo.setLoading(true);
  overlayInfo.setUpdate(overlayInfo.update+1);
  var isAvailable;
  onValue(ref(db, "mhusd/sessions/" + overlayInfo.keyed[0] + "/" + overlayInfo.keyed[1] + "/available"), (snapshot)=>{
    isAvailable = snapshot.val();
  })
  if(isAvailable){
    var date = overlayInfo.displaying.milliseconds;
    var time = overlayInfo.displaying.time;
    var addedMills = 0;
    time = time.split(':');
    if(time[0] != 12){
      addedMills += parseInt(time[0]) * 3600000;
    }
    addedMills += parseInt(time[1]) * 60000;
    time = time[1].split(' ');
    if(time[1] == "PM"){
      addedMills += 3600000 * 12;
    }else if(time[1] == "AM"){
    }else{
      alert("An error has occured when calculating the time. Please reload the site and try again.");
      return
    }
    date+=addedMills;
    // console.log(date);
    const start = new Date(date);
    const end = new Date(date + 3600000);
    var description = "Subject: " + overlayInfo.displaying.subject + "    Grade: " + overlayInfo.displaying.grade;
    var requestId = overlayInfo.keyed[1];
    requestId = requestId.substring(0, 7);
    const myeEvent = {
      'summary': "Tutor Session",
      'description': description,
      'start':{
        'dateTime':start.toISOString(),
        'timeZone':'America/Los_Angeles'
      },
      'end':{
        'dateTime':end.toISOString(),
        'timeZone':'America/Los_Angeles'
      },
      'attendees':[
        {'email':auth.currentUser.email},
        {'email':overlayInfo.displaying.email}
      ],
      'conferenceData':{
        'conferenceSolution':{
          'key':{'type':'hangoutsMeet'},
          'name':'Google Meet'
        },
        'createRequest':{
          'requestId':requestId,
          'conferenceSolutionKey':{
            'type':'hangoutsMeet'
          }
        }
      },
      'guestsCanModify':true,
      'reminders':{
        'overides':[
          {'method':"email", 'minutes':24*60},
          {'method':"email", 'minutes':120}
        ]
      },
      'location':(overlayInfo.displaying.location == "Google Meets")?null:overlayInfo.displaying.location,
    }
    var name = auth.currentUser.displayName.split(" ");
    // console.log(start.toDateString());
    const token = (await GoogleSignin.getTokens()).accessToken;
    
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method:"POST",
      headers:{
        'Authorization':'Bearer ' + token,
      },
      eventId:overlayInfo.keyed[1],
      body:JSON.stringify(myeEvent),
      conferenceDataVersion:1,
      sendUpdates:"all",
    }).then((data)=>{
      if(data.ok){
        var displaying = overlayInfo.displaying;
        var name = auth.currentUser.displayName.split(" ");
        set(ref(db, "mhusd/sessions/" + overlayInfo.keyed[0] + "/" + overlayInfo.keyed[1] + "/available"), false);
        set(ref(db, "mhusd/schedule/" + overlayInfo.keyed[0] + "/" + overlayInfo.keyed[1] + "/tutorer"), {
          name:auth.currentUser.displayName,
          id:auth.currentUser.uid
        });
        displaying.tutor = name[0];
        overlayInfo.setModalDisplay(false);
        overlayInfo.setOverlay(false);
        set(ref(db, "mhusd/sessions/" + overlayInfo.keyed[0] + "/" + overlayInfo.keyed[1] + "/tutorer"), {
          name:auth.currentUser.displayName,
          id:auth.currentUser.uid
        });
        set(ref(db, "mhusd/schedule/" + overlayInfo.keyed[0] + "/" + overlayInfo.keyed[1] + "/available"), false);
        var upload = overlayInfo.displaying;
        upload.date = upload.milliseconds;
        upload.available = false;
        delete upload['milliseconds'];
        set(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + overlayInfo.keyed[1]), upload);
        var niceData = JSON.stringify(data);
        // console.log(niceData);
        alert("Check your google calendar. An event was set for " + start.toDateString());
        overlayInfo.setLoading(false);
        overlayInfo.setExplain(true);
      }else{
        overlayInfo.setModalDisplay(false);
        overlayInfo.setOverlay(false);
        alert("An error occured adding event to google calndar. You may not have given the app permision to access google calendar. To fix this: logout, sign back in, and give the app permision to acces your google calendar.")
        overlayInfo.setLoading(false);
      }
      
    }).catch((error)=>{
      // console.log(error);
      alert("An error occured adding to calendar: " + error);
      overlayInfo.setLoading(false);
    })
  }else{
    alert("I'm sorry, it seems that somebody else has already taken this tutor session");
    overlayInfo.setLoading(false);
  }
  // console.log("pressed");
  
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







// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
// import { useState, useEffect, useRef } from 'react';
// import constants from '../constants';
// import { Modal } from '@ui-kitten/components';
// // import Individual from '../Components/individual';

// var now = new Date();
// // var peopleAvailable = [["John", "Fighting", "8th"], ["Harold", "Computers", "5th"], ["Danny", "Math", "11th"], ["Dude", "English", "1st"]];
// var peopleScheduled = constants.available;
// var months = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// export default function Schedule({navigation}){
//   var [overlay, setOverlay] = useState(false);
//   var [displaying, setDisplaying] = useState(null);
//   var [place, setPlace] = useState(null);
//   var [modalDisplay, setModalDisplay] = useState(false);
//   var overlayInfo = {
//     overlay: overlay,
//     setOverlay:setOverlay, 
//     displaying:displaying,
//     setDisplaying:setDisplaying,
//     place:place,
//     setPlace:setPlace,
//     modalDisplay:modalDisplay,
//     setModalDisplay:setModalDisplay,
//     navigation:navigation
//   }
//   return(
//     <View style={{flex:1}}>
//         <LoggedIn overlayInfo={overlayInfo} />
//         <Overlay overlayInfo={overlayInfo} />
//         <ModalOverlay overlayInfo={overlayInfo}/>
//     </View>
//  );
// }




// function LoggedIn({overlayInfo}) {
//   return(
//     <View style={{flex:1, backgroundColor:'#F0F0F0'}}>
//       <ScrollView scrollEnabled={!overlayInfo.overlay} style={{paddingVertical: 50, flex: 3/5,}}>
//         <View style={{marginBottom:25, height:'auto', marginTop:25, justifyContent:'center', alignItems:'center'}}>
//           <Text style={{color:'black', fontSize:35}}>Available</Text>
//         </View>
//         <Buttoner overlayInfo={overlayInfo} />
//         <View style={{height:30}}/>
//       </ScrollView>
//     </View>
//   );
// }

// const Buttoner = ({overlayInfo}) =>{
//   return(
//     <View style={styles.buttonContainer}>
//       {peopleScheduled.map((object, i) => Individual({object, i, overlayInfo}))}
//     </View>
//   )
// }

// const Individual = props =>{
//   let person = props.object;
//   let overlayInfo = props.overlayInfo;
//   return(
//     <View key={props.i}>
//       <Pressable onPress={() => {
//         if(!overlayInfo.overlay){
//         overlayInfo.setOverlay(true); 
//         overlayInfo.setDisplaying(person);
//         overlayInfo.setPlace(props.i);
//       }}} 
//       style={{flexDirection:'row', backgroundColor:'#fdfdfd', borderRadius: 50.4, width: 360, justifyContent: 'center', height: 175, alignItems: 'center', marginTop:25}}
//       >
//         <View style={{width:'50%', height:'100%', flexDirection:'column' ,justifyContent:'center', alignItems:'center'}}>
//           <Text style={{fontSize:25, position:'absolute', top:40}}>{person.subject}</Text>
//           <Text style={{fontSize:25, position:'absolute', bottom:40}}>Grade: {person.grade}</Text>
//         </View>
//         <View style={{width:'50%', height:'100%', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
//           <View style={{position:'absolute', backgroundColor:'#9edc9e', borderRadius:12, height:100, width:100, top:10, justifyContent:'center', alignItems:'center'}}>
//             <Text style={{fontSize:20}}>{months[person.date.getMonth()]} {person.date.getDate()}</Text>
//             <Text style={{fontSize:20}}>{person.date.getFullYear()}</Text>
//           </View>
//           <View style={{position:'absolute', bottom:25, }}>
//             <Text style={{fontSize:23}}>{person.time}</Text>
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
//     Animated.spring(bringUp, {toValue:-300, useNativeDriver:false}).start();
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
//   bringUp.setValue(relative-300);
//   setPassThrough(relative-300);
// }

// function releaseHandler(bringUp, overlayInfo, passThrough){
//   if(passThrough < -500){
//     var toVal = -900;
//     overlayInfo.setOverlay(false);
//   }else{
//     var toVal = -300;
//   }
//   Animated.spring(bringUp, {toValue:toVal, useNativeDriver:false}).start();
// }

// const Overlay = ({overlayInfo}) => {
//   var person = overlayInfo.displaying;
//   if(overlayInfo.overlay){
//     return(
//       <OverlayView overlayInfo={overlayInfo} style={{height: 800, width: '100%', backgroundColor:'white', borderRadius:40}}>
//         <Text style={styles.descriptionText}>Name: {person.name}</Text>
//         <Text style={styles.descriptionText}>Subject: {person.subject}</Text>
//         <Text style={styles.descriptionText}>Grade Level: {person.grade}</Text>
//         <Text style={styles.descriptionText}>Time: {person.time}</Text>
//         <Text style={styles.descriptionText}>Day: {months[person.date.getMonth()] + '. ' + person.date.getDate() + ', ' + person.date.getFullYear()}</Text>
//         <Text style={{maxHeight:80, fontSize:24, marginTop:20, marginHorizontal:30, alignSelf:'center'}}>Notes: {person.extraText}</Text>
//         <Pressable onPress={()=>overlayInfo.setModalDisplay(true)} style={{backgroundColor:'#85d485', height:80, width:'70%',borderRadius:30, justifyContent:'center', alignItems:'center', position:'absolute', bottom:350, alignSelf:'center'}}>
//           <Text style={{fontSize:38}}>Accept</Text>
//         </Pressable>
//         <View style={{height:300}}></View>
//       </OverlayView>
//     );
//   }
// }

// const ModalOverlay=({overlayInfo})=>{
  // return(
  //   <Modal visible={overlayInfo.modalDisplay}
  //   onBackdropPress={()=>overlayInfo.setModalDisplay(false)} 
  //   backdropStyle={{backgroundColor:'rgba(0, 0, 0, 0.5)'}}
  //   style={{backgroundColor:'white', height:'40%', width:'80%', position:'absolute', alignSelf:'center', justifyContent:'center', alignItems:'center'}}>
  //     <Text style={{fontSize:25, height:'40%', width:'75%'}}>Are you sure that you want to accept your event?</Text>
  //     <Pressable onPress={()=>clickHandler({overlayInfo})} style={{height:'22%', width:'70%', borderRadius:20, backgroundColor:'#85d485', justifyContent:'center', alignItems:'center'}}>
  //       <Text style={{fontSize:40}}>Confirm</Text>
  //     </Pressable>
  //   </Modal>
  // );
// }

// const clickHandler = ({overlayInfo}) =>{
//   var accepted = constants.available[overlayInfo.place];
//   constants.available.splice(overlayInfo.place, 1);
//   constants.schedule.push(accepted);
//   overlayInfo.setModalDisplay(false);
//   overlayInfo.setOverlay(false);
//   overlayInfo.navigation.navigate('Scheduled')
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#25292e',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonContainer:{
//     paddingBottom: 20,
//     alignItems:'center',
//   },
//   pressContainer:{
//     width:320,
//     height:68,
//     marginHorizontal:20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding:3,
//     color:'blue'
//   },
//   button:{
//     buttonRadius:10,
//     width:'100%',
//     height:'100%',
//     alignItems:'center',
//     justifyContent:'center',
//     flexDirection:'row',
//   },
//   text:{
//     fontSize:20,
//     color:'black',
//     flex: 2/7,
//   },
//   descriptionText:{
//     fontSize:26,
//     alignSelf:'center',
//     marginTop:20
//   }
// });
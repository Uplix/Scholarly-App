// import 'react-native-gesture-handler'
import * as React from 'react';
// // import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation';
import Available from './Screens/availableScreen';
import Schedule from './Screens/scheduledScreen';
import TutorRequest from './Screens/tutorRequestScreen';
import Rater from './Screens/ratingScreen';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
// import { EvaIconsPack } from '@ui-kitten/eva-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import * as EvaIconsPack from 'eva'
// // import * as Google from 'expo-auth-session/providers/google';
// // import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, getRedirectResult, onAuthStateChanged, signInWithCredential, signInWithRedirect, signOut } from 'firebase/auth';
import {auth, db} from './firebaseConfig';
import Settings from './Screens/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator, Pressable, SafeAreaView, Image, ImageBackground, Text, LogBox, Animated, Easing } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { onValue, ref, remove, set } from 'firebase/database';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import Onboarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import ChooseDistrict from './Screens/chooseDistrict';
import SvgComponent from './componenter/googleIcon';
import CreateAccount from './Screens/createAccount';
//WebBrowser.maybeCompleteAuthSession();

const Tab = createMaterialBottomTabNavigator();
const Stack = createNativeStackNavigator();

const nowNow = new Date();
let theEmail;
// const now = new Date(nowNow.getFullYear(), nowNow.getMonth(), nowNow.getDate() + 4);
const districts = {
  mhusd:{
    email:"students.mhusd.org",
    grades:[9, 10, 11, 12],
    schools:["Ann Sobrato", "Live Oak"]
  },
  
}

// import { View } from 'react-native';

export const AppContext = React.createContext(null);

export default function App(){
  // return <View style={{flex:1, backgroundColor:'red'}}></View>
  // LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
  // LogBox.ignoreAllLogs();//Ignore all log notifications
  
  const [chooseDistrict, setChooseDistrict] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [schedule, setSchedule] = React.useState([]);
  const [available, setAvailable] = React.useState();
  const [rate, setRate] = React.useState([]);
  const [update, setUpdate] = React.useState(0);
  const [onboard, setOnboard] = React.useState(true);
  const [isTutor, setIsTutor] = React.useState(false);
  const [explain, setExplain] = React.useState(false);
  const [reload, setReload] = React.useState(0);
  const [district, setDistrict] = React.useState(null);
  const [needCreateAccount, setNeedCreateAccount] = React.useState(false);
  // const [theEmail, setTheEmail] = React.useState(null);
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   iosClientId:"227494854259-2eic2fgls3bp6f30gi9ld7lo11vhjmt4.apps.googleusercontent.com",
  //   androidClientId:"227494854259-du5p3uqer819e7a8ooicuf8djrjejon5.apps.googleusercontent.com",
  // });

  // React.useEffect(async ()=>{
  //   setLoading(true);
  //   const didOnbaord = await AsyncStorage.getItem("onboarded");
  //   setOnboard(didOnbaord);
  //   setLoading(false);
  // }, []);

  // React.useEffect(() => {
  //   setLoading(true);
  //   onValue(ref(db, "mhusd/signinEmail"), (snapshot)=>{
  //     theEmail = snapshot.val();
  //   })
    
  // }, []);

  React.useEffect(()=>{
    // console.log("current email =>", theEmail);
    // Initial configuration
    // setTimeout(()=>{
      // if(theEmail != null){
    checkOnboard();
    setLoading(true);
    checkDistrict();
    
        // Check if user is already signed in
    
      // }else{
        // setAttempts(attempts+1);
    //   }
    //   if(attempts == 15){
    //     alert("We are having trouble contacting the server. Check your connection and try again");
    //     setAttempts(0)
    //   }
    // }, 500)
  }, [reload])

  const checkDistrict = async ()=>{
    // await AsyncStorage.setItem("district", '')
    // console.log('checking district')
    let theDistrict = await AsyncStorage.getItem("district");
    theEmail = districts[theDistrict]?.email;
    // console.log("this =>",district, theEmail)
    if(theDistrict == undefined || theDistrict == null || theDistrict == '' || districts[theDistrict] == undefined || districts[theDistrict] == null){
      // console.log('choose district')
      setChooseDistrict(true);
      setLoading(false);
    }else{
      setChooseDistrict(false);
      setDistrict(theDistrict);
      GoogleSignin.configure({
        webClientId: '227494854259-e463ktac77q21p4kgc1vpqa2nk8j81at.apps.googleusercontent.com',
        scopes:["https://www.googleapis.com/auth/calendar.events"],
        offlineAccess:false,
        hostedDomain:districts[theDistrict].email
      });
      
      _isSignedIn();
      // setLoading(false);
    }
  }

  const checkOnboard = async () =>{

    // AsyncStorage.setItem("onboarded", "false")

    const onboarded = await AsyncStorage.getItem("onboarded");
    if(onboarded == null || onboarded=="false"){
      setOnboard(false);
    }else{
      setOnboard(true);
    }
    // console.log("State =>", onboard)
  }

  const onboardComplete = () =>{
    setOnboard(true);
    AsyncStorage.setItem("onboarded", "true");
  }

  const _isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      // alert('User is already signed in');
      // Set User Info if user is already signed in
      _getCurrentUserInfo();
    } else {
      // console.log('Please Login');
      setLoading(false);
    }
  };

  const _getCurrentUserInfo = async () => {
    setLoading(true);
    try {
      const {idToken, user} = await GoogleSignin.signInSilently();
      // console.log('User Info --> ', user);
      const credential = GoogleAuthProvider.credential(idToken);
      // console.log("credential =>", credential);
      await signInWithCredential(auth, credential);
      setUserInfo({user});
      // setUpdate(update+1);
      checking();
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // alert('User has not signed in yet');
        // console.log('User has not signed in yet');
      } else {
        //alert("Unable to get user's info");
        // console.log("Unable to get user's info");
        setUserInfo(null);
        setLoading(false);
      }
    }
    // setLoading(false);
  };
  
  const _signIn = async () => {
    // It will prompt google Signin Widget
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({
        // Check if device has Google Play Services installed
        // Always resolves to true on iOS
        showPlayServicesUpdateDialog: true,
      });

      const {idToken, user} = await GoogleSignin.signIn();

      if(user.email.split('@')[1] == theEmail || user.email == "learninglabs.help@gmail.com"){
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
        // console.log(auth);
        setUserInfo(user);
        // console.log('User Info --> ', userInfo);
        // setUpdate(update+1);
        checking();
      }else{
        alert("Email is invalid. Please use your school email");
        // setLoading(false);
        _signOut();
      }
    } catch (error) {
      console.log('Message', JSON.stringify(error));
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        alert('Login Cancelled');
        setLoading(false);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('Play Services Not Available or Outdated');
      } else {
        console.log(error.message);
      }
    }
    // setLoading(false);
  };
  const checking = () =>{
    setLoading(true);
    try{
      onValue(ref(db, "mhusd/users/" + auth.currentUser.uid + "/district"), (snapshot)=>{
        if(!snapshot.exists()){
          setNeedCreateAccount(true);
        }else{
          setNeedCreateAccount(false);
        }
      })

      onValue(ref(db, "mhusd/schedule/" + auth.currentUser.uid), (snapshot)=>{
        var done = []
        snapshot.forEach((id)=>{
          var value = id.val();
          let dating = new Date(value.date);
          if(value.hasOwnProperty('tutorer')){
            if(value.tutorer.hasOwnProperty('canceled')){
              alert("Your tutor canceled the session. Don't worry, another tutor can still accept the session. (Subject: " + value.subject + ", Date: " + dating.toDateString() + ", Time: " + value.time + ")");
              remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + id.key + "/tutorer/canceled"));
            }
          }
          
          if(value.hasOwnProperty('studentCanceled') && value.studentCanceled == true){
            alert("The student canceled the session. Don't worry, there will always be more people who need help!  (Subject: " +value.subject + ", Date: " + dating.toDateString() + ", Time: " + value.time + ")");
            remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + id.key))
          }else{
            if(value.date < nowNow.getTime()){
              if(value.tutoree == auth.currentUser.uid){
                if(value.hasOwnProperty('tutorer')){
                  if(value.tutorer.hasOwnProperty('id')){
                    done.push({
                      isTutor:false,
                      value:value,
                      key:id.key,
                      date:dating
                    })
                  }else{
                    remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + id.key));
                    remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + id.key));
                    alert("Your tutor request expired and was removed");
                  }
                }else{
                  remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + id.key));
                  remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + id.key));
                  alert("Your tutor request expired and was removed");
                }
              }else{
                done.push({
                  isTutor:true,
                  value:value, 
                  key:id.key,
                  date:dating
                });
              }
            }
          }
        })
        setRate(done);
        
      })

      onValue(ref(db, "mhusd/users/" + auth.currentUser.uid + "/isTutor"), (snapshot)=>{
        if(snapshot.exists() && snapshot.val() == true){
            setIsTutor(true);
        }else{
            setIsTutor(false);
        }
    })
    }catch(e){
      alert("An error has occured " + e.message);
      // setLoading(true);
    }finally{
      setLoading(false);
    }
    // console.log("things that need to be rated ", rate);
  }
  // React.useEffect(()=>{
  //   setLoading(true);
  //   updating = update;
  //   if(userInfo){
  //     // try{
  //     onValue(ref(db, "mhusd/schedule/" + auth.currentUser.uid), (snapshot)=>{
  //       var done = [];
  //       snapshot.forEach((id)=>{
  //         const value = id.val();
  //         // if(value.date < now.getMilliseconds()){
  //           done.push({
  //             value:value, 
  //             key:id.key
  //           });
  //         // }
  //       })
  //       setRate(done);
  //       setLoading(false);
  //     })
  //     // }catch(e){
  //       // alert("An error has occured " + e.message);
  //       //setLoading(true);
  //     // }
  //   }
  // }, [])

  const _signOut = async () => {
    console.log("signing out");
    setLoading(true);
    // Remove user session from the device.
    try {
      await AsyncStorage.removeItem("district");
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await signOut(auth);
      // Removing user Info
      setUserInfo(null); 
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // React.useEffect(()=>{
  //   var returnVal = [];
  //   var sending = auth.currentUser? auth.currentUser.uid : "noUserId"
  //   const scheduleRef = ref(db, "mhusd/schedule/" + sending, orderByChild('date'));
  //   onValue(scheduleRef, (snapshot) =>{
  //     if(snapshot.exists()){
  //       snapshot.forEach((child)=>{
  //         var value = child.val();
  //         value.date = new Date(value.date);
  //         var val = {
  //           key:child.key,
  //           value:value
  //         }
  //         returnVal.push(val);
  //       })
  //     }
  //   })
  //   setSchedule(returnVal);
  //   console.log("refreshed");
  // }, []);
  // const checkLocalUser = async () => {
  //   try {
  //     setLoading(true);
  //     const userJSON = await AsyncStorage.getItem("@user");
  //     const userData = userJSON? JSON.parse(userJSON): null;
  //     console.log("local storage: ", userData);
  //     setUserInfo(userData);
  //   } catch(e) {
  //     alert(e.message);
  //   }finally{
  //     setLoading(false);
  //   }
  // }

  // React.useEffect(()=>{
  //   if(response?.type =="success"){
  //     const {id_token} = response.params;
  //     const credential = GoogleAuthProvider.credential(id_token);
  //     signInWithCredential(auth, credential);
  //   }
  // },[response]);

  // React.useEffect(()=>{
  //   checkLocalUser();
  //   const unsub = onAuthStateChanged(auth, async (user) =>{
  //     setLoading(true);
  //     if(user) {
  //       const email = user.email;
  //       const end = email.split("@");
  //       if(end[1] == "gmail.com"){
  //         console.log(JSON.stringify(user, null, 2));
  //         setUserInfo(user);
  //         await AsyncStorage.setItem("@user", JSON.stringify(user));

  //       }else{
  //         deleteUser(user);
  //         alert("You must use your student email. If this is an error please contact us.");
  //         setPressed(false);
  //       }
  //     }else{
  //       console.log("Not logged in");
  //       setUserInfo(null);
  //       setPressed(false);
  //     }
  //     setLoading(false);
  //     return () => unsub();
  //   });

  // },[])

  
  
  const randomText = (number)=>{
    var array = ["Doing stuff behind the scenes", "Something's happening", "Give us a sec", "Contacting the server", "1s and 0s are processing", "Spinning and spinning and more spinning"];
    return <Text style={{fontSize:27, width:'90%', textAlign:'center', color:'#252525'}}>{array[number]}</Text>
  }
  if (loading) return( 
    <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
      {/* {randomText(Math.floor(Math.random()*6))} */}
      <SpinningLogo />
      {/* <Text style={{fontSize:27, width:'90%', textAlign:'center', color:'#252525'}}>Please don't close the app</Text> */}
    </View>
  )
  // if(chooseDistrict)return<ApplicationProvider {...eva} theme={eva.light}><ChooseDistrict checkDistrict={checkDistrict}/></ApplicationProvider>
  if(!onboard) return(<Onboarding onSkip={onboardComplete} onDone={onboardComplete}
    pages={[{
      title:"Welcome to Scholarly",
      subtitle:"Follow the onboarding instructions to get started",
      backgroundColor:'#fff',
      image:<Image style={{width:300, height:300}} source={require('./Images/circularScholarlyIcon.png')}/>
    },
    {
      title:"Request",
      subtitle:"Request a time, date and tell us what you need help with",
      image:<Image style={{width:200, height:400}} source={require('./Images/requestScreenScreenshot.png')}/>,
      backgroundColor:'#fff'
    },
    {
      title:"Connect",
      subtitle:"The app will connect you with a tutor that can help you FOR FREE!!",
      image:<Image style={{height:91.35, width:350}} source={require('./Images/connectImage.png')}/>,
      backgroundColor:'#fff'
    },
    {
      title:"Google Calendar",
      subtitle:"The event will be added to your Google Calendar with a Google Meet link to join",
      image:<Image style={{width:300, height:300}} source={require('./Images/googleCalendarIcon.png')}/>,
      backgroundColor:'#fff'
    },
    {
      title:"Tutor Session",
      subtitle:"Join the Google Meet and learn something new! (Check in with the app prior to joining the Google Meet to make sure that no one canceled)",
      image:<Image style={{height:233, width:350}} source={require('./Images/talkingOnGoogleMeet.jpg')}/>,
      backgroundColor:'#fff'
  
    }]}
  />)

  if(needCreateAccount)return<CreateAccount checking={checking}/>

  // The set rate prop may cause an error, need to check!!!!!!!!!
  if(rate[0] != null) return <Rater district={district} rate={rate} setRate={setRate} setLoading={setLoading}/>
  
  if(explain) return(
    <Onboarding onSkip={()=>setExplain(false)} onDone={()=>setExplain(false)}
    pages={[{
      title:"Next Steps",
      subtitle:"Go to the Google Calendar Event",
      backgroundColor:'#fff',
      image:<Image style={{height:300, width:300}} source={require('./Images/googleCalendarIcon.png')}/>
    },{
      title:"Edit the event",
      subtitle:"Edit your newly created event by clicking on the pencil icon",
      backgroundColor:'#fff',
      image:<Image style={{width:300, height:175.7}} source={require('./Images/editEvent.png')}/>
    },{
      title:"Add Google Meet",
      subtitle:"Add a Google Meet to the event so that you can meet with your student",
      backgroundColor:'#fff',
      image:<Image style={{width:300, height:190}} source={require('./Images/addGoogleMeet.png')}/>
    }]}
    />
  )

  const ChooseDistrictScreen=({navigation})=>{
    return(
      <ApplicationProvider {...eva} theme={eva.light}>
        <ChooseDistrict checkDistrict={checkDistrict} navigation={navigation}/>
      </ApplicationProvider>
    )
  }

  const SignInScreen=()=>{

    return(
      <LinearGradient style={{flex:1, alignItems:'center',}} start={{x:.1, y:0}} end={{x:.9, y:1.2}}  colors={['rgba(64, 154, 199, 0.97)', 'rgba(242, 242, 242, 0.97)']}>
        <SafeAreaView style={{ alignItems:'center', flex:1,}}>
          <Text style={{marginTop:130, fontSize:50, fontFamily:'Roboto', color:'#232424', fontWeight:'700', textAlign:'center'}}>Welcome to Scholarly</Text>
          {/* <Text style={{marginTop:75, fontSize:28, width:'80%', textAlign:'center'}}>Please Sign In With Your School Account</Text> */}
          <View style={{marginTop:100, borderRadius:40}}> 
            {/* <LinearGradient style={{width:'auto', height:'auto', paddingHorizontal:20, paddingVertical:10, borderRadius:20, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'#5b92eb'}} start={{x:.1, y:.05}} end={{x:.9, y:.95}} colors={['#a78bfa', '#38bdf8', '#34d399']}> */}
              <Pressable onPress={()=>_signIn()} style={{width:'auto', height:'auto', borderRadius:25, borderColor:'#747775', borderWidth:1, backgroundColor:'#FFFFFF', paddingVertical:13, paddingHorizontal:20, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                {/* <Text style={{fontSize:30}}></Text> */}
                <SvgComponent />
                <Text style={{ fontFamily:'Roboto Medium', fontSize:25, color:'#1F1F1F', marginLeft:10 }}>
                  Sign In with{" Google"}
                  {/* <Text style={{ color: "#4285F4", fontSize:30 }}>
                    G<Text style={{ color: "#EA4336" }}>o</Text>
                    <Text style={{ color: "#FBBC04" }}>o</Text>
                    <Text style={{ color: "#4285F4" }}>g</Text>
                    <Text style={{ color: "#34A853" }}>l</Text>
                    <Text style={{ color: "#EA4336" }}>e</Text>
                  </Text> */}
                </Text>
              </Pressable>
            {/* </LinearGradient> */}
          </View>
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:100}}>
            <Image source={require('./Images/circularScholarlyIcon.png')} style={{width:150, height:150}}/>
            <MaterialCommunityIcons name="plus" size={50}/>
            <Image style={{height:150, width:150}} source={require('./Images/MHUSD_logo.webp')}/>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return userInfo?(
    <View style={{flex:1}}>
    <AppContext.Provider value={{siginingOut:_signOut, district:district, setLoading:setLoading, setExplain:setExplain}}>
      <PaperProvider theme={myNavigationTheme}>
      <ApplicationProvider {...eva} theme={eva.light}>
        {/* <IconRegistry icons={EvaIconsPack}/> */}
        <NavigationContainer>
          <Tab.Navigator 
          initialRouteName={'Scheduled'}
          backBehavior='none' 
          shifting={true} 
          activeColor='#3399ff' 
          inactiveColor='#8F9BB3'
          >
            <Tab.Screen name='Scheduled' component={Schedule} initialParams={{schedule:schedule}} options={{
              tabBarLabel:'Schedule',
              tabBarIcon:({color, size})=>(<MaterialCommunityIcons name="calendar-month-outline" color={color} size={30} />),
              tabBarLabelPosition:"below-icon"
            }}/>
            {isTutor?<Tab.Screen name='Available' component={Available} options={{
              tabBarLabel:'Available',
              tabBarIcon:({color, size})=>(<MaterialIcons name="person-add" color={color} size={30} />),
              tabBarLabelPosition:"below-icon"
            }}/>:null}
            <Tab.Screen name='+' component={TutorRequest} initialParams={{userInfo:userInfo, schedule:schedule}} options={{
              tabBarLabel:'Add',
              tabBarIcon:({color, size})=>(<MaterialCommunityIcons name="plus" color={color} size={30} />),
              tabBarLabelPosition:"below-icon"
            }}/>
            <Tab.Screen name='Settings' component={Settings} options={{
              tabBarLabel:'Settings',
              tabBarIcon:({color, size})=>(<MaterialIcons name="settings" color={color} size={30} />),
              tabBarLabelPosition:"below-icon"
            }}/>
          </Tab.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
      </PaperProvider>
      </AppContext.Provider>
    </View>
  ):(
      <ApplicationProvider {...eva} theme={eva.light}>
      {/* <IconRegistry icons={EvaIconsPack}/> */}
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'District'} screenOptions={{
          headerShown:false
        }}>
          <Stack.Screen name='District' component={ChooseDistrictScreen}/>
          <Stack.Screen name='Login' component={SignInScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
      </ApplicationProvider>
  )
}

const myNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    notification: 'rgba(255, 255, 255, 0.5)',
    secondaryContainer: 'transparent',
  },
};

const SpinningLogo = ()=>{
  var spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue:1,
      duration:2000,
      easing:Easing.linear,
      useNativeDriver:true
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return <Animated.Image 
    style={{
      transform:[{rotate:spin}],
      width:190,
      height:190
    }}
    source={require("./Images/circularScholarlyIcon.png")}
  />
}
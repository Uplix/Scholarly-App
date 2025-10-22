import { useEffect, useState } from "react";
import { Text, View, Pressable, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Select, SelectItem, IndexPath, Datepicker, Input, Button, SelectGroup} from "@ui-kitten/components";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import constants from "../constants"; 
import {set, ref, push, onValue} from 'firebase/database';
import { db, auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

var now = new Date();

var isTutor = true;
// const tutoring = [" I want to tutor", "I want to be tutored"]
// const subjects = ["Math", "Science", "English", "History", "Spanish", "French", "Other"];
// const grades = [6, 7, 8, 9, 10, 11, 12, "AP"];
// const times = ["4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];


export default function TutorRequest({navigation, route}){
    const {userInfo} = route.params;
    // const [beTutored, setBeTutored] = isTutor? useState(new IndexPath(0)):null;
    const [subject, setSubject] = useState(new IndexPath(0));
    const [grade, setGrade] = useState(0);
    const [time, setTime] = useState(new IndexPath(0));
    const [location, setLocation] = useState(new IndexPath(0));
    const [date, setDate] = useState(null);
    const [text, setText] = useState(null);
    const [change, setChange] = useState(false);
    const [current, setCurrent] = useState([]);
    const [subjects, setSubjects] = useState({});
    // const [grades, setGrades] = useState([]);
    const [times, setTimes] = useState({
        Virtual:[],
        Physical:[]
    });
    const [locations, setLocations] = useState([]);
    const [reload, setReload] = useState(0);

    // console.log(Object.keys(subjects)[subject.section]);
    // console.log(time);
    
    
    useEffect(()=>{
        onValue(ref(db, "mhusd/schedule/" + auth.currentUser.uid), (snapshot)=>{
            var returnVal = [];
            snapshot.forEach((child)=>{
                var value = child.val();
                returnVal.push(value.date);
            })
            setCurrent(returnVal);
        })
    }, [])

    useEffect(()=>{
        let theRequestSub = {};
        let theRequestTime = {
            Virtual:[],
            Physical:[]
        }
        // var theRequestGrade= [];
        let theRequestLocation = [];
        let theGrade = 0;
        onValue(ref(db, "mhusd/requestInfo/"), (snapshot)=>{
            snapshot.child('subjects').forEach((child)=>{
                theRequestSub[child.key] = child.val().split(',');
            })
            if(snapshot.child('times').hasChild('physicalTimes')){
                theRequestTime.Physical = snapshot.child('times').child('physicalTimes').val().split(',')
            }
            if(snapshot.child('times').hasChild('videoTimes')){
                theRequestTime.Virtual = snapshot.child('times').child('videoTimes').val().split(',')
            }
            // theRequestGrade = snapshot.child('grades').val().split(',');
            theRequestLocation = snapshot.child('locations').val().split(',');
        })

        onValue(ref(db, 'mhusd/users/' + auth.currentUser?.uid + "/grade"), (snapshot)=>{
            theGrade = snapshot.val();
        })

        // setGrades(theRequestGrade);
        setGrade(theGrade);
        setSubjects(theRequestSub);
        setTimes(theRequestTime);
        setLocations(theRequestLocation);
    }, [reload])

    useEffect(()=>{
        setTimeout(()=>{
            setReload(reload+1)
        }, 1000)
    }, [])

    // useEffect(()=>{
        
    // }, [time])

    if(change){
        // setBeTutored(0, []);
        setSubject(new IndexPath(0));
        setGrade(0);
        setTime(new IndexPath(0));
        setLocation(new IndexPath(0));
        setText('');
        setChange(false);
    }

    const renderOption = (title) => (
        <SelectItem key={title} title={title} />
      )
    
      const renderGroupSubject = (title) => (
        <SelectGroup key={title} title={title}>
          {subjects[title].map(renderOption)}
        </SelectGroup>
      )
    
    const Subjecting = ()=>{
        // if(subjects == {})return(<View/>)
        return(
            <View>
                <Text style={styles.text}>What subject?</Text>
                <View style={styles.selectContainer}>
                   {(subjects != undefined && subjects != null && subject != undefined) && <Select accessoryRight={BookIcon} size="large"  value={(Object.keys(subjects)[subject.section] == undefined || Object.keys(subjects)[subject.section][subject.row] == undefined)?"Subject":subjects[Object.keys(subjects)[subject.section]][subject.row]} selectedIndex={subject} onSelect={(index)=>setSubject((index == undefined)?new IndexPath(0):index)} placeholder="Subject">
                        {Object.keys(subjects).map(renderGroupSubject)}
                    </Select>}
                </View>
            </View>
        );
    }

    // const Grading = ()=>{
    //     return(
    //         <View>
    //             <Text style={styles.text}>What grade level are you?</Text>
    //             <View style={styles.selectContainer}>
    //                 <Select accessoryRight={PantoneIcon} size="large" initialState={undefined} value={grades[grade.row]} selectedIndex={grade} onSelect={index=>setGrade(index)} placeholder='Grade'>
    //                     {grades.map((object, i) => RenderOption(object, i))}
    //                 </Select>
    //             </View>
    //         </View>
    //     );
    // }

    const renderGroupTime = (title) => (
        <SelectGroup key={title} title={title}>
          {times[title].map(renderOption)}
        </SelectGroup>
      )

    const Timing = ()=>{
        return(
            <View>
                <Text style={styles.text}>What Time?</Text>
                <View style={styles.selectContainer}>
                    {(times != undefined && times != null && time != undefined) && <Select accessoryRight={TimeIcon} size="large" value={(Object.keys(times)[time.section] == undefined || Object.keys(times)[time.section][time.row] == undefined)?"Time":times[Object.keys(times)[time.section]][time.row]} selectedIndex={time} onSelect={(index)=>setTime((index == undefined)?new IndexPath(0):index)} placeholder='Time'>
                        {Object.keys(times).map(renderGroupTime)}
                    </Select>}
                </View>
            </View>
        );
    }

    const Locationing = () =>{
        return(
            <View>
                <Text style={styles.text}>Where would you like to meet?</Text>
                <View style={styles.selectContainer}>
                    <Select accessoryRight={MapIcon} size="large"  value={locations[location.row]} selectedIndex={location} onSelect={index=>setLocation(index)} placeholder='Location'>
                        {locations.map((object, i) => RenderOption(object, i))}
                    </Select>
                </View>
            </View>
        )
    }
    

    return(
        <View style={{flex:1}}>
            <ScrollView automaticallyAdjustKeyboardInsets={true} style={{flex:1}}>
                <Tops />
                {/* <Top selecting={beTutored} setSelecting={setBeTutored}/> */}
                <Subjecting />
                
                <Timing />
                {(time.section == 1) && <Locationing />}
                <Dating date={date} setDate={setDate}/>
                <ExtraText setText={setText} text={text}/>
                <CreateButton current={current} userInfo={userInfo} subject={subject} grade={grade} time={time} date={date} text={text} setSubject={setSubject} setGrade={setGrade} setTime={setTime} setText={setText} navigation={navigation} setChange={setChange} subjects={subjects} location={location}  times={times} locations={locations}/>
            </ScrollView>
        </View>
    );
    
}

const Tops = () =>{
    return(
        <View style={{justifyContent:'center', alignItems:'center', marginTop:55}}>
            <Text style={{fontSize:35}}>Request a Tutor</Text>
        </View>
    );
}

const RenderOption = (object, i) =>{
    return(
        <SelectItem title={object} key={i}/>
    );
}

// const Top = ({selecting, setSelecting}) => {
//     if(isTutor){
//         return(
//             <View>
//                 <Text style={{fontSize:16, marginTop:40, marginLeft:30}}>Do you want to be a tutor or be tutored?</Text>
//                 <View style={styles.selectContainer}>
//                     <Select accessoryRight={PersonIcon} size='large' initialState={undefined} value={tutoring[selecting.row]} selectedIndex={selecting} onSelect={index=>setSelecting(index)} placeholder='Tutor or be tutored?'>
//                         {tutoring.map((object, i) => RenderOption(object, i))}
//                     </Select>
//                 </View>
//             </View>
//         );
//     }
// }



const Dating =({date, setDate})=>{
    var string = "What day? (Must be 2 days in advance)";
    return(
        <View>
            <Text style={styles.text}>{string}</Text>
            <View style={{marginTop:10, marginHorizontal:40}}>
                <Datepicker accessoryRight={CalendarIcon} date={date} onSelect={nextDate=>setDate(nextDate)} size="large" placeholder='Date' min={new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)} max={new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() + 2)}/>
            </View>
        </View>
    )
}

const ExtraText = ({setText, text}) => {
    return(
        <View>
            <Text style={styles.text}>What do you need help with?</Text>
            <Input 
            autoCapitalize="sentences"
            placeholder="Ex: I need help with multiplication tables" 
            onChange={(event)=>{
                setText(event.nativeEvent.text);
            }} 
            textAlign="left" 
            textAlignVertical="top" 
            maxLength={80} 
            style={{marginTop:10, marginHorizontal:35}}
            size="large"
            value={text}
            // style={styles.textsInput}
            />
        </View>
    );
}

// const PersonIcon=()=>{
//     return(
//         <View style={{height:30, width:30, marginRight:30}}>
//             <Icon name="person-outline"/>
//         </View>
//     )
// }

const BookIcon=()=>{
    return <MaterialCommunityIcons name="book-outline" size={30} style={{marginRight:30}}/>
}

const PantoneIcon=()=>{
    return <MaterialCommunityIcons name="numbers" size={30} style={{marginRight:30}}/>
}

const CalendarIcon =()=>{
    return <MaterialCommunityIcons name="calendar-outline" size={30} style={{marginRight:30}}/>
}
const TimeIcon =()=>{
    return <MaterialCommunityIcons name="clock-outline" size={30} style={{marginRight:30}}/>
}

const MapIcon =()=>{
    return <MaterialCommunityIcons name="map-marker" size={30} style={{marginRight:30}}/>
}


const CreateButton=({userInfo, subject, grade, time, date, text, setSubject, setGrade, setTime, setText, navigation, current, subjects, location, locations, times, setChange})=>{
    const [status, setStatus] = useState("primary");
    // const [doubleBook, setDoubleBook] = useState(false);

    const checking = (dater) =>{
        return dater == date.getTime();
    }

    const addToDatabase = async () =>{
        if(current.find(checking) == undefined){
            setStatus("primary")
            var pushRef = push(ref(db, 'mhusd/sessions/' + auth.currentUser.uid));
            set(pushRef, {
                name:auth.currentUser.displayName,
                subject:subjects[Object.keys(subjects)[subject.section]][subject.row],
                grade:grade,
                time:times[Object.keys(times)[time.section]][time.row],
                location:(time.section == 1)?locations[location.row]:"Google Meets",
                date:date.getTime(),
                text:text,
                email:auth.currentUser.email,
                available:true,
                tutoree:auth.currentUser.uid
            });
            set(ref(db, 'mhusd/schedule/' + auth.currentUser.uid + "/" + pushRef.key), {
                name:auth.currentUser.displayName,
                subject:subjects[Object.keys(subjects)[subject.section]][subject.row],
                grade:grade,
                time:times[Object.keys(times)[time.section]][time.row],
                location:(time.section == 1)?locations[location.row]:"Google Meets",
                date:date.getTime(),
                text:text,
                email:auth.currentUser.email,
                available:true,
                tutoree:auth.currentUser.uid
            });
            // setBeTutored(0);
            // setSubject(0); 
            // setGrade(0);
            // setTime(0);
            // setText(null);
            setChange(true);
            navigation.navigate('Scheduled');
        }else{
            alert("It seems that you already have a session on that day");
            setStatus("danger");
        }
    }
    return(
        <View style={{justifyContent:'center', alignItems:'center', marginTop:40}}>
            <Button onPress={()=>{
                if(subject.row != undefined && grade != 0 && time.row != undefined && text != null && date!=null){
                    if(text.length >= 10){
                        if(time.section == 1){
                            if(location.row != undefined){
                                addToDatabase();
                            }else{
                                alert("You must choose a location if you want to meet in person");
                                setStatus("danger");
                            }
                        }else{
                            addToDatabase();
                        }
                        
                    }else{
                        alert("Your description must be at least 10 letters, hopefully more");
                        setStatus("danger");
                    }
                        
                }else{
                    alert("You left a prompt blank");
                    setStatus("danger");
                }
                }} 
                status={status}
                appearance="outline"
                size="large"
                style={{width:'80%', height:50, borderRadius:20}}
                // style={{width:'75%', height:50, borderRadius:60, backgroundColor:'green', justifyContent:'center', alignItems:'center'}}
                >
                <Text style={{fontSize:24}}>Create Event</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    selectContainer:{
        marginTop:10,
        marginHorizontal:40
    },
    text:{fontSize:16, marginTop:30, marginLeft:30},
    textsInput:{
        marginHorizontal:40, 
        backgroundColor:'white', 
        shadowColor:'#D3D3D3',
        shadowOpacity:0.8,
        marginTop:40,
        fontSize:21, 
        height:"auto"
    }
})
import * as React from 'react'
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native'
import Checkbox from 'expo-checkbox';
import { auth, db } from '../firebaseConfig'
import { ApplicationProvider, ButtonGroup, Button, Divider, Modal, Input } from '@ui-kitten/components'
import * as eva from '@eva-design/eva'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { push, ref, remove, set } from 'firebase/database'
import SvgComponent from '../componenter/reportSVG'

function delay(delay) {
    return new Promise(r => {
        setTimeout(r, delay);
    })
}

export default function Rater({rate, setRate, setLoading, district}){
    const [theLoading, setTheLoading] = React.useState(false);
    const [displaying, setDisplaying] = React.useState(null);
    const [isTutor, setIsTutor] = React.useState();
    const [rated, setRated] = React.useState(0);
    const [status, setStatus] = React.useState("primary");
    const [date, setDate] = React.useState(new Date());
    const [reporter, setReporter] = React.useState(false);
    const [reportList, setReportList] = React.useState([false, false, false, false, false]);
    const [reportText, setReportText] = React.useState("");
    const [reportError, setReportError] = React.useState(false);
    const [reportTextError, setReportTextError] = React.useState(false);

    const reportLabels = ["Language", "No Show", "Harassment", "No Knowledge"];
    // const [reporting, setReporting] = React.useState([false, false, false, false, false]);

    // const mapper = { "components": { "Toggle": { "meta": {"parameters":{"width":{"type":80}, "height":{"type":80}}} } } }
    // alert('hello')
    // console.log(displaying);

    React.useEffect(()=>{
        if(displaying == null){
            setDisplaying(rate[0]);
        }
    }, [displaying])
    
    const submitRating = ()=>{
        // console.log("Rating => ", rated)
        if(rated > 0){
            if(displaying.isTutor){
                set(push(ref(db, district + "/users/" + displaying.value.tutoree + "/ratings")), rated);
            }else{
                set(push(ref(db, district + "/users/" + displaying.value.tutorer.id + "/ratings")), rated);
                remove(ref(db, "mhusd/sessions/" + auth.currentUser.uid + "/" + displaying.key));
            }
            remove(ref(db, district + "/schedule/" + auth.currentUser.uid + "/" + displaying.key))
            alert("Thank you for giving a rating");
            var placeHolder = [...rate];
            placeHolder.reverse()
            placeHolder.pop();
            placeHolder.reverse();
            setLoading(true);
            setTimeout(()=>{
                setLoading(false);
                setDisplaying(null);
                setRate(placeHolder);
            }, 500);
        }else{
            alert("Please select a rating by pressing the stars");
            setStatus("danger");
        }
    }

    const reportUser = async () =>{
        let reportedText;
        if(reportList.find((val)=>{return val}) != undefined){
            if(reportList[reportList.length - 1] && reportText.length < 10 || reportText.length > 300){
                setReportTextError(true);
                return;
            }else{
                setReportError(false);
                setReportTextError(false);

                reportedText = "";
                if(reportList[0]){
                    reportedText += "Language,";
                }else{
                    reportedText += ",";
                }
                if(reportList[1]){
                    reportedText += "No Show,";
                }else{
                    reportedText += ",";
                }
                if(reportList[2]){
                    reportedText += "Harassment,";
                }else{
                    reportedText += ",";
                }
                if(reportList[3]){
                    reportedText += "No Knowledge,";
                }else{
                    reportedText += ",";
                }
                if(reportList[4]){
                    reportedText += "Other: " + reportText;
                }else{
                    reportedText += ",";
                }
                // console.log(reportedText)
            }
        }else{
            setReportError(true);
            return;
        }

        setTheLoading(true);
        await delay(500)
        let theID = displaying.isTutor?displaying.value.tutoree:displaying.value.tutorer.id
        let nowTime = new Date().getTime();
        set(ref(db, "/" + district + "/reports/" + theID +"/" + displaying.key), {
            type:"Session",
            problems:reportedText,
            // badUser:{
            //     name:rater[0].isTutor?rater[0].value.name:rater[0].value.tutorer.name,
            //     id:rater[0].isTutor?rater[0].value.tutoree:rater[0].value.tutorer.id
            // },
            date:nowTime,
            reporter:{
                name:auth.currentUser?.displayName,
                uid:auth.currentUser?.uid
            }
        })
        if(displaying.isTutor){
            remove(ref(db, district + "/sessions/" + auth.currentUser?.uid + "/" + displaying.key));
        }
        remove(ref(db, district + "/schedule/" + auth.currentUser?.uid + "/" + displaying.key))
        // remove(ref(db, "mhusd/schedule/" + auth.currentUser.uid + "/" + displaying.key)) 
        var placeHolder = [...rate];
        placeHolder.reverse()
        placeHolder.pop();
        placeHolder.reverse();
        setTheLoading(false);
        setLoading(true);
        alert("Thank you for submiting a report. Your school's staff will be notified.")
        setTimeout(()=>{
            setLoading(false);
            setDisplaying(null);
            setRate(placeHolder);
        }, 500);
    }

    

    return (displaying != null && !theLoading)?(
        <ApplicationProvider {...eva} theme={eva.light} >
            {/* <IconRegistry icons={EvaIconsPack}/> */}
            {/* <SafeAreaView style={{flex:1, alignItems:'center'}}> */}
                <ScrollView contentContainerStyle={{alignItems:'center'}}>
                    <Pressable onPress={()=>setReporter(true)} style={{height:60, width:60, position:'absolute', top:50, right:40}}>
                        <SvgComponent />
                    </Pressable>
                    <Text style={{fontSize:35, marginTop:55}}>Rating</Text>
                    <Text style={{fontSize:25, marginTop:40, textAlign:'center', marginHorizontal:25}}>We would appreciate it if you could rate your experience with your {displaying.isTutor? "student": "tutor"}</Text>
                    <View style={{width:'90%', marginLeft:20, alignItems:'flex-start', marginTop:20}}>
                        <View style={{flexDirection:'row'}}>
                            <Text style={styles.textDescrip}>Attendees: </Text>
                            <View style={{flexDirection:'column'}}>
                                <Text style={styles.textDescrip}>{displaying.value.name}</Text>
                                <Text style={{fontSize:25, marginTop:8}}>{displaying.isTutor? displaying.value.tutor: displaying.value.tutorer.name}</Text>
                            </View>
                        </View>
                        <Divider />
                        <Text style={styles.textDescrip}>Subject: {displaying.value.subject}</Text>
                        <Divider />
                        <Text style={styles.textDescrip}>Grade: {displaying.value.grade}</Text>
                        <Divider />
                        <Text style={styles.textDescrip}>Location: {displaying.value.location}</Text>
                        <Divider />
                        <Text style={styles.textDescrip}>Description: {displaying.value.text}</Text>
                        <Divider />
                        <Text style={styles.textDescrip}>Date: {displaying.date.toDateString()}</Text>
                        <Divider />
                        <Text style={styles.textDescrip}>Time: {displaying.value.time}</Text>
                    </View>
                    <ButtonGroup style={{marginTop:40, height:60}} size='giant' appearance='ghost' status={status}>
                        <Button style={{}} onPress={()=>setRated(1)} accessoryLeft={(rated>=1)? StarSelect:NotStar}/>
                        <Button style={{}} onPress={()=>setRated(2)} accessoryLeft={(rated>=2)? StarSelect:NotStar}/>
                        <Button style={{}} onPress={()=>setRated(3)} accessoryLeft={(rated>=3)? StarSelect:NotStar}/>
                        <Button style={{}} onPress={()=>setRated(4)} accessoryLeft={(rated>=4)? StarSelect:NotStar}/>
                        <Button style={{}} onPress={()=>setRated(5)} accessoryLeft={(rated>=5)? StarSelect:NotStar}/>
                    </ButtonGroup>
                    <Button status={status} size='large' style={{marginTop:40}} onPress={submitRating} appearance='outline'>Submit</Button>
                    {/* <Button status={'danger'} size='large' style={{marginTop:40}} onPress={reportUser} appearance='outline'>Report User</Button> */}
                </ScrollView>
                <Modal visible={reporter}
                    onBackdropPress={()=>setReporter(false)} 
                    backdropStyle={{backgroundColor:'rgba(0, 0, 0, 0.5)'}}
                    style={{backgroundColor:'white', height:'auto', paddingTop:0, paddingBottom:20, width:'90%', position:'absolute', alignSelf:'center', borderRadius:15}}>
                    <Text style={{fontSize:34, textAlign:'left', marginLeft:40, color:'#252525', flexDirection:'row', flexWrap:'wrap', marginTop:24, width:'auto', height:'auto'}}>Report {displaying.isTutor? "student":"tutor"}</Text>
                    <View style={styles.container}>
                        <Pressable style={styles.section}  onPress={()=>{
                            let theReportList = reportList;
                            theReportList[0] = !theReportList[0];
                            setReportList([...theReportList]);
                        }}>
                            <Checkbox style={styles.checkbox} color={reportError?'#d1403b':undefined} value={reportList[0]}
                            onValueChange={()=>{
                                let theReportList = reportList
                                theReportList[0] = !theReportList[0];
                                setReportList([...theReportList])
                            }} />
                            <Text style={styles.paragraph}>Language</Text>
                        </Pressable>
                        <Pressable style={styles.section} onPress={()=>{
                            let theReportList = reportList;
                            theReportList[1] = !theReportList[1];
                            setReportList([...theReportList]);
                        }}>
                            <Checkbox style={styles.checkbox} color={reportError?'#d1403b':undefined} value={reportList[1]}
                            onValueChange={()=>{
                                let theReportList = reportList
                                theReportList[1] = !theReportList[1];
                                setReportList([...theReportList])
                            }} />
                            <Text style={styles.paragraph}>No Show</Text>
                        </Pressable>
                        <Pressable style={styles.section} onPress={()=>{
                            let theReportList = reportList;
                            theReportList[2] = !theReportList[2];
                            setReportList([...theReportList]);
                        }}>
                            <Checkbox style={styles.checkbox} color={reportError?'#d1403b':undefined} value={reportList[2]}
                            onValueChange={()=>{
                                let theReportList = reportList
                                theReportList[2] = !theReportList[2];
                                setReportList([...theReportList])
                            }} />
                            <Text style={styles.paragraph}>Harassment</Text>
                        </Pressable>
                        <Pressable style={styles.section} color={reportError?'#d1403b':undefined} onPress={()=>{
                            let theReportList = reportList;
                            theReportList[3] = !theReportList[3];
                            setReportList([...theReportList]);
                        }}>
                            <Checkbox style={styles.checkbox} color={reportError?'#d1403b':undefined} value={reportList[3]}
                            onValueChange={()=>{
                                let theReportList = reportList
                                theReportList[3] = !theReportList[3];
                                setReportList([...theReportList])
                            }} />
                            <Text style={styles.paragraph}>No Knowledge</Text>
                        </Pressable>
                        <Pressable style={styles.section} onPress={()=>{
                            let theReportList = reportList;
                            theReportList[4] = !theReportList[4];
                            setReportList([...theReportList]);
                        }}>
                            <Checkbox style={styles.checkbox} color={reportError?'#d1403b':undefined} value={reportList[4]}
                            onValueChange={()=>{
                                let theReportList = reportList
                                theReportList[4] = !theReportList[4];
                                setReportList([...theReportList])
                            }} />
                            <Text style={styles.paragraph}>Other</Text>
                        </Pressable>
                    </View>
                    {reportList[reportList.length-1]&&(
                        <View style={{marginTop:10, paddingHorizontal:30}}>
                            <Input placeholder='Explain:' status={reportTextError?"danger":""} value={reportText} onChange={(event)=>setReportText(event.nativeEvent.text)}/>
                        </View>
                    )}
                    <Button appearance='outline' status={(reportError || reportTextError)? "danger":"primary"} onPress={reportUser} style={{paddingHorizontal:20, paddingVertical:10, borderRadius:35, justifyContent:'center', alignItems:'center', alignSelf:'center', marginTop:20,}}>
                        <View/>
                        <Text style={{fontSize:35, textAlign:'center'}}>Confirm</Text>
                    </Button>
                </Modal>
            {/* </SafeAreaView> */}
        </ApplicationProvider>
    ):(
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}><ActivityIndicator size={"large"}/></View>
    )
}

const StarSelect = () =>{
    return <MaterialCommunityIcons name='star' size={50} color={'#FFCD3C'}/>
}

const NotStar = () =>{
    return <MaterialCommunityIcons name='star-outline' size={50} color={'#8F9BB3'}/>
}

const styles = StyleSheet.create({
    textDescrip:{
        fontSize:25,
        marginTop:15,
    },
    container: {
        flex: 1,
        marginHorizontal: 25,
        marginTop:15
      },
      section: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      paragraph: {
        fontSize: 17,
      },
      checkbox: {
        margin: 10,
      },
})
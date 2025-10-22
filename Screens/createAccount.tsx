import * as React from 'react'
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";
import { Select, SelectItem, ApplicationProvider, IndexPath } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { auth, db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { set, ref } from 'firebase/database';

const grades:number[] = [9, 10, 11, 12];
const schools:string[] = ["Ann Sobrato"];

const buttonColors = {
    good:['rgba(74, 222, 128, .8)', 'rgba(110, 231, 183, .6)'],
    error:['rgba(239, 68, 68, .8)', 'rgba(248, 113, 113, .6)']
}

export default function CreateAccount({checking}){
    const [district, setDistrict] = React.useState("");
    // const [grades, setGrades] = React.useState<number[]>([]);
    const [grade, setGrade] = React.useState<IndexPath>(new IndexPath(0));
    const [school, setSchool] = React.useState<IndexPath>(new IndexPath(0));
    const [buttonError, setButtonError] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(()=>{
        getDistrict();
        
    }, [])

    const getDistrict = async ()=>{
        setDistrict(await AsyncStorage.getItem("district"));
    }

    const RenderOption = (object:number|string, i:number) =>{
        return(
            <SelectItem title={object} key={i}/>
        );
    }

    const Grading = ()=>{
        return(
            <View style={styles.selectGradeContainer}>
                <Select size="large" value={grades[grade.row]} selectedIndex={grade} onSelect={(index:IndexPath)=>setGrade(index)} placeholder='Grade'>
                    {grades.map((object, i) => RenderOption(object, i))}
                </Select>
            </View>
        );
    }

    const Schooling = ()=>{
        return(
            <View style={styles.selectSchoolContainer}>
                 <Select size="large" value={schools[school.row]} selectedIndex={school} onSelect={(index:IndexPath)=>setSchool(index)} placeholder='School'>
                    {schools.map((object, i) => RenderOption(object, i))}
                </Select>
            </View>
        )
    }

    const createAccount=()=>{
        setLoading(true)
        if(grades[grade.row] == undefined || grades[grade.row] == null || schools[school.row] == undefined || schools[school.row] == null){
            setButtonError(true);
            setLoading(false);
            return;
        }

        try{
            setButtonError(false);
            set(ref(db, "mhusd/users/" + auth.currentUser?.uid + '/name'), auth.currentUser?.displayName);
            set(ref(db, "mhusd/users/" + auth.currentUser?.uid + '/district'), "mhusd");
            set(ref(db, "mhusd/users/" + auth.currentUser?.uid + "/image"), auth.currentUser?.photoURL);
            set(ref(db, "mhusd/users/" + auth.currentUser?.uid + "/school"), schools[school.row]);
            set(ref(db, "mhusd/users/" + auth.currentUser?.uid + "/grade"), grades[grade.row]);
            checking();
        }catch(e){
            setButtonError(true);
            setLoading(false);
        }
    }
    
    if (loading) return( 
        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
          <ActivityIndicator size={"large"}/>
        </View>
      )

    return(
        <ApplicationProvider {...eva} theme={eva.light}>
            <SafeAreaView style={{flex:1}}>
                <View style={{
                    width:'auto',
                    height:'auto',
                    overflow:'scroll',
                    flexDirection:'column',
                    paddingHorizontal:16
                }}>
                    <Text style={{fontSize:38, textAlign:'center', alignSelf:'center', marginTop:28, color:"#1F1F1F"}}>Finish setting up your account:</Text>
                    <View style={{flexDirection:'row', width:'auto', height:'auto', alignItems:'center', marginTop:35}}>
                        <Text style={{fontSize:30, paddingRight:10, opacity:.6, color:"#4F4F4F"}}>Profile Picture: </Text>
                        <Image source={{uri:auth.currentUser.photoURL}} style={{width:50, height:50, borderRadius:50}}/>
                    </View>
                    <View style={{flexDirection:'row', width:'auto', height:'auto', alignItems:'center', marginTop:25}}>
                        <Text style={{fontSize:30, paddingRight:10, opacity:.6, color:"#4F4F4F"}}>Name: </Text>
                        <Text style={{fontSize:30, paddingRight:10, color:"#4F4F4F"}}>{auth.currentUser.displayName}</Text>
                    </View>
                    <View style={{flexDirection:'row', width:'auto', height:'auto', alignItems:'center', marginTop:25}}>
                        <Text style={{fontSize:30, paddingRight:10, opacity:.6, color:"#4F4F4F"}}>District: </Text>
                        <Text style={{fontSize:30, paddingRight:10, color:"#4F4F4F"}}>{district.toUpperCase()}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop:25}}>
                        <Text style={{fontSize:30, opacity:.6, color:"#4F4F4F"}}>Grade: </Text>
                        <Grading />
                    </View>
                    <View style={{flexDirection:'row', marginTop:25}}>
                        <Text style={{fontSize:30, opacity:.6, color:"#4F4F4F"}}>School: </Text>
                        <Schooling />
                    </View>      
                </View>
                <TouchableOpacity activeOpacity={0.65} style={{flexGrow:1, height:'auto', position:'absolute', bottom:50, alignSelf:'center', marginHorizontal:4}} onPress={createAccount}>
                    <LinearGradient style={{flexGrow:1, height:'auto', paddingVertical:18, paddingHorizontal:28, borderRadius:50 }} start={{x:.05, y:.1}} end={{x:.9, y:.95}} colors={buttonError?buttonColors.error:buttonColors.good}>
                        <Text style={{fontSize:25, color:'#1F1F1F', textAlign:'center'}}>Join the Scholarly community</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </ApplicationProvider>
    )
}

const styles = StyleSheet.create({
    selectGradeContainer:{
        // marginTop:10,
        marginLeft:20,
        width:100
    },
    selectSchoolContainer:{
        marginLeft:20, 
        width:180
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
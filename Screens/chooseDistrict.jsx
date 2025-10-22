import * as React from 'react'
import { View, Text, StyleSheet } from "react-native"
import SvgComponent from '../componenter/schoolSVG'
import { Button, Select, SelectItem } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const districtChoices = ["MHUSD"];

export default function ChooseDistrict({checkDistrict, navigation}){
    const [districtChoice, setDistrictChoice] = React.useState(0, []);

    const chooseTheDistrict = async ()=>{
        if(districtChoices[districtChoice.row] != undefined){
            await AsyncStorage.setItem("district", districtChoices[districtChoice.row].toLowerCase());
            // checkDistrict();
            navigation.push('Login')
        }
    }

    return(
        <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'center', paddingHorizontal:18}}>
            <View style={{width:200, height:150}}>
                <SvgComponent />
            </View>
            <Text style={{fontSize:30, textAlign:'center', marginTop:30}}>What is your school district?</Text>
            <View style={styles.selectContainer}>
                <Select style={{width:250}} initialState={undefined} value={districtChoices[districtChoice.row]} selectedIndex={districtChoice} onSelect={index=>setDistrictChoice(index)} placeholder='District'>
                    {districtChoices.map((object, i) => RenderOption(object, i))}
                </Select>
            </View>
            <Button onPress={chooseTheDistrict} style={{marginTop:19}} appearance='outline' size='large'>Continue {'-->'}</Button>
        </View>
    )
}

const RenderOption = (object, i) =>{
    return(
        <SelectItem title={object} key={i}/>
    );
}

const styles = StyleSheet.create({
    selectContainer:{
        marginTop:23,
        paddingHorizontal:40
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
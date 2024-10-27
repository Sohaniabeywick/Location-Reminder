import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {addLocation, getAllLocation, searchLocationByName} from './../database';
import { View, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";


const GameScreen = ({navigation}) => {

    const [typedLocation, setTypedLocation] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [selectedPlace, setSelectedPlace] = React.useState([]);
    const [placeList, setPlaceList] = React.useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {

    }, []);

    const changeLocations = (inputText) => {
        setTypedLocation(inputText);
    }

    const searchKeyword = () => {
        
      searchLocationByName(typedLocation, (results) => {
          if (results.length > 0) {
            console.log('Search results:', results);
            setPlaceList(results);
          } else {
            alert('No Places found..!');
            setIsButtonDisabled(false);
          }
      });
       
    }

    const addKeyword = async () => {
      addLocation(typedLocation);
      
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
    
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
    
        let location = await Location.getCurrentPositionAsync({});
        let lati = parseFloat(location.coords.latitude).toFixed(6);
        let longi = parseFloat(location.coords.longitude).toFixed(6);
        const name = typedLocation;
    
        const baseUrl = 'http://3.84.10.254/hopePlaces';
        const queryString = `?keyword=${encodeURIComponent(name)}&latitude=${encodeURIComponent(lati)}&longitude=${encodeURIComponent(longi)}`;
        const url = baseUrl + queryString;
    
        fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {
            console.log(responseJson);
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.error('Error getting location:', error);
      }
      
      alert("Saved Place Category..!");
      setIsButtonDisabled(true);
    }
    

  const selectedLocation = async (name, categoryId) => {
    const selectedLocation = {
      id : categoryId,
      categoryName : name
    }

    const newSelectedList = selectedPlace;
    newSelectedList.push(selectedLocation); 
    setSelectedPlace(newSelectedList);
    console.log(selectedPlace);
  };




  const selectAndFindLocation = (locationName,selectedId) => {
      const selectedArray = selectedPlace.concat({ id: selectedId, name: locationName });
      setSelectedPlace(selectedArray);
      console.log(selectedPlace);
      changeLocations('');
  }

    const removeFromList = (locationId) => {
        alert("delete from list"+locationId);
    }

  const startTrip = () => {
    
    //navigation.navigate('Home')

    navigation.navigate('Home', {
      dataArray: selectedPlace
    });
  }


    return(
        <View style={styles.container}>

            <Text style={styles.mainText}>Select Places you need to Stop</Text>

            <TextInput 
            style={styles.inputOne}
            placeholder='keyword'
            onChangeText={changeLocations}
            value={typedLocation}
            />

            <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchKeyword}
            >
              <Text style={styles.btnText}>Search</Text>
            </TouchableOpacity>

              <TouchableOpacity
              style={styles.addBtn}
              onPress={addKeyword}
              disabled={isButtonDisabled}
              >
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>

            <ScrollView horizontal={true} style={styles.resultView}>
                {placeList.map((result) => (
                    <TouchableOpacity
                    key={result.id}
                    style={styles.searchResultItem}
                    onPress={() => {selectedLocation(result.category,result.id)}}
                    >
                    <Text style={styles.btnText}>{result.category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

           
            <ScrollView style={styles.selectedItemsContainer}>
                <View horizontal={true}
                style={styles.resultItem}>   
                </View>
            {selectedPlace.map((result) => (
            <View horizontal={true}
              key={result.id}
              style={styles.resultItem}
            >
              <Text style={styles.resultTextTwo}>{result.categoryName}</Text>
                    <TouchableOpacity
                    key={result.id}
                    style={styles.subBtn}
                    onPress={() => {removeFromList(result.id)}}
                    >
                    <Text style={styles.subBtnText}>Remove</Text>
                    </TouchableOpacity>         
            
            </View>
          ))}      
          </ScrollView>
     

    
        <View style={styles.btnSec}>
        <Pressable style={styles.goBtn}
        onPress={startTrip}>
        <Text style={styles.btnTextTwo}>Let's Go</Text>  
        </Pressable>
        </View>

            
    
    
    
        </View>
    );
} 
export default GameScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#303952',
    },
    mainText:{
        color:'#fff',
        fontWeight:'bold',
        fontSize:20,
        marginTop:'15%',
        marginLeft:'5%'

    },
    inputOne:{
        height: 40,
        width:'60%',
        borderWidth: 1,
        marginTop:'10%',
        marginLeft:'5%',
        borderTopColor:'#0a3d62',
        borderLeftColor:'#0a3d62',
        borderRightColor:'#0a3d62',
        borderBottomColor:'#fff',
        color:'#fff',
        fontSize:18,
    },
    searchBtn:{
        backgroundColor:'#fab1a0',
        marginTop:'-8%',
        paddingTop:'1%',
        paddingBottom:'1%',
        paddingLeft:'5%',
        paddingRight:'5%',
        marginLeft:'70%',
        borderRadius:10,
        width:'26%'
      },
      addBtn:{
        backgroundColor:'#D980FA',
        marginTop:'3%',
        paddingLeft:'15%',
        paddingRight:'15%',
        marginLeft:'15%',
        borderRadius:8,
        width:'40%',
        paddingBottom:'1%',
        paddingTop:'1%'
      },
      btnText:{
        color: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 'bold'
      },
      resultView:{
            position:'absolute',
            marginTop: '56%',
            flexDirection: 'row',
            width:'100%',
      },
      searchResultItem: {
        backgroundColor: '#3498db',
        padding: 10,
        marginVertical: 5,
        marginRight: 2,
        borderRadius: 5,
      },
      selectedItemsContainer: {
        marginTop: '25%',
        maxHeight: '90%',
        width:'70%',
        marginLeft:'15%'
      },
      resultItem:{
        backgroundColor:'#2d3436',
        borderColor:'#fff',
        flexDirection: 'row',
        marginTop:'0.5%',
        padding:15
      },
      resultTextTwo:{
        color:'#fff',
        fontWeight:'bold',
        padding:5,
        width:'50%',
        fontSize:20,
        marginLeft:'5%'
      },
      subBtn:{
        backgroundColor:'#c0392b',
        marginTop:'1%',
        marginLeft:'10%',
        borderRadius:8,
        width:'28%',
        height:'auto'
      },
      subBtnText:{
        color:'#fff',
        fontWeight:'bold',
        padding:5,
      },
      btnSec:{
        marginTop:'5%',
        backgroundColor: '#16a085',
        width:'80%',
        height:'8%',
        margin: '2%',
        borderRadius:6,
        position:'fixed',
        marginLeft:'10%'

    },
    goBtn:{
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height:'100%',
    backgroundColor: '#16a085',
    },
    btnTextTwo:{
      color: '#dcdde1',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        fontWeight: 'bold'
    }

      
  });
  
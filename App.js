import 'react-native-gesture-handler';
import React from 'react';
import { View, Text,TextInput, Button,Keyboard, Modal, TouchableWithoutFeedback} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FlatGrid } from 'react-native-super-grid';
import { StatusBar } from 'expo-status-bar';

var jwtToken;
// var localHost="https://guarded-dawn-18591.herokuapp.com" to be used when using heroku endpoint
var localHost="http://10.136.108.47:8080"

function createFilm(filmName, filmRating,_setMovie) {
  if (filmName.length == 0) {
      alert("Please enter a movie name before clicking on submit");
  } else if ((filmRating < 1 || filmRating > 5)) {
      alert("please make sure the rating is between 1 and 5");
  } else if (filmName.length > 0 && (filmRating >= 1 || filmRating <= 5|| filmRating%0.5 !=0)) {
      try {
          fetch(localHost+"/api/v1/films", {
                  method: 'POST',
                  body: JSON.stringify({
                      name: filmName,
                      rating: filmRating
                  }),
                  headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization': 'bearer ' + jwtToken
                  }
              }).then(resp => {
                  setTimeout(function() {
                      if (resp.status == 200) {
                          alert("Success!!\nThe film : \"" + filmName + "\" added");
                          _setMovie("");
                          
                      } else {
                          alert("failure!!\nThe film : \"" + filmName + "\" couldnt be added\nStatus Code : " + resp.status)
                      }
                  })
              })
      } catch (e) {
          console.log(e);
          console.log("---------------------------------");
      }
  }
  return false;
}

function getFilms(setData) {
  try {
      fetch(localHost+"/api/v1/films", {
              method: 'GET',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          }).then(resp => resp.json())
          .then(results => {
              if (results.err) {
                  alert("Error : " + results.err);
              } else {
                setData(results);         
              }  
            },0);
  } catch (e) {
      console.log(e);
      console.log("--------------------------");
  }

  return false;
}

 function login(userName,_setJWT){
  try {
    //setTimeout(timeou)
    fetch(localHost+"/api/v1/login", {
            method: 'POST',
            body: JSON.stringify({
                username: userName
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(resp => resp.json())
        .then(data => {
            jwtToken = data.token;
            if(jwtToken!=undefined){
              _setJWT(data.token);
            alert(`Welcome ${userName} \n\nYou have logged in successfully`);
          }
        })
} catch (e) {
    console.log(e);
    console.log('---------------------');
}
return false;
}
function HomeScreen({ navigation }) {
  const [username, setUsername]=React.useState("");
  const [movieName, setMovie]=React.useState("");
  const [rating, setRating]=React.useState("");
  const [loggedIn, setLoggedIn]=React.useState(false);
  const [JWT, setJWT]=React.useState("");
  const [data, setData] = React.useState([]);
  const [mov, setMov] = React.useState([]);
  const showFilmList = false;
  const [isModalVisible, setisModalVisible] = React.useState(false);
  const [inputText, setInputTextValue] = React.useState("");
  const [itemName, setId] = React.useState("");
  const [rating1, setrating1] = React.useState();
  const [isRefresh, setIsRefresh]= React.useState(false);


  function _setMovie(){
    setMovie("");
    setRating("");
  }
  function _setJWT(JWT){
    setJWT(JWT);
  }
  function setModalVisible(bool) {
    setisModalVisible(bool);
  }

  function setInputText(rating) {
    setInputTextValue(rating);
  }

  function setItemName(name) {
    setId(name);
  }


  function editItems(itemName, rating1) {
    const newData = data.map(item => {
      if (item.name === itemName) {
        try {
          fetch(localHost+"/api/v1/films", {
            method: 'PUT',
            body: JSON.stringify({ name: itemName, rating: rating1 }),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'bearer ' + jwtToken
            }
          }).then(resp => {
            setTimeout(function () {
              if (resp.status == 200) {
               alert("\t\t\tRating for movie : \""+itemName+"\" got updated\n\n click on Fetch Movies to see updated rating.");
              } 
              else if(resp.status== 411){alert("\t\t\tError : Unable to update.\n Stepping should be in the multiples of 0.5");}
              else if(resp.status== 412){alert("\t\t\tError : Unable to Update.\n The Rating should be between 1 and 5")}
              else{alert("Login before attempting to update")}              
            }, 0)
          });
          // this.getFilms();
        } catch (e) {
          console.log(e);
          console.log('------------------------');
        }
      }
    })
  }

  const renderItem = ({ item }) => (
    <TouchableWithoutFeedback 
        onPress={() => { 
          if(jwtToken!=undefined){
          setModalVisible(true);
          setInputText(item.rating);
          setItemName(item.name);
          }
          else{
            alert("Updation works only when logged in")
          }
        }
      }    
    >
    <View style={{paddingVertical:20, paddingHorizontal:15,flexDirection:"row", justifyContent:"space-between", borderBottomWidth:0.3, borderBottomColor:"grey"}}>
        <Text style={{fontSize:20}}> {"Movie : "+ item.name} </Text>
        <Text style={{fontSize:20}}>{"Rating : " + item.rating} </Text>
      </View>
    </TouchableWithoutFeedback> 
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={{ flex: 1,justifyContent: 'center', alignItems: 'center', backgroundColor:"#ffffff"}}>
   <Text style={{fontSize:30,fontWeight:"bold",textAlign:"center", color:"black", marginBottom:10}}>
        {
          loggedIn?"Hello "+username+", you have logged in successfully":"Please login below"
        }
      </Text>
      {       
          <React.Fragment>
            <TextInput placeholder="Enter User Name"
              style={{ height: 30,margin:5, width: 115, borderColor: (jwtToken!=undefined)?"grey":"black", borderWidth: (jwtToken!=undefined)?0.5:1, textAlign:"center" }}
              id="username"
              onChangeText={(text)=>setUsername(text)}
              disabled={(jwtToken==undefined)?false:true}
              value={(jwtToken==undefined)?username:""}
            />
            <Button title={(jwtToken==undefined)?"Click to Login":"Logged In"}
              disabled={(jwtToken==undefined)?false:true}
              style={{marginBottom:30}}
              color="black"
              onPress={()=> {
                Keyboard.dismiss();
              if(jwtToken==undefined){
                if(username!=""){
                  setLoggedIn(true);login(username,_setJWT);
                }
                else{
                  alert("enter username")
                }
              }
              else{alert("already logged in")}
                }
              }
            />
          </React.Fragment>
      }
      <View style={{flexDirection:"row", justifyContent:"space-between"}}>
      <TextInput placeholder="Enter a movie name"
        id="movieName"
        style={{ height: 40, width: 180, borderColor: 'black', borderWidth: 1,  margin:5, alignContent:"center", textAlign:"center", marginTop:20}}
        onChangeText={(text)=>setMovie(text)}
        value={movieName}
      />
      <TextInput placeholder="Enter a rating. scale: 1.0 to 5.0"
        style={{ height: 40, width: 180, borderColor: 'black', borderWidth: 1,  margin:5, alignContent:"center", textAlign:"center",marginTop:20 }}
        id="movieRating"
        keyboardType={'numeric'}
        onChangeText={(text)=>setRating(text)}
        value={rating}
      />      
      </View>
       <Button 
          title="Add Movie to DB"
          style={{paddingTop:10, width:150}}
          color="black"
          onPress={()=> {   
            Keyboard.dismiss();
            if((JWT!="")){
              if(movieName!=""){
              if(rating%0.5==0){
                createFilm(movieName, rating,_setMovie);   
                getFilms(setData);
                setMov([])
                data.forEach(movie=>{setMov(prevState=>[...prevState,movie])})
              }
              else{
                alert("The rating should be in multiple of 0.5");
              }
            }else{alert("name is needed")}
            }
            else{
              alert('Please login first');
            }
          }}
        />
      <Text>{"\n"}</Text>
      <View style={{justifyContent: 'space-between'}}>
      <Button 
          title="Fetch Movies"
          color="black"
          onPress={()=> {
            Keyboard.dismiss();
            getFilms(setData);
            setMov([])
            data.forEach(movie=>{setMov(prevState=>[...prevState,movie])})
            }
          }
        />
        <Text style={{color:"grey", paddingTop:5, paddingBottom:20}}>click on any item below to update it</Text>
           </View>
      <FlatGrid id="grid"
           style={{width: "90%"}}
          itemDimension={300}
          data={mov}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          refreshing={isRefresh}
          onRefresh={()=>{
            getFilms(setData);
            setMov([])
            data.forEach(movie=>{setMov(prevState=>[...prevState,movie])})
            setIsRefresh(false);
            }  
          }
        />
        <Modal animationType="fade" transparent={true} visible={isModalVisible} onPress={Keyboard.dismiss}
            onRequestClose={() => setModalVisible(false)}>
            <View style={{flex:1, backgroundColor:'#000000aa', justifyContent:"center"}}  >
            <View style={{flex:0.3,backgroundColor:"#ffffff",margin:30, padding:30, justifyContent:"center"}}>
              <Text style={{textAlign:"center", fontSize:15}}>Change Rating for : <Text style={{fontSize:20, fontWeight:"bold"}}>{itemName+"\n"} </Text>   </Text>
                  <TextInput
                      defaultValue={String(inputText)}
                      keyboardType={'numeric'}
                      editable={true}
                      maxLength={3}
                      style={{borderColor:"black", borderWidth:1,width:50, alignSelf:"center", fontSize:20, textAlign: "center", fontWeight:"bold"}}
                      onChangeText={text => setrating1(text)}
                  />
                  <Text />
                  <View style={{flexDirection:"row", flex:0.3, alignContent:"space-around", alignItems:"center", justifyContent:"space-around"}}>
                  <Button title="Update Rating" 
                      color="black"
                      onPress={() => { 
                        Keyboard.dismiss();
                        getFilms(setData);
                        editItems(itemName, rating1); 
                        setisModalVisible(false) ;
                        }}
                    >
                  </Button>
                  <Button title="Cancel" 
                      color="black"
                      onPress={() => { 
                        setisModalVisible(false) ;
                        }}
                    >
                  </Button>
                  </View>
                </View>
                </View>
        </Modal>         
    </View>
    </TouchableWithoutFeedback>
  );
}

const Stack = createStackNavigator();

function App() {

  return (
    <NavigationContainer>
    <Stack.Navigator><Stack.Screen Style={{textAlign:"center"}}name="Reviews" component={HomeScreen} />
    </Stack.Navigator>
    
    </NavigationContainer>

  );
}

export default App;

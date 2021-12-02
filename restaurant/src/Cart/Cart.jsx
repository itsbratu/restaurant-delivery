import React, { useEffect } from 'react'
import { useState } from 'react';
import { getCookie } from 'cookies';
import Axios from 'axios'
import dataCartFormat from './logic';
import CartItem from './CartItem';
import InputAddress from './InputAddress';
import DefaultMap from './DefaultMap';

import Geocode from "react-geocode";
import { GoogleMap , withScriptjs , withGoogleMap , Marker , Polyline , DirectionsRenderer} from 'react-google-maps';

require('dotenv').config()

const REACT_APP_MY_GOOGLE_MAPS_API = process.env.REACT_APP_MY_GOOGLE_MAPS_API;
const REACT_APP_MY_GEOCODE_API = process.env.REACT_APP_MY_GEOCODE_API;          
Geocode.setApiKey(`${REACT_APP_MY_GEOCODE_API}`);
Geocode.setLanguage("en");
Geocode.setRegion("ro");

const Cart = () =>{

    const [shoppingItems , setShoppingItems] = useState([]);
    const [street , setStreet] = useState('');
    const [streetNumber , setStreetNumber] = useState('');
    const [phone , setPhone] = useState('');
    const [apartament , setApartment] = useState('');
    const [position , setPosition] = useState({lat : 0 , lng : 0});
    const [invalidAddress , setInvalidAddress] = useState({invalidStreet : false , invalidNumber : false , invalidAp : false , invalidPhone : false})

    function removeFromCart(id) {
        const oldItem = shoppingItems.find(it => it.id === id)
        const currentItem = {idItem : id , user : getCookie('email') , quantity : oldItem.quantity};
        Axios.post("http://localhost:4000/deleteItem", {
            entry : currentItem
        })
        .then(() => {
            const newItems = [...shoppingItems].filter(it => it.id !== id)
            setShoppingItems(newItems)
        })
        .catch(console.log)
    }

    function incrementItem(id) {
        const oldItemIndex = shoppingItems.findIndex(it => it.id === id)
        const currentItem = {idItem : id , user : getCookie('email') , quantity : 1};
        Axios.post("http://localhost:4000/addItem", {
            entry : currentItem
        })
        .then(() => {
            const newItems = [...shoppingItems]
            newItems[oldItemIndex].quantity += 1
            setShoppingItems(newItems)
        })
        .catch(console.log)
    }

    function decrementItem(id) {
        const oldItemIndex = shoppingItems.findIndex(it => it.id === id)

        const currentItem = {idItem : id , user : getCookie('email') , quantity : 1};
        Axios.post("http://localhost:4000/deleteItem", {
            entry : currentItem
        })
        .then(() => {
            const newItems = [...shoppingItems]
            newItems[oldItemIndex].quantity -= 1;
            if(newItems[oldItemIndex].quantity == 0){
                removeFromCart(id);
            } 
            setShoppingItems(newItems);
        })
        .catch(console.log)
    }

    function getPosition(){
        var userAddress = "Cluj-Napoca ," + " strada " + street + " nr." + streetNumber;
        if(apartament.length > 0){userAddress += ", " + "ap." + apartament} 
        Geocode.fromAddress(userAddress).then(
            (response) => {
              const { lat, lng } = response.results[0].geometry.location;
              invalidAddress.invalidStreet = false;
              invalidAddress.invalidNumber = false;
              invalidAddress.invalidAp = false;
              invalidAddress.invalidPhone = false;
              setPosition({lat : lat , lng : lng});
            },
            (error) => {
              console.error(error);
            }
          );
    }

    function validateInput(streetInput , numberInput , apInput ,  phoneInput , setInvalidAddress){
        var invalidAddress = {invalidStreet : false , invalidNumber : false , invalidAp : false , invalidPhone : false};
        let phoneRegex = new RegExp("^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$");
        let numberRegex = new RegExp("^[1-9][0-9]?$|^1000$");
        let apRegex = new RegExp("^[1-9][0-9]?$|^1000$");
        if(streetInput.length <= 0){
            invalidAddress.invalidStreet = true;
        }
        if(!numberRegex.test(numberInput)){
            invalidAddress.invalidNumber = true;
        }   
        if(!apRegex.test(apInput) && apInput.length > 0){
            invalidAddress.invalidAp = true;
        }
        if(!phoneRegex.test(phoneInput)){
            invalidAddress.invalidPhone = true;
        }
        if((invalidAddress.invalidStreet) || (invalidAddress.invalidNumber) || (invalidAddress.invalidAp) || (invalidAddress.invalidPhone)){
            setInvalidAddress(invalidAddress);
        }else{
            getPosition();
        }
        
    }

    useEffect(()=>{
        Axios.post("http://localhost:4000/myItems" , {
            user : getCookie('email') ,
        }).then(response =>{
            setShoppingItems(dataCartFormat(response.data));
        }).catch(error =>{
            console.log(error);
        })
    } , [])

    function calculateTotal(){
        var totalSum = 0;
        shoppingItems.map((currentItem) => {
            totalSum += currentItem.quantity * currentItem.price;
        })
        return totalSum;
    }

    function PathMap(){
        return(
            <GoogleMap defaultZoom = {16} 
            defaultCenter = {{lat : position.lat , lng : position.lng}}>
                <Marker key = {1} position = {{lat : 46.753350 , lng : 23.576040}} icon = {{url : "/images/P.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
                <Marker key = {2} position = {{lat : 46.783280 , lng : 23.631000}} icon = {{url : "/images/P.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
                <Marker key = {3} position = {{lat : 46.750930 , lng : 23.596210}} icon = {{url : "/images/P.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
                <Marker key = {4} position = {{lat : 46.770910 , lng : 23.593310}} icon = {{url : "/images/P.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
                <Marker key = {5} position = {{lat : 46.767700 , lng : 23.624330}} icon = {{url : "/images/P.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
                <Marker key = {6} position = {{lat : position.lat , lng : position.lng}} icon = {{url : "/images/home-map.png" , scaledSize : new window.google.maps.Size(50 , 50)}}/>
            </GoogleMap>
        )
    }

    const WrapperDefaultMap = withScriptjs(withGoogleMap(DefaultMap));
    const WrapperUserMap = withScriptjs(withGoogleMap(PathMap));

    function switchMapRender(){
        if(position.lat == 0 && position.lng == 0){
            return(
                <WrapperDefaultMap 
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${REACT_APP_MY_GOOGLE_MAPS_API}`}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{height: `100%`, width: `100%`}} />}
                    mapElement={<div style={{height: `100%`, width: `100%`}} />} 
                />
            )
        }
        return(
            <WrapperUserMap 
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${REACT_APP_MY_GOOGLE_MAPS_API}`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{height: `100%`, width: `100%`}} />}
                mapElement={<div style={{height: `100%`, width: `100%`}} />} 
            />
        )
    }

    return(
        <div className = "grid gap-5 grid-areas-cart-layout h-auto mx-10 my-10">
            <div className = "grid grid-in-cart bg-gray-100 h-screen">
                <div className = "flex flex-col justify-start m-5">
                    {shoppingItems.map((currentItem) => {
                        return(
                            <CartItem incrementItem={incrementItem} decrementItem={decrementItem} removeFromCart={removeFromCart} id = {currentItem.id} name = {currentItem.name} price = {currentItem.price} quantity = {currentItem.quantity}/>
                        );  
                    })}
                    <div className = "flex items-center justify-center h-1/6 w-full ">
                        <h1 className = "text-5xl font-general-font ">Total : {calculateTotal()} <i class="fas fa-dollar-sign"></i> </h1>
                    </div>
                </div>
            </div>
            <div className = "grid grid-in-map h-screen">
                {switchMapRender()}
            </div>
            <div className = "grid grid-in-contact-user bg-gray-100 rounded-3xl h-full">
                <div className = "flex flex-col m-5 bg-gray-400 rounded-3xl items-center justify-evenly">
                    <InputAddress name = {"Street"} setProperty = {setStreet} invalidInput = {invalidAddress.invalidStreet}/>
                    <InputAddress name = {"Street number"} setProperty = {setStreetNumber} invalidInput = {invalidAddress.invalidNumber}/>
                    <InputAddress name = {"Apartment"} setProperty = {setApartment} invalidInput = {invalidAddress.invalidAp}/>
                    <InputAddress name = {"Phone number"} setProperty = {setPhone} invalidInput = {invalidAddress.invalidPhone}/>
                    <button className = "w-1/4 h-1/6 font-extrabold font-general-font text-4xl animation ease-in-out duration-300 transform hover:scale-125" onClick = {() => {validateInput(street , streetNumber , apartament , phone , setInvalidAddress)}}>Find me!</button>
                </div>
            </div>
        </div>
    );
}

export default Cart;
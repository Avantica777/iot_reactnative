import React, { Component} from 'react';
import {Text, View, Linking, TouchableHighlight, ImageBackground, PermissionsAndroid, Platform, StyleSheet, Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { QRScannerView } from 'ac-qrcode-rn';
import PropTypes from 'prop-types';
import PushNotificationIOS from 'react-native';
import PubNubReact from 'pubnub-react';
var PushNotification = require('react-native-push-notification');

export default class QRCodeViewComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //variable to hold the qr value
      qrvalue: '',
      opneScanner: false,
    };
    console.log("notification on...");
        
    //Notification Settings...
    this.pubnub = new PubNubReact({
        publishKey: 'pub-c-63043a72-1fb2-4b23-8b79-fc3dd791d176',
        subscribeKey: 'sub-c-7c72ef04-6cde-11e9-81d5-56c3556875f9'
    });
    this.pubnub.init(this);
    PushNotification.configure({
        // Called when Token is generated.
        onRegister: function(token) {
            console.log( 'TOKEN:', token );
            alert('Token:'+token);
            if (token.os == "ios") {
                this.pubnub.push.addChannels(
                    {
                        channels: ['notifications'],
                        device: token.token,
                        pushGateway: 'apns'
                    }
                );
                // Send iOS Notification from debug console: {"pn_apns":{"aps":{"alert":"Hello World."}}}
            } else if (token.os == "android"){
                this.pubnub.push.addChannels(
                    {
                        channels: ['notifications'],
                        device: token.token,
                        pushGateway: 'gcm' // apns, gcm, mpns
                    }
                );
            // Send Android Notification from debug console: {"gcm":{"data":{"message":"Hello World."}}}
            }  
        }.bind(this),
        // Something not working?
        // See: https://support.pubnub.com/support/solutions/articles/14000043605-how-can-i-troubleshoot-my-push-notification-issues-
        // Called when a remote or local notification is opened or received.
        onNotification: function(notification) {
            console.log( 'NOTIFICATION:', notification );
            // Do something with the notification.
            // Required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
            // notification.finish(PushNotificationIOS.FetchResult.NoData);
        },
        // ANDROID: GCM or FCM Sender ID
        senderID: "218649960224",
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },
        popInitialNotification: true,
        requestPermissions: true,
    });
  }
  onOpenlink(data) {
    // Linking.openURL(this.state.qrvalue).catch(err => console.error('An error occured', err));
    // this.props.navigation.navigate('AlarmSetting', {url: JSON.stringify(data)});
    this.props.navigation.navigate('SetWifiInfo', {SSID: data});
  }

  onSuccess(e) {
    this.setState({ qrvalue: e.data });
    this.setState({ opneScanner: false });
    this.onOpenlink(e.data);
  }

  renderTopBarView() {
    return (
      <Text></Text>
    )
  }

  renderBottomMenuView() {
    return (
      <Text></Text>
    )
  }

  onOpneScanner() {
    var that =this;
    //To Start Scanning
    PushNotification.localNotificationSchedule({
        //... You can use all the options from localNotifications
        message: "Scan QRCode correctly", // (required)
        date: new Date(Date.now() + 10), // in 1 secs
        vibrate: true, // (optional) default: true
        vibration: 500, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        title: "Notification on QRCode Scanning", // (optional)
    });
    if(Platform.OS === 'android'){
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,{
              'title': 'FlapSentry Camera Permission',
              'message': 'Do you allow this app access to your camera?'
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //If CAMERA Permission is granted
            that.setState({ qrvalue: '' });
            that.setState({ opneScanner: true });
          } else {
            alert("CAMERA permission denied");
          }
        } catch (err) {
          alert("Camera permission err",err);
          console.warn(err);
        }
      }
      //Calling the camera permission function
      requestCameraPermission();
    }else{
      that.setState({ qrvalue: '' });
      that.setState({ opneScanner: true });
    }    
  }
  render() {
    let displayModal;
    //If qrvalue is set then return this view
    if (!this.state.opneScanner) {
      return (
        <View style={styles.container}>
            <LinearGradient 
                start={{ x: 0.0, y: 0.25 }} end={{ x: 0.5, y: 1.0 }}
                colors={['#3762fd', '#4fd0f2', '#ffffff']}
                locations={[0, 0.4, 0.5]}
                style={
                    {
                        flex:1, 
                        position: "absolute",
                        width: '100%', 
                        height: '100%'
                    }
                }
            />
            
            <Text style={styles.heading}>FLAP SENTRY</Text>
            <ImageBackground 
                source={require('../../Resources/QRBackground.png')} 
                style={
                    styles.qrbackground
                }
            />
            <TouchableHighlight
              onPress={() => this.onOpneScanner()}
              style={styles.btncontainer}
              >
                <LinearGradient 
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    style={
                        styles.qrbutton
                    }
                >
                    <Text style={{color: "#fff"}}> Scan Device QRCode To Continue </Text>
                </LinearGradient>
            </TouchableHighlight>
        </View>
      );
    }

    return (
      <View style={styles.scancontainer}>
        {/* <Text 
            style={
                {
                    color:'green',
                    backgroundColor: 'transparent',
                    fontSize: 18,
                    alignContent: "center",
                    alignItems: 'center',
                    paddingLeft: 80,
                    paddingRight: 80,
                    paddingTop: 10
                }
            }
        >
            Scanning QR Code ... 
        </Text> */}
        {/* <QRCodeScanner
          onRead={this.onSuccess.bind(this)}
        /> */}
        < QRScannerView
            onScanResultReceived={this.onSuccess.bind(this)}
            renderTopBarView={this.renderTopBarView}
            renderBottomMenuView={this.renderBottomMenuView}
            hintText='Set Correct Camera Position'
            maskColor='#0000506d'
        />
        {/* <View style={styles.scancover}/> */}
      </View>
    );
  }
}
const styles = StyleSheet.create({

    scancontainer: {
        width: '100%',
        height: '100%',
    },

    scancover: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderLeftWidth: 25,
        borderRightWidth: 25,
        borderTopWidth: 40,
        borderBottomWidth: 40,
        // borderColor: '#00000080'
    },

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#494949',
        width: '100%'
    },
    btncontainer: {
        marginTop: 5,
        borderRadius:5,
        borderColor: '#fff'
    },
    qrbutton: {
        paddingTop:15,
        paddingBottom:15,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius:5,
        borderColor: '#ddd'
    },
    qrbackground: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#841584',
        padding: 10,
        width: 300,
        height: 300,
        borderRadius: 10,
        overflow: 'hidden'
    },
    heading: { 
        color: '#ddd', 
        fontSize: 32, 
        alignSelf: 'center', 
        padding: 10,
        marginTop: 20,
        marginBottom: 25
    }
});
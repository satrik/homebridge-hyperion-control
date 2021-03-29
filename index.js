var Service, Characteristic;
var packageJson = require('./package.json');
var fetch = require('node-fetch');

var savedState = false;
var savedBrightness = 0;
var errorCount = 0;

module.exports = function (homebridge) {

  Service = homebridge.hap.Service;

  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory('homebridge-hyperion-control', 'HyperionControl', HyperionControl);

}

function HyperionControl (log, config) {

    this.log = log;

    this.name = config.name || "Hyperion";
    this.port = config.port || 8090;
    this.url = config.url + ":" + this.port + "/json-rpc";
    this.token = config.token || 0;
    
    this.headersData = { "Content-Type" : "application/json" };

    if(this.token != 0){

        this.headersData["Authorization"] = "token " + this.token;
    
    }

    this.manufacturer =  packageJson.author;
    this.serial = this.url;
    this.model = packageJson.name;
    this.firmware = packageJson.version;

    this.service = new Service.Lightbulb(this.name);

}

HyperionControl.prototype = {

    fetchData: async function (bodyData, callback) {
        
        try {

            const fetchData = await fetch(this.url, {
                    method: 'POST',
                    headers: this.headersData,
                    body: bodyData,
                });
                
            const responseData = await fetchData.json();

            if(responseData.success){
                                
                callback(responseData);

                errorCount = 0;

            } else {
                
                if(errorCount == 0){
                
                    this.log("===== ERROR LOG START =====");
                    this.log(responseData);
                    
                }
                
                callback("error");
            
            }

        } catch (error) {
            
            callback("error");
        
        }
    
    },

    getState: function (callback) {

        callback(null, savedState);

        this.fetchData('{"command":"serverinfo"}', function (response) {

            if(response != "error"){
            
                this.service.getCharacteristic(Characteristic.On).updateValue(response.info.components[0].enabled);
            
                savedState = response.info.components[0].enabled;
            
            } else {

                if(errorCount == 0){

                    this.log("===== ERROR LOG END =====");

                    errorCount++

                }

            }
        
        }.bind(this));

    },

    setState: function (value, callback) {
    
        this.fetchData('{"command":"componentstate","componentstate":{"component":"ALL","state":'+ value +'}}', function (response) {

            var stateString = (value) ? "ON" : "OFF";
         
            this.log("Turn Instance: " + stateString);

            callback();
        
        }.bind(this));

    },
  
    getBrightness: function (callback){

        callback(null, savedBrightness);

        this.fetchData('{"command":"serverinfo"}', function (response) {

            if(response != "error"){

                this.service.getCharacteristic(Characteristic.Brightness).updateValue(response.info.adjustment[0].brightness);
              
                savedBrightness = response.info.adjustment[0].brightness;
          
            } 

        }.bind(this));
    
    },
  
    setBrightness: function (value, callback){
      
        this.fetchData('{"command":"adjustment","adjustment":{"brightness":'+ value +'}}', function (response) {

            this.log("Set Brightness to: " + value) + "%";

            callback();
  
        }.bind(this));

    },

    identify: function (callback) {

        callback();
  
    },


    getServices: function () {

        this.informationService = new Service.AccessoryInformation();

        this.informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial)
            .setCharacteristic(Characteristic.FirmwareRevision, this.firmware);

        this.service
            .getCharacteristic(Characteristic.On)
            .on('get', this.getState.bind(this))
            .on('set', this.setState.bind(this));

        this.service.addCharacteristic(Characteristic.Brightness)
            .on("get", this.getBrightness.bind(this))
            .on("set", this.setBrightness.bind(this));
        
        return [this.informationService, this.service];

  }

}
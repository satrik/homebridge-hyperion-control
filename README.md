# :warning: Discontinued

I decided to discontinue the development of this plugin as I don't use it anymore. I don't archive it for now, as the plugin still works but it is to be expected that at some point it will no longer work

---

---

# homebridge-hyperion-control
Homebridge plugin to turn hyperion ng instance on/off and change brightness

## Install

```
sudo npm install -g homebridge-hyperion-control
```

## Configuration

Example configuration:
```json
{
    "accessory": "HyperionControl",
    "name": "TV Backlight",
    "url": "http://192.168.0.123",
    "port": 8090,
    "token": "abc123abc-abcd-abcd-abcd-abcd1234abcd"
}
```

- `accessory` **required**: must always be "HyperionControl"
- `name` optional: displayname of your device (default: Hyperion)
- `url` **required**: IP/URL of your hyperion ng instance  
- `port` optional: port of your hyperion ng webserver (default: 8090)
- `token` optional: authorization token (see hyperion ng network configuration)

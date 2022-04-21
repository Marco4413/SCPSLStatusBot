# SCPSLStatusBot

## Steps to run this project:

 1. Create a `.env.json` file on the project's root and add the following template:
```json
{
    "_comment0": "The Discord fallback token which is used when there isn't an SL Server-Specific one",
    "fallbackToken": "",
    "_comment1": "A custom implementation to get Stats from SCPSL Servers",
    "implementation": "./stats/StatsBaseImpl.js",
    "_comment2": "The update interval of the Rich Presence (ms)",
    "rpUpdateInterval": 10e3,
    "_comment3": "The throttle time for the SCPSL api (ms)",
    "apiThrottleInterval": 60e3,
    "servers": [
        {
            "_comment0": "The token of the Discord Bot Account that handles this Server's Stats",
            "_comment1": "(If multiple servers have the same token then the bot will switch between them at every update)",
            "token": "",
            "_comment2": "Your Server's Id and Key can be found by following this guide: https://support.scpslgame.com/article/61",
            "id": 0,
            "accountId": "",
            "key": "",
            "_comment3": "The Server's Name (Used for Pretty Printing)",
            "name": "Server0"
        },
        {
            "token": "",
            "id": 1,
            "accountId": "",
            "key": "",
            "name": "Server1"
        }
    ]
}
```
 2. Run `npm i` to install all dependencies
 3. Run `npm run start` to run the project

**NOTE:** This Project uses Node v16.13.0

## Contributing

This project uses EditorConfig, so if you're using VSCode you should download
the EditorConfig extension specified in the Official Site: [https://editorconfig.org](https://editorconfig.org)

It also uses ESLint, extensions can be found at the following link: [https://eslint.org/docs/user-guide/integrations](https://eslint.org/docs/user-guide/integrations)<br>
The ESLint module is a dev dependency of this project.

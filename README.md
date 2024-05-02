# Web3 chat

## Install project
`git clone https://github.com/Projects4School/web3-chat ChatWeb3`

`cd ChatWeb3`

## Start project
`cd starter-files`

### Install modules
`npm install`

### Add this code to /node_modules/react-scripts/config/webpack.config.js below to `resolve` (line 305 maybe)
```js
fallback: { "http": require.resolve("stream-http"), "https": require.resolve("https-browserify"), "zlib": require.resolve("browserify-zlib")  },
```


### Start project
`npm start`
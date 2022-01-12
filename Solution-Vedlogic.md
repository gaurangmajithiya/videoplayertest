Vedlogic Video player


#### Basic usage:

`document.querySelector('video.my-player').purePlayer();`


#### Available methods:
|Method           |Description                           |
|-----------------|--------------------------------------|
|`.play()`        |Play the video                        |
|`.pause()`       |Pause the video                       |
|`.stop()`        |Stop playing and set position to start|
|`.setPosition(5)`|Set current position (in seconds)     |
|`.init()`        |Initiate player after removing        |

#### Available events:
##### onplay
|||
|---|---|
|`.onplay`|Call when video start playing. You can specify parameter to get position (in seconds) of current video.|

Example:

    myPlayer.onplay = function (currentPosition) {
        console.log('Play video from ', currentPosition);
    }
##### onpause
|||
|---|---|
|`.onpause`|Call when video pause playing. You can specify parameter to get position (in seconds) of current video.| 

Example:

    myPlayer.onpause = function (currentPosition) {
        console.log('Pause video from ', currentPosition);
    }
    
##### onend
|||
|---|---|
|`.onend`|Call when video finished.| 

Example:

    myPlayer.onend = function () {
        console.log('The end!');
    }


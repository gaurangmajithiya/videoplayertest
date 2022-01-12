(function () {
    Element.prototype.on = function (eventName, eventListener, useCapture) {
        this.addEventListener(eventName, eventListener, useCapture);
        return this;
    };

    HTMLElement.prototype.purePlayer = function (params) {
        var defaultParams = {
            format: 'video/mp4',
            video: {
                '': {
                    'src': this.src,
                }
            }
        };

        params = params || defaultParams;

        for (var attr in defaultParams) {
            params[attr] = typeof params[attr] !== 'undefined' ? params[attr] : defaultParams[attr];
        }

        var me = this,
            source = document.createElement('source'),
            video = document.createElement('video'),
            player = document.createElement('div'),
            controlsBar = document.createElement('div'),
            progressWrapper = document.createElement('div'),
            hovered = document.createElement('span'),
            progressCommon = document.createElement('div'),
            progressPosition = document.createElement('div'),
            progressLoader = document.createElement('div'),
            playButton = document.createElement('div'),
            timeProgress = document.createElement('span'),
            controlButtons = document.createElement('div'),
            volumeBox = document.createElement('div'),
            volumeIcon = document.createElement('div'),
            fullSizeIcon = document.createElement('div'),
            stopRewind = true;

        var fn = {
            toggleFullScreen: function () {
                if (!document.fullscreenElement) {
                    if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                } else {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    }
                }
            },
            convertTime: function (sec) {
                var hh = Math.floor(sec / 60 / 60).toFixed();
                var mm = Math.floor((sec - hh * 60 * 60) / 60).toFixed();
                var ss = (((sec - hh * 60 * 60) - mm * 60)).toFixed();
                if (mm < 10) {
                    mm = '0' + mm;
                }
                if (ss < 10) {
                    ss = '0' + ss;
                }
                if (hh > 0) {
                    return hh + ':' + mm + ':' + ss;
                } else {
                    return mm + ':' + ss;
                }
            },
            setVolume: function (i) {
                i = i || 0;

                if (i > 1) i = 1;
                if (i < 0) i = 0;

                if (i > 0) {
                    volumeIcon.className = 'volume-icon';
                } else {
                    volumeIcon.className = 'volume-icon volume-off';
                }

                video.volume = i;
                document.cookie = 'volume=' + i;
            },
            toggleMute: function () {
                if (video.volume > 0) {
                    fn.setVolume(0);
                } else {
                    fn.setVolume(1);
                }
            },
            updatePosition: function () {
                progressPosition.style.width = video.currentTime / video.duration * 100 + '%';
                timeProgress.innerHTML = fn.convertTime(video.currentTime || 0) + ' / ' + fn.convertTime(video.duration || 0);
                if (video.currentTime > 180) {
                    me.stop();
                }

                if (video.currentTime > 60 || video.currentTime < 4) {
                    progressPosition.className = "progress-positionHide"
                }
                else {
                    progressPosition.className = "progress-position"
                }
                if (video.duration - video.currentTime === 0 && typeof me.onend === 'function') {
                    me.onend();
                }
            },
            rewind: function (backward) {
                rewindWorking = true;

                if (!video.paused) {
                    video.pause();
                }

                if (!backward) {
                    video.currentTime += 10;
                } else {
                    video.currentTime -= 10;
                }

                this.updatePosition();

                if (!stopRewind) {
                    setTimeout(function () {
                        fn.rewind(backward)
                    }, 100);
                } else {
                    rewindWorking = false;
                }
            },
        };



        source.setAttribute('type', params.format);

        video.appendChild(source);

        video.on('click', function () {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        }).on('progress', function () {
            if (this.buffered.length > 0) {
                progressLoader.style.left = this.buffered.start(0) / this.duration * 100 + '%';
                progressLoader.style.width = this.buffered.end(this.buffered.length - 1) / this.duration * 100 - parseFloat(progressLoader.style.left) + '%';
            }
        }).on('loadeddata', function () {
            timeProgress.innerHTML = fn.convertTime(this.currentTime) + ' / ' + fn.convertTime(this.duration);
        }).on('pause', function () {
            playButton.className = 'play-button';

            if (typeof me.onpause === 'function') {
                me.onpause(video.currentTime);
            }
        }).on('play', function () {
            playButton.className = 'play-button pause';
            fn.setVolume(1);

            if (typeof me.onplay === 'function') {
                me.onplay(video.currentTime);
            }
        }).on('timeupdate', function () {
            if (this.duration) {
                fn.updatePosition();
            }
        }).on('dblclick', fn.toggleFullScreen);

        playButton.className = 'play-button';
        playButton.on('click', function () {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        hovered.className = 'hovered';

        timeProgress.className = 'time';

        progressPosition.className = 'progress-position';

        progressLoader.className = 'loader';

        controlsBar.className = 'controls-bar';

        volumeIcon.className = 'volume-icon';
        volumeIcon.on('click', function () {
            fn.toggleMute();
        });

        volumeBox.className = 'volume-box';
        volumeBox.appendChild(volumeIcon);

        var isPaused = video.paused,
            currentTime = video.currentTime;

        this.className = 'active';
        source.setAttribute('src', params.video[this.innerText].src);
        video.src = params.video[this.innerText].src;
        video.currentTime = currentTime;
        if (!isPaused)
            video.play();

        fullSizeIcon.className = 'full-size-icon';
        fullSizeIcon.on('click', fn.toggleFullScreen);

        controlButtons.className = 'control-buttons';

        controlButtons.appendChild(fullSizeIcon);

        progressCommon.className = 'progress';
        progressCommon.appendChild(progressPosition);
        progressCommon.appendChild(progressLoader);

        progressWrapper.className = 'progress-wrap';
        progressWrapper.appendChild(hovered);
        progressWrapper.appendChild(progressCommon);

        progressWrapper.on('click', function (e) {
            video.currentTime = video.duration * (e.offsetX / (this.offsetWidth - e.target.offsetLeft));
        }).on('mousemove', function (e) {

            var time = (video.duration || 0) * e.offsetX / (this.offsetWidth - this.offsetLeft);
            hovered.innerText = fn.convertTime((video.duration || 0) * e.offsetX / (this.offsetWidth - this.offsetLeft));
            hovered.style.left = ((e.offsetX + e.target.offsetLeft) - hovered.offsetWidth / 2) + 'px';
            drawImage(video, time); // Display Thumbnail
        })
            .on('mouseout', function (e) {
                drawImage(video, 0);  // Hide Thumbnail
            });

        controlsBar.appendChild(progressWrapper);
        controlsBar.appendChild(playButton);
        controlsBar.appendChild(volumeBox);
        controlsBar.appendChild(timeProgress);
        controlsBar.appendChild(controlButtons);

        player.className = 'pure-player';
        player.setAttribute('tabindex', '0');
        player.appendChild(video);
        player.appendChild(controlsBar);
        player.on('keydown', function (e) {
            e = e || window.event;
            e.preventDefault();

            switch (e.which || e.keyCode) {
                case 37:
                    if (video.currentTime - 5 > 0) {
                        video.currentTime -= 5;
                    } else {
                        video.currentTime = 0;
                    }
                    break;
                case 39:
                    if (video.currentTime + 5 < video.duration) {
                        video.currentTime += 5;
                    } else {
                        video.currentTime = video.duration;
                    }
                    break;
                case 32:
                    playButton.click();
                    break;
                case 77:
                    fn.toggleMute();
                    break;
                default:
                    break;
            }
        });

        this.init = function () {
            this.style.display = 'none';
            this.parentNode.insertBefore(player, this.parentNode.nextSibling);
            fn.setVolume(1);

            if (params.autoplay) {
                video.play();
            }
        };

        this.play = function () {
            video.play();
        };

        this.pause = function () {
            video.pause();
        };

        this.stop = function () {
            video.pause();
            video.currentTime = 0;
        };

        this.setPosition = function (i) {
            video.currentTime = i;
        };

        this.init();

        return this;
    };
})();


//This function creates Thumbnail from 4 Seconds to 60 Seconds 
function drawImage(video, specificTime) {
    var canvas = document.querySelector("#canvas-element");
    var v = document.querySelector('video');
    if (specificTime > 60 || specificTime < 4) {
        canvas.setAttribute('style', "display:none");
    }
    else {
        v.currentTime = specificTime;
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        canvas.removeAttribute('style');
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    }
}
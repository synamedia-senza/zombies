class VideoManager {

  init(player) {
    this.localPlayer = player;
    this.remotePlayer = hs.remotePlayer;
 
    hs.remotePlayer.addEventListener("timeupdate", () => {
      this.media().currentTime = hs.remotePlayer.currentTime || 0;
    });

    hs.remotePlayer.addEventListener("ended", () => {
      hs.lifecycle.moveToForeground();
    });

    hs.lifecycle.addEventListener("onstatechange", (event) => {
      if (event.state === "background") {
        this.pause();
      } else if (event.state === "foreground") {
        this.play();
      }
    });
  }

  async load(url) {
    await this.localPlayer.load(url);
    try {
      await hs.remotePlayer.load(url);
    } catch (error) {
      console.log("Couldn't load remote player.");
    }
  }
  
  media() {
    return this.localPlayer.getMediaElement();
  }
  
  play() {
    this.media().play().catch(error => {
      console.log("Unable to play video. Possibly the browser will not autoplay video with sound.");
    });
  }
  
  pause() {
    this.media().pause();
  }
  
  playPause() {
    if (this.media().paused) {
      this.play();
    } else {
      this.pause();
    }
  }
  
  skip(seconds) {
    this.media().currentTime = this.media().currentTime + seconds;
  }

  moveToForeground() {
    hs.lifecycle.moveToForeground();
  }

  moveToBackground() {
    let currentTime = this.media().currentTime;
    hs.remotePlayer.currentTime = currentTime;
    hs.remotePlayer.play();
  }
  
  async toggleBackground() {
    const currentState = await hs.lifecycle.getState();
    if (currentState == "background" || currentState == "inTransitionToBackground") {
      hs.lifecycle.moveToForeground();
    } else {
      this.moveToBackground();
    }
  }
}

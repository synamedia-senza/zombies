class VideoManager {

  init(player) {
    this.localPlayer = player;
    this.remotePlayer = senza.remotePlayer;
 
    senza.remotePlayer.addEventListener("timeupdate", () => {
      this.media().currentTime = senza.remotePlayer.currentTime || 0;
    });

    senza.remotePlayer.addEventListener("ended", () => {
      senza.lifecycle.moveToForeground();
    });

    senza.lifecycle.addEventListener("onstatechange", (event) => {
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
      await senza.remotePlayer.load(url);
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
    senza.lifecycle.moveToForeground();
  }

  moveToBackground() {
    let currentTime = this.media().currentTime;
    senza.remotePlayer.currentTime = currentTime;
    senza.remotePlayer.play();
  }
  
  async toggleBackground() {
    const currentState = await senza.lifecycle.getState();
    if (currentState == "background" || currentState == "inTransitionToBackground") {
      senza.lifecycle.moveToForeground();
    } else {
      this.moveToBackground();
    }
  }
}

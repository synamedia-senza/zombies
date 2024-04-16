const TEST_VIDEO = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

let videoManager = new VideoManager();

window.addEventListener("load", async () => {
  try {
    await hs.init();
    videoManager.init(new shaka.Player(video));
    await videoManager.load(TEST_VIDEO);
    videoManager.play();
    hs.uiReady();

    // register to receive messages sent to these groups
    hs.messageManager.registerGroups(["CT", "NJ", "NY"]);
    
  } catch (error) {
    console.error(error);
  }
});

document.addEventListener("keydown", async function(event) {
	switch (event.key) {
    case "Enter": await videoManager.toggleBackground(); break;
    case "Escape": videoManager.playPause(); break;
    case "ArrowLeft": videoManager.skip(-30); break;
    case "ArrowRight": videoManager.skip(30); break;      
		default: return;
	}
	event.preventDefault();
});

hs.messageManager.addEventListener("message", async (event) => {
  const currentState = await hs.lifecycle.getState();
  if (currentState == "background" || currentState == "inTransitionToBackground") {
    hs.lifecycle.moveToForeground();
  }

  let payload = JSON.parse(event.detail.payload);
  console.log("Title: " + payload["title"]);
  
  banner.style.opacity = 1.0;
  icon.src = `icons/${payload.icon}.png`
  title.innerHTML = payload.title;
  message.innerHTML = payload.message;
  banner.style.backgroundColor = payload.color;
});
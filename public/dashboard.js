function sendMessage() {
  fetch("/message", {
    method: "POST",
    body: JSON.stringify({
      payload: {
        icon: document.querySelector('input[name="icon"]:checked').value,
        title: title.value,
        message: message.value,
        color: color.value
      },
      groups: Array.from(groups.childNodes).filter((cb) => cb.checked).map(cb => cb.id)
    }),
    headers: {"Content-type": "application/json"}
  });
}

function checkAll(value) {
  Array.from(groups.childNodes).map((cb) => cb.checked = value);
}
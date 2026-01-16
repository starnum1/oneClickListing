document.getElementById('fillBtn').addEventListener('click', async () => {
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.tabs.sendMessage(tab.id, {
    action: 'autoFill',
    data
  })

  window.close()
})

document.getElementById('clickBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.tabs.sendMessage(tab.id, { action: 'clickButton' })

  window.close()
})

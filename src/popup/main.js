document.getElementById('startBtn').addEventListener('click', async () => {
  const discount = parseFloat(document.getElementById('discount').value) || 2

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.tabs.sendMessage(tab.id, {
    action: 'startProcess',
    discount
  })

  window.close()
})

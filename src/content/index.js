// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clickButton') {
    clickTargetButton()
  }
})

function clickTargetButton() {
  // 查找"一键上架"按钮
  const btn = document.querySelector('button.ant-btn-dangerous span')?.closest('button')
    || [...document.querySelectorAll('button')].find(b => b.textContent.includes('一键上架'))

  if (btn) {
    btn.click()
    console.log('已点击"一键上架"按钮')
  } else {
    console.log('未找到"一键上架"按钮')
  }
}

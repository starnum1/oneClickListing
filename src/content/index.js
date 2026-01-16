// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoFill') {
    autoFillForm(request.data)
  }
})

function autoFillForm(data) {
  // ============================================
  // 根据实际页面修改这里的选择器
  // ============================================

  // 1. 点击按钮打开表单（如果需要）
  const openBtn = document.querySelector('#openFormBtn') // 修改为实际按钮选择器
  if (openBtn) {
    openBtn.click()
  }

  // 2. 等待表单出现后填充
  setTimeout(() => {
    fillInput('#name', data.name)   // 修改为实际输入框选择器
    fillInput('#email', data.email) // 修改为实际输入框选择器
  }, 500)
}

// 填充输入框并触发事件
function fillInput(selector, value) {
  const input = document.querySelector(selector)
  if (input) {
    input.value = value
    // 触发事件，确保 React/Vue 等框架能检测到变化
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

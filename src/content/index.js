// 等待 DOM 加载完成后创建悬浮按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingButton)
} else {
  createFloatingButton()
}

function createFloatingButton() {
  // 避免重复创建
  if (document.getElementById('auto-click-floating-btn')) return

  const btn = document.createElement('button')
  btn.textContent = '一键上架'
  btn.id = 'auto-click-floating-btn'

  // 样式
  Object.assign(btn.style, {
    position: 'fixed',
    top: '100px',
    right: '20px',
    zIndex: '999999',
    padding: '10px 20px',
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  })

  btn.addEventListener('click', clickTargetButton)
  btn.addEventListener('mouseenter', () => btn.style.background = '#ff7875')
  btn.addEventListener('mouseleave', () => btn.style.background = '#ff4d4f')

  document.body.appendChild(btn)
}

function clickTargetButton() {
  // 1. 查找并点击"一键上架"按钮
  const btn = document.querySelector('button.ant-btn-dangerous span')?.closest('button')
    || [...document.querySelectorAll('button')].find(b => b.textContent.includes('一键上架'))

  if (btn) {
    btn.click()
    console.log('已点击"一键上架"按钮')

    // 2. 等待函数图标出现后点击（在 maozierp-ui Shadow DOM 中）
    waitForShadowElement('maozierp-ui', '.anticon-function', (el) => {
      el.click()
      console.log('已点击函数图标')
    })
  } else {
    console.log('未找到"一键上架"按钮')
    alert('未找到"一键上架"按钮')
  }
}

// 等待元素出现
function waitForElement(selector, callback, timeout = 5000) {
  const el = document.querySelector(selector)
  if (el) {
    callback(el)
    return
  }

  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector)
    if (el) {
      observer.disconnect()
      callback(el)
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  setTimeout(() => {
    observer.disconnect()
    console.log(`等待 ${selector} 超时`)
  }, timeout)
}

// 等待 Shadow DOM 中的元素出现（轮询方式）
function waitForShadowElement(hostSelector, selector, callback, timeout = 5000) {
  const startTime = Date.now()

  const check = () => {
    const host = document.querySelector(hostSelector)
    const el = host?.shadowRoot?.querySelector(selector)

    if (el) {
      callback(el)
      return
    }

    if (Date.now() - startTime < timeout) {
      setTimeout(check, 200)
    } else {
      console.log(`等待 ${hostSelector} >> ${selector} 超时`)
    }
  }

  check()
}

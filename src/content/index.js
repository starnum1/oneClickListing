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
  // 查找"一键上架"按钮
  const btn = document.querySelector('button.ant-btn-dangerous span')?.closest('button')
    || [...document.querySelectorAll('button')].find(b => b.textContent.includes('一键上架'))

  if (btn) {
    btn.click()
    console.log('已点击"一键上架"按钮')
  } else {
    console.log('未找到"一键上架"按钮')
    alert('未找到"一键上架"按钮')
  }
}

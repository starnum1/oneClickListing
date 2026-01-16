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

    // 2. 等待函数图标出现后点击
    waitForShadowElement('maozierp-ui', '.anticon-function', (el) => {
      el.click()
      console.log('已点击函数图标')

      // 3. 等待表格出现后，自动填充价格（支持分页）
      setTimeout(() => {
        processAllPages()
      }, 500)
    })
  } else {
    console.log('未找到"一键上架"按钮')
    alert('未找到"一键上架"按钮')
  }
}

// 处理所有分页
function processAllPages() {
  const shadowRoot = document.querySelector('maozierp-ui')?.shadowRoot
  if (!shadowRoot) return

  const tbody = shadowRoot.querySelector('.ant-table-tbody')
  fillPrices(tbody)

  // 检查是否有下一页
  setTimeout(() => {
    const nextBtn = shadowRoot.querySelector('.ant-pagination-next:not(.ant-pagination-disabled)')
    if (nextBtn) {
      nextBtn.click()
      console.log('切换到下一页')
      
      // 等待新页面加载后继续处理
      setTimeout(() => {
        processAllPages()
      }, 800)
    } else {
      console.log('所有页面处理完成')
    }
  }, 500)
}

// 遍历表格，原售价 - 2 填入我的售价
function fillPrices(tbody) {
  const rows = tbody.querySelectorAll('tr.ant-table-row')
  let count = 0

  rows.forEach((row, index) => {
    // 获取原售价（第7列，格式：¥43.24）
    const cells = row.querySelectorAll('td.ant-table-cell')
    const originalPriceCell = cells[6] // 第7列（索引6）
    const originalPriceText = originalPriceCell?.textContent?.trim()
    
    // 解析价格数字
    const priceMatch = originalPriceText?.match(/[\d.]+/)
    if (!priceMatch) return

    const originalPrice = parseFloat(priceMatch[0])
    const newPrice = (originalPrice - 2).toFixed(2)

    // 找到"我的售价"输入框（id 格式：form_item_rows_X_price）
    const priceInput = row.querySelector(`input[id="form_item_rows_${index}_price"]`)
    if (priceInput) {
      priceInput.value = newPrice
      priceInput.dispatchEvent(new Event('input', { bubbles: true }))
      priceInput.dispatchEvent(new Event('change', { bubbles: true }))
      count++
      console.log(`第${index + 1}行：原售价 ${originalPrice} → 我的售价 ${newPrice}`)
    }
  })
  console.log(`当前页已填充 ${count} 行价格`)
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

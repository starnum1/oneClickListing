// 等待 DOM 加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

let discountAmount = 2 // 默认减价金额
let hideExtraSku = false // 是否关闭显示所有SKU（默认不关闭）
let autoSubmit = true // 是否自动点击上架按钮（默认点击）

function init() {
  // 只在 ozon.ru/product/ 页面显示
  if (!window.location.href.includes('ozon.ru/product/')) return
  
  createFloatingPanel()
}

function createFloatingPanel() {
  if (document.getElementById('auto-listing-panel')) return

  const panel = document.createElement('div')
  panel.id = 'auto-listing-panel'
  panel.innerHTML = `
    <h3 style="margin:0 0 12px 0;font-size:14px;">一键上架助手</h3>
    <div style="margin-bottom:12px;">
      <label style="display:block;font-size:12px;margin-bottom:4px;color:#666;">减价金额 (元)</label>
      <input type="number" id="discount-input" value="2" step="0.01" min="0" 
        style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;font-size:14px;">
    </div>
    <div style="margin-bottom:12px;">
      <label style="display:flex;align-items:center;font-size:12px;color:#666;cursor:pointer;">
        <input type="checkbox" id="hide-extra-sku" style="margin-right:6px;">
        关闭显示所有SKU
      </label>
    </div>
    <div style="margin-bottom:12px;">
      <label style="display:flex;align-items:center;font-size:12px;color:#666;cursor:pointer;">
        <input type="checkbox" id="auto-submit" checked style="margin-right:6px;">
        自动上架至OZON
      </label>
    </div>
    <button id="start-btn" style="width:100%;padding:10px;background:#ff4d4f;color:white;border:none;border-radius:20px;cursor:pointer;font-size:14px;">
      一键上架
    </button>
  `

  Object.assign(panel.style, {
    position: 'fixed',
    top: '100px',
    right: '20px',
    zIndex: '999999',
    width: '200px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    fontFamily: 'system-ui, sans-serif'
  })

  document.body.appendChild(panel)

  // 拖动功能
  let isDragging = false
  let offsetX, offsetY

  panel.querySelector('h3').style.cursor = 'move'
  
  panel.querySelector('h3').addEventListener('mousedown', (e) => {
    isDragging = true
    offsetX = e.clientX - panel.offsetLeft
    offsetY = e.clientY - panel.offsetTop
    panel.style.userSelect = 'none'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    panel.style.left = (e.clientX - offsetX) + 'px'
    panel.style.top = (e.clientY - offsetY) + 'px'
    panel.style.right = 'auto'
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    panel.style.userSelect = ''
  })

  // 绑定事件
  panel.querySelector('#start-btn').addEventListener('click', () => {
    discountAmount = parseFloat(panel.querySelector('#discount-input').value) || 2
    hideExtraSku = panel.querySelector('#hide-extra-sku').checked
    autoSubmit = panel.querySelector('#auto-submit').checked
    clickTargetButton()
  })

  // hover 效果
  const btn = panel.querySelector('#start-btn')
  btn.addEventListener('mouseenter', () => btn.style.background = '#ff7875')
  btn.addEventListener('mouseleave', () => btn.style.background = '#ff4d4f')
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

      // 3. 如果勾选了关闭显示所有SKU，点击开关
      if (hideExtraSku) {
        setTimeout(() => {
          const shadowRoot = document.querySelector('maozierp-ui')?.shadowRoot
          // 找到已开启的开关并点击关闭
          const switchBtn = shadowRoot?.querySelector('.ant-switch-checked')
          if (switchBtn) {
            switchBtn.click()
            console.log('已关闭显示所有SKU')
            // 等待SKU加载后再填充价格
            setTimeout(() => processAllPages(), 800)
          } else {
            processAllPages()
          }
        }, 500)
      } else {
        // 4. 等待表格出现后，自动填充价格（支持分页）
        setTimeout(() => {
          processAllPages()
        }, 500)
      }
    })
  } else {
    console.log('未找到"一键上架"按钮')
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
      if (autoSubmit) {
        clickSubmitButton()
      }
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
    const newPrice = (originalPrice - discountAmount).toFixed(2)

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

// 点击"一键上架至OZON"按钮
function clickSubmitButton() {
  const shadowRoot = document.querySelector('maozierp-ui')?.shadowRoot
  const buttons = shadowRoot?.querySelectorAll('button.ant-btn-primary') || []
  const submitBtn = [...buttons].find(b => b.textContent.includes('一键上架至OZON'))
  
  if (submitBtn) {
    submitBtn.click()
    console.log('已点击"一键上架至OZON"按钮')
  } else {
    console.log('未找到"一键上架至OZON"按钮')
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

// 浏览器判断是否全屏
export const fullscreenEnable = () => {
  const isFullscreen = document.fullscreenEnabled ||
    (window as any).fullScreen ||
    (document as any).mozFullscreenEnabled ||
    (document as any).webkitIsFullScreen
  return isFullscreen
}

/**
 * esc监听全屏
 */
export const listenfullscreen = (callback: any) => {
  function listen() {
    callback()
  }
  document.addEventListener('fullscreenchange', (e: any) => {
    listen()
  })
  document.addEventListener('mozfullscreenchange', (e: any) => {
    listen()
  })
  document.addEventListener('webkitfullscreenchange', (e: any) => {
    listen()
  })
  document.addEventListener('msfullscreenchange', (e: any) => {
    listen()
  })
}

/**
 * 浏览器退出全屏
 */
export const exitFullScreen = () => {
  if ((document as any).documentElement.requestFullScreen) {
    (document as any).exitFullScreen()
  } else if ((document as any).documentElement.webkitRequestFullScreen) {
    (document as any).webkitCancelFullScreen()
  } else if ((document as any).documentElement.mozRequestFullScreen) {
    (document as any).mozCancelFullScreen()
  }
}
/**
 * 浏览器全屏
 */
export const reqFullScreen = () => {
  if ((document as any).documentElement.requestFullScreen) {
    (document as any).documentElement.requestFullScreen()
  } else if ((document as any).documentElement.webkitRequestFullScreen) {
    (document as any).documentElement.webkitRequestFullScreen()
  } else if ((document as any).documentElement.mozRequestFullScreen) {
    (document as any).documentElement.mozRequestFullScreen()
  }
}

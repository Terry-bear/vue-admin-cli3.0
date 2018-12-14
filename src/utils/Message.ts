export default class OpenMessage {
  private ThisMsg: any
  private message: string
  constructor(message: string, ThisMsg: string) {
    this.message = message
    this.ThisMsg = ThisMsg
  }
  public open() {
    this.ThisMsg(this.message)
  }
  public openSuccess() {
    this.ThisMsg({
      message: this.message,
      type: 'success'
    })
  }

  public openWaring() {
    this.ThisMsg({
      message: this.message,
      type: 'warning'
    })
  }

  public openError() {
    this.ThisMsg.error(this.message)
  }
}

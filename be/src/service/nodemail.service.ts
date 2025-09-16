import nodemailer from 'nodemailer'
import { NotificationDto, VerifyEmail } from '../dto/request/notification.dto'
// import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import dotenv from 'dotenv'
import { EmailTypeEnum } from '../enums/emailType.enum'
import { renderTemplate } from '../utils/templateUtil'

dotenv.config()

// Interface cho options gửi mail
export interface SendEmailOptions {
  to: string[]
  subject: string
  text?: string
  html?: string
}

class NodeMailService {
  static transporter: nodemailer.Transporter | null = null

  constructor() {
    if (NodeMailService.transporter === null) {
      console.log('Setting up NodeMailService transporter...', process.env.GMAIL_USER, process.env.GMAIL_PASS)
      NodeMailService.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    }
  }

  private async send(options: SendEmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
      const info = await NodeMailService.transporter?.sendMail({
        from: '"Lương Quang Thịnh" <quangthinh06112004@gmail.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })

      console.log('Email sent:', info.messageId)
      return info
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  // public send mail
  async sendMail(notification: NotificationDto): Promise<void> {
    let subject = ''
    let to
    let templateName = ''
    let templateData = {}

    switch (notification.type) {
      case EmailTypeEnum.VERIFY_EMAIL: {
        const emailNotification = notification as VerifyEmail

        subject = 'Hãy xác thực tài khoản của bạn'
        to = emailNotification.email
        templateName = 'email-verification.html'
        templateData = { name: emailNotification.name, token: emailNotification.token }
        break
      }
      case EmailTypeEnum.FORGOT_PASSWORD_OTP: {
        const emailNotification = notification as VerifyEmail
        subject = 'Mã OTP khôi phục mật khẩu'
        to = emailNotification.email
        templateName = 'email-verification.html'
        templateData = { name: emailNotification.name, token: emailNotification.token }
        break
      }

      // Thêm các loại khác nếu cần
      default:
        console.log(`Chưa thể gửi mail to ${notification.email}: ${notification.type}`)
        return
    }

    // render html
    const html = await renderTemplate(templateName, templateData)

    const mailPayload: SendEmailOptions = {
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ''), // Convert HTML to plain text thô sơ
      html
    }

    await this.send(mailPayload)
  }
}

export default new NodeMailService()

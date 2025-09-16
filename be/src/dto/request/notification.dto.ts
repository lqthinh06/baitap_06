import { EmailTypeEnum } from "../../enums/emailType.enum"

export interface NotificationDto {
  type: EmailTypeEnum
  email: string[]
}

export interface VerifyEmail extends NotificationDto {
  token: string
  name: string
}
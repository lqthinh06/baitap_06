export interface UserDto {
  name: string
  email: string
  avatarUrl?: string
  location?: string
  bio?: string
  phone?: string
}

export interface PendingUserDto extends UserDto {
  //token
  otpCode: string
}

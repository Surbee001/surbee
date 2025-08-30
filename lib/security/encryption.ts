import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGO = 'aes-256-gcm'

export class DataEncryption {
  static encryptSurveyData(data: any): string {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGO, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
    cipher.setAAD(Buffer.from('survey-data'))
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
  }

  static decryptSurveyData(encryptedData: string): any {
    const [ivHex, authTagHex, payloadHex] = encryptedData.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
    decipher.setAAD(Buffer.from('survey-data'))
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(Buffer.from(payloadHex, 'hex')), decipher.final()]).toString('utf8')
    return JSON.parse(decrypted)
  }

  static async hashPassword(password: string): Promise<string> { return await bcrypt.hash(password, 12) }
  static async verifyPassword(password: string, hash: string) { return await bcrypt.compare(password, hash) }
  static generateSecureToken(length = 32): string { return crypto.randomBytes(length).toString('hex') }
}

export class DataAnonymization {
  static anonymizeUserData(userData: any): any {
    return { ...userData, email: this.hashEmail(userData.email), name: this.anonymizeName(userData.name), ip: this.anonymizeIP(userData.ip) }
  }
  private static hashEmail(email: string) { return crypto.createHash('sha256').update(email || '').digest('hex').substring(0, 16) }
  private static anonymizeName(name: string) { return name ? `${name[0]}***` : 'Anonymous' }
  private static anonymizeIP(ip: string) { const parts = (ip || '0.0.0.0').split('.'); return `${parts[0]}.${parts[1]}.xxx.xxx` }
}


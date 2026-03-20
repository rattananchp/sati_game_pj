import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  // 1. อ่านไฟล์ .sql ที่คุณ dump มา
  // const sqlFilePath = path.join(__dirname, 'data_only.sql')
  const sqlFilePath = './prisma/data_only.sql'
  const sql = fs.readFileSync(sqlFilePath, 'utf8')

  console.log('กำลังเริ่ม Import ข้อมูล...')

  try {
    // 2. ใช้ $executeRawUnsafe เพื่อรัน Raw SQL ทั้งหมดในไฟล์
    // หมายเหตุ: หากไฟล์ใหญ่มาก (หลาย GB) อาจต้องแยกอ่านเป็นบรรทัด
    await prisma.$executeRawUnsafe(sql)
    
    console.log('Import ข้อมูลสำเร็จ!')
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

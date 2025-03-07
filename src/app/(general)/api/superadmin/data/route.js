import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const adminData = (admin, newpass) => {

  const admin_data = admin.map((r) => {

    const initials = r.fn[0] + (r.ln != null ? r.ln[0] : '')

    return {
      id: r.id,
      fn: r.fn,
      mn: r.mn,
      ln: r.ln,
      initials,
      access: r.access,
      email: r.email
    }
  })

  let admins = []
  let authorize = admin_data

  for (let i = 0; i < admin_data.length; i++) {
    if (admin_data[i].access == true) {
      admins.push(admin_data[i])
    }
  }

  return {
    admins,
    authorize,
    newpass
  }
}

export async function POST(request) {
  const prisma = new PrismaClient()
  const params = await request.json()

  const admin = await prisma.admin.findMany({
    select: {
      id: true,
      fn: true,
      mn: true,
      ln: true,
      email: true,
      access: true
    }
  })

  const newpass = await prisma.changepassword.findMany({
    where: {
      date_approved: null,
      date_rejected: null
    },
    select: {
      id: true,
      email: true,
      new_pass: true,
      date_requested: true
    }
  })

  const admin_data = adminData(admin, newpass)

  /* let s = params['test']
  let re = /(?<fn>[\w\s]+)\s*(?<mn>\w{1}\.)?\s+(?<ln>\w+)/
  let tt = re.exec(s) */

  await prisma.$disconnect()
  return NextResponse.json(admin_data)
}

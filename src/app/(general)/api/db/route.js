import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const { hash } = require('bcrypt');
import logger from '@/logger/logger'

const prisma = new PrismaClient();

export async function POST(request) {
  const params = await request.json();
  console.log(params);

  let entity = (params['entity'] == 'books') ? prisma.books : prisma.boardgames;

  let result = await entity.findMany({
    where: params['where']
  });

  if (params['search'] != undefined) {

    let re = /[^0-9]+/

    if (re.test(params['contains'])) {
      console.log('has letters')
      let stringAttributes = params['dashboard'] == undefined ? ['title', 'author', 'edition', 'publisher', 'call_num'] : ['title', 'author']
      if (params['entity'] !== 'books') {
        stringAttributes = params['dashboard'] == undefined ? ['title', 'call_num', 'publisher'] : ['title', 'publisher']
      }
      const ors = []
      for (let i = 0; i < stringAttributes.length; i++) {
        const clause = {}
        clause[stringAttributes[i]] = {
          contains: params['contains'],
          mode: 'insensitive'
        }
        ors.push(clause)
      }

      result = await entity.findMany({
        where: {
          OR: ors,
          archive: false,
        }
      })

      return NextResponse.json(result)
    }
    else {
      console.log('has numbers')
      let numAttributes = params['dashboard'] == undefined ? ['id', 'barcode', 'accession_num'] : ['id']
      if (params['entity'] !== 'books') {
        numAttributes = params['dashboard'] == undefined ? ['id', 'accession_num'] : ['id']
      }
      const ors = []
      for (let i = 0; i < numAttributes.length; i++) {
        const clause = {}
        clause[numAttributes[i]] = parseInt(params['contains'])
        ors.push(clause)
      }

      result = await entity.findMany({
        where: {
          OR: ors,
          archive: false,
        }
      })

      return NextResponse.json(result)
    }


  }

  if (params['create'] != undefined) {

    if (params['entity'] == 'books') {
      const conditions = params['data'];
      result = await entity.create({
        data: conditions
      })

      result['id'] = result['id'].toString();
      console.log(result);
    }
    else if (params['entity'] == 'boardgames') {
      const conditions = params['data'];
      result = await entity.create({
        data: conditions
      })

      result['id'] = result['id'].toString();
      console.log(result)
    }
    else {
      console.log(result);
      const conditions = params['data'];
      conditions['id'] = Date.now();
      result = await entity.create({
        data: conditions
      })
    }

    logger(params['entity'] + ' with ID ' + result.id + ' created', true)
  }

  else if (params['update'] != undefined) {

    if (params['entity'] == 'books') {
      let filter = params['where']
      let info = params['data']
      result = await entity.update({
        where: filter,
        data: info
      })
    }

    else if (params['entity'] == 'requests') {
      entity = prisma.requests
      console.log('update request')
      let filter = params['where']
      let info = params['data']
      result = await entity.update({
        where: filter,
        data: info
      })
    }

    else if (params['entity'] == 'boardgames') {

      let filter = params['where']
      let info = params['data']
      result = await entity.update({
        where: filter,
        data: info
      })
    }

    logger(params['entity'] + ' entity with conditions ' + JSON.stringify(params['where']) + ' updated with the following data: ' + JSON.stringify(params['data']), true)

  }

  else if (params['delete'] != undefined) {

    let conditions = params['where']

    result = await entity.updateMany({
      where: conditions,
      data: { archive: true }
    })

    logger(params['entity'] + ' with the conditiions ' + JSON.stringify(conditions) + ' have been archived', true)
  }

  else if (params['content'] != undefined) {
    if (params['entity'] == 'books') {
      entity = prisma.books

    } else if (params['entity'] == 'boardgames') {
      entity = prisma.boardgames
    }
    result = await entity.findMany()
    return NextResponse.json(result)
  }

  else if (params['scanqr'] != undefined) {
    const id = params['id']

    console.log('ACCESSING QR')
    console.log(id)
    logger('Scanned valid QR code ' + id, true)

    const borrowTicket = await prisma.requests.findUnique({
      where: {
        id: id
      }
    })

    console.log(borrowTicket)

    let entityReq;
    if (borrowTicket.type == 'Book') {
      entityReq = await prisma.BookRequest.findUnique({
        where: {
          request_id: borrowTicket.id
        }
      })
    } else {
      entityReq = await prisma.BoardgameRequest.findUnique({
        where: {
          request_id: borrowTicket.id
        }
      })
    }

    console.log('GOT ENTITY REQ ====================================================================================================')

    var client;
    switch (borrowTicket.user_type) {
      case 'Student':
        client = await prisma.student.findUnique({
          where: {
            request_id: borrowTicket.id
          }

        });
        break;
      case 'Faculty':
        client = await prisma.faculty.findUnique({
          where: {
            request_id: borrowTicket.id
          }
        });
        break;
      case 'Staff':
        client = await prisma.staff.findUnique({
          where: {
            request_id: borrowTicket.id
          }
        });
        break;
      default:
    }

    let material
    if (borrowTicket.type == 'Book') {
      material = await prisma.books.findUnique({
        where: {
          id: entityReq.book_id
        }
      })
    } else {
      material = await prisma.boardgames.findUnique({
        where: {
          id: entityReq.boardgame_id
        }
      })
    }

    console.log('GOT ENTITY ITSELF ====================================================================================================')
    console.log(material)
    console.log(client)
    console.log(borrowTicket)

    result = {
      material,
      client,
      borrowTicket
    }
  }

  prisma.$disconnect();

  return NextResponse.json(result);
}

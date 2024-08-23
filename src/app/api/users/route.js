import User from '../../../models/user.model' // Adjust the path as necessary
import { NextResponse } from 'next/server'
import {connect} from '../../../db/dbConfig'
export async function POST(req, context) {
  // const { userId } = getAuth(req)
  // console.log(userId)
  const body=await req.json();
  const userId=body.userId;
  if (!userId) {
    return NextResponse.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    await connect()
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ status:401,error: 'User not found' })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ status:500, error: 'got 500' })
  }
 
}

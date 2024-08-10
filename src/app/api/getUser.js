import User from '../../models/user.model' // Adjust the path as necessary

export default async function handler(req, res) {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.status(200).json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

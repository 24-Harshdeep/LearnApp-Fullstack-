import express from 'express'
import { protect } from '../middleware/lmsAuth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' })
  }
  next()
}

// Get user's notifications
router.get('/my', protect, async (req, res) => {
  try {
    const { unreadOnly } = req.query

    const query = {
      $or: [
        { receiverId: req.user._id },
        { 'receivers.userId': req.user._id },
        { broadcast: true }
      ]
    }

    if (unreadOnly === 'true') {
      query.$or = [
        { receiverId: req.user._id, read: false },
        { 'receivers': { $elemMatch: { userId: req.user._id, read: false } } },
        { broadcast: true, read: false }
      ]
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name email')
      .populate('classId', 'name')
      .populate('hackathonId', 'title')
      .sort({ createdAt: -1 })
      .limit(50)

    // Mark as read for single receiver notifications
    const enrichedNotifications = notifications.map(notif => {
      const notifObj = notif.toObject()
      
      if (notif.receiverId && notif.receiverId.toString() === req.user._id.toString()) {
        notifObj.isRead = notif.read
      } else if (notif.receivers.length > 0) {
        const receiver = notif.receivers.find(r => r.userId.toString() === req.user._id.toString())
        notifObj.isRead = receiver ? receiver.read : false
      } else {
        notifObj.isRead = notif.read
      }

      return notifObj
    })

    const unreadCount = enrichedNotifications.filter(n => !n.isRead).length

    res.json({
      success: true,
      notifications: enrichedNotifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error.message 
    })
  }
})

// Get unread count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $or: [
        { receiverId: req.user._id, read: false },
        { 'receivers': { $elemMatch: { userId: req.user._id, read: false } } },
        { broadcast: true, read: false }
      ]
    })

    res.json({
      success: true,
      unreadCount: count
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error.message 
    })
  }
})

// Create notification (teachers only)
router.post('/create', protect, isTeacher, async (req, res) => {
  try {
    const { title, message, type, receiverId, classId, hackathonId } = req.body

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      })
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      senderId: req.user._id,
      receiverId,
      classId,
      hackathonId
    })

    await notification.save()

    const populatedNotif = await Notification.findById(notification._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('classId', 'name')
      .populate('hackathonId', 'title')

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: populatedNotif
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create notification',
      error: error.message 
    })
  }
})

// Broadcast notification (teachers only)
router.post('/broadcast', protect, isTeacher, async (req, res) => {
  try {
    const { title, message, type, classId, hackathonId, receiverIds } = req.body

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      })
    }

    const notification = new Notification({
      title,
      message,
      type: type || 'announcement',
      senderId: req.user._id,
      broadcast: true,
      classId,
      hackathonId,
      receivers: receiverIds ? receiverIds.map(id => ({ userId: id, read: false })) : []
    })

    await notification.save()

    const populatedNotif = await Notification.findById(notification._id)
      .populate('senderId', 'name email')
      .populate('classId', 'name')
      .populate('hackathonId', 'title')

    res.status(201).json({
      success: true,
      message: 'Broadcast notification sent successfully',
      notification: populatedNotif
    })
  } catch (error) {
    console.error('Error broadcasting notification:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to broadcast notification',
      error: error.message 
    })
  }
})

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }

    // Check if single receiver
    if (notification.receiverId && notification.receiverId.toString() === req.user._id.toString()) {
      notification.read = true
    } 
    // Check if in receivers array
    else if (notification.receivers.length > 0) {
      const receiver = notification.receivers.find(r => r.userId.toString() === req.user._id.toString())
      if (receiver) {
        receiver.read = true
      }
    }
    // Broadcast notification
    else if (notification.broadcast) {
      notification.read = true
    }

    await notification.save()

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    })
  } catch (error) {
    console.error('Error marking as read:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark as read',
      error: error.message 
    })
  }
})

// Mark all as read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    // Update single receiver notifications
    await Notification.updateMany(
      { receiverId: req.user._id, read: false },
      { $set: { read: true } }
    )

    // Update receiver array notifications
    await Notification.updateMany(
      { 'receivers.userId': req.user._id, 'receivers.read': false },
      { $set: { 'receivers.$.read': true } }
    )

    // Update broadcast notifications
    await Notification.updateMany(
      { broadcast: true, read: false },
      { $set: { read: true } }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    console.error('Error marking all as read:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all as read',
      error: error.message 
    })
  }
})

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      })
    }

    // Only sender or receiver can delete
    if (
      notification.senderId.toString() !== req.user._id.toString() &&
      notification.receiverId?.toString() !== req.user._id.toString() &&
      !notification.receivers.some(r => r.userId.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this notification' 
      })
    }

    await notification.deleteOne()

    res.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification',
      error: error.message 
    })
  }
})

// Get class notifications (for specific class)
router.get('/class/:classId', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      classId: req.params.classId 
    })
      .populate('senderId', 'name email')
      .populate('classId', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      notifications,
      total: notifications.length
    })
  } catch (error) {
    console.error('Error fetching class notifications:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch class notifications',
      error: error.message 
    })
  }
})

// Get hackathon notifications
router.get('/hackathon/:hackathonId', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      hackathonId: req.params.hackathonId 
    })
      .populate('senderId', 'name email')
      .populate('hackathonId', 'title')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      notifications,
      total: notifications.length
    })
  } catch (error) {
    console.error('Error fetching hackathon notifications:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hackathon notifications',
      error: error.message 
    })
  }
})

export default router

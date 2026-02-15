# 👥 Group Chat Feature Guide

## Overview

The ChatVibe application now includes comprehensive group chat functionality with admin controls. Admins can manage group members, rename groups, and transfer admin rights as needed.

---

## 🎯 Features

### For All Members:
- ✅ View group members and their roles
- ✅ Leave the group at any time
- ✅ Send and receive messages in real-time
- ✅ See group information and member count

### For Admins:
- ✅ Add new members to the group
- ✅ Remove members from the group
- ✅ Rename the group
- ✅ Transfer admin rights to another member
- ✅ View and manage all group participants

---

## 🚀 How to Use

### Creating a Group Chat

1. Open ChatVibe and navigate to the chat page
2. Click the **"Create Group"** button in the sidebar (green button with group icon)
3. Enter a group name
4. Search and select at least 2 users to add
5. Click **"Create Group"**

### Managing a Group (Admin Only)

1. Open the group chat you want to manage
2. Click the **info icon (ℹ️)** in the chat header
3. The Group Info modal will open with management options:

#### Adding Members:
- Click **"Add Members"**
- Search for users
- Click the **+ icon** next to their name to add them

#### Removing Members:
- Find the member in the list
- Click the **user minus icon** next to their name
- Confirm the action

#### Renaming Group:
- Click the **pencil icon** next to the group name
- Enter the new name
- Click the **checkmark** to save or **X** to cancel

#### Changing Admin:
- Find the member you want to make admin
- Click the **shield icon** next to their name
- Confirm the action
- You will no longer be admin, but remain a member

### Leaving a Group

1. Open the Group Info modal
2. Scroll to the bottom
3. Click **"Leave Group"**
4. Confirm the action

**Note:** If you're the admin and leave:
- Admin rights are automatically transferred to another member
- If you're the last member, the group is deleted

---

## 🔧 Backend API Endpoints

### Group Creation
```http
POST /api/chats/group
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Group",
  "users": ["userId1", "userId2", "userId3"]
}
```

### Add User to Group
```http
PUT /api/chats/group/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "groupId",
  "userId": "userIdToAdd"
}
```

### Remove User from Group
```http
PUT /api/chats/group/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "groupId",
  "userId": "userIdToRemove"
}
```

### Leave Group
```http
PUT /api/chats/group/leave
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "groupId"
}
```

### Rename Group
```http
PUT /api/chats/group/rename
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "groupId",
  "name": "New Group Name"
}
```

### Change Group Admin
```http
PUT /api/chats/group/admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "groupId",
  "newAdminId": "userId"
}
```

---

## 📡 Real-Time Socket Events

### Events Emitted by Client:
- `userAddedToGroup` - When admin adds a user
- `userRemovedFromGroup` - When admin removes a user
- `userLeftGroup` - When a user leaves
- `groupRenamed` - When admin renames the group
- `adminChanged` - When admin rights are transferred

### Events Received by Client:
- `groupUpdated` - Group information changed (members, name, admin)
- `addedToGroup` - You were added to a group
- `removedFromGroup` - You were removed from a group

---

## 📂 File Structure

### Backend Files:
```
server/
├── controllers/
│   └── chatController.js          # Group management logic
├── routes/
│   └── chatRoutes.js              # Group API routes
├── socket/
│   └── socketHandler.js           # Real-time group events
└── models/
    └── Chat.js                    # Group data model
```

### Frontend Files:
```
client/src/
├── components/
│   ├── GroupChatModal.js          # Create group UI
│   ├── GroupInfoModal.js          # Manage group UI
│   ├── Sidebar.js                 # Updated with group button
│   └── ChatWindow.js              # Updated with group info button
├── pages/
│   └── Chat.js                    # Main integration
└── services/
    ├── api.js                     # Group API calls
    └── socket.js                  # Socket service
```

---

## 🔐 Permissions & Security

### Admin Permissions:
- Only admins can add/remove members
- Only admins can rename the group
- Only admins can transfer admin rights
- Admin cannot be removed by other admins
- Admin can remove themselves (transfers admin first)

### Member Permissions:
- All members can view group info
- All members can leave the group
- Members cannot modify group settings

### Security Features:
- JWT authentication required for all operations
- Backend validation ensures only admins can modify groups
- Frontend displays admin-only controls conditionally
- Real-time updates keep all members in sync

---

## 💡 Best Practices

1. **Creating Groups:**
   - Use descriptive names
   - Add at least 2 other members
   - Choose an appropriate admin

2. **Managing Members:**
   - Communicate before removing members
   - Transfer admin before leaving if you want to preserve group leadership
   - Add trusted members who will contribute

3. **Group Naming:**
   - Keep names concise and meaningful
   - Avoid special characters that might cause issues
   - Update name as group purpose evolves

4. **Admin Transfer:**
   - Only transfer to active members
   - Coordinate with the new admin first
   - Remember: you cannot undo this action

---

## 🐛 Troubleshooting

### Issue: Can't see "Create Group" button
**Solution:** Make sure you're logged in and on the chat page

### Issue: Can't add members to group
**Solution:** 
- Verify you're the admin
- Check that the user isn't already in the group
- Ensure you have a stable internet connection

### Issue: Group changes not appearing
**Solution:**
- Check your socket connection
- Refresh the page
- Verify other members can see the changes

### Issue: Can't remove a member
**Solution:**
- Verify you're the admin
- You cannot remove the admin (yourself) - use Leave Group instead
- Check backend logs for errors

---

## 🎨 UI Components

### GroupChatModal
- Clean, modal-based interface
- User search with real-time filtering
- Selected members displayed as chips
- Form validation before submission

### GroupInfoModal
- Comprehensive group information display
- Admin controls conditionally rendered
- Member list with roles
- Action buttons with confirmation dialogs

### Sidebar Integration
- New "Create Group" button (green)
- Clear visual distinction from "New Chat"
- Accessible placement

### ChatWindow Integration
- Info icon for group chats
- Member count display in header
- Responsive design

---

## 🔄 Data Flow

### Creating a Group:
```
User Action → GroupChatModal → API Call → Backend → Database
                                    ↓
Socket Event → All Members → UI Update → Join Room
```

### Adding a Member:
```
Admin Action → GroupInfoModal → API Call → Backend → Database
                                              ↓
Socket Event → All Members + New Member → UI Update
```

### Leaving/Removing:
```
User Action → Confirmation → API Call → Backend → Database
                                           ↓
Socket Event → All Members → UI Update → Leave Room
```

---

## 📊 Database Schema

The Chat model includes group-specific fields:

```javascript
{
  name: String,              // Group name
  isGroupChat: Boolean,      // true for groups
  participants: [ObjectId],  // Array of user IDs
  admin: ObjectId,          // Admin user ID
  lastMessage: ObjectId,    // Last message reference
  unreadCount: Map,         // Unread counts per user
  timestamps: true          // createdAt, updatedAt
}
```

---

## ✅ Testing Checklist

- [ ] Create a new group with 3+ members
- [ ] Send messages in the group
- [ ] Add a new member as admin
- [ ] Remove a member as admin
- [ ] Rename the group as admin
- [ ] Transfer admin to another member
- [ ] Leave the group as a regular member
- [ ] Leave as admin (verify admin transfer)
- [ ] Verify real-time updates for all operations
- [ ] Check notifications for group events

---

## 🚀 Future Enhancements

Potential features to add:

- [ ] Group avatars/icons
- [ ] Multiple admins support
- [ ] Member roles (admin, moderator, member)
- [ ] Group descriptions
- [ ] Member join requests
- [ ] Group pinned messages
- [ ] Group search functionality
- [ ] Export chat history
- [ ] Group settings (who can send messages, add members, etc.)
- [ ] Group analytics (active members, message count, etc.)

---

## 📝 Notes

- All group operations require authentication
- Real-time updates ensure all members stay in sync
- The system automatically handles edge cases (last member leaving, admin transfer)
- Frontend validation provides immediate feedback
- Backend validation ensures data integrity

---

**Happy Grouping! 🎉**

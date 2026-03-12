# ChitChat – Real-Time Messaging Application

ChitChat is a **real-time messaging platform** built with **Next.js, Convex, and Clerk**.  
It allows users to discover other users, start conversations, and exchange messages instantly with a modern chat interface.

The project focuses on **real-time communication, scalable backend architecture, and clean UI design**.

---

# Live Demo

Production deployment:

https://chitchat-git-main-ritabrata-ghoshs-projects.vercel.app/

---

# Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend / Realtime
- Convex (database + server functions + subscriptions)

### Authentication
- Clerk

### Deployment
- Vercel

---

# Screenshots

<img width="1919" height="927" alt="image" src="https://github.com/user-attachments/assets/2cae1a0d-cea0-4c8f-a968-d336f62fcbe3" />
<img width="1919" height="930" alt="image" src="https://github.com/user-attachments/assets/3ee9d418-098f-4a4e-b2a9-64c377a90cf2" />
Convex db storage:
<img width="1747" height="814" alt="image" src="https://github.com/user-attachments/assets/63a76e2d-8965-4ba8-b595-81e8772bfd52" />

# Features

## Authentication
- Secure login/signup using Clerk
- Protected routes
- Logout functionality

## User Discovery
- View all registered users
- Current user automatically excluded
- Search users by name in real time

## One-on-One Messaging
- Private conversations between users
- Conversations automatically created on first interaction
- Real-time message delivery

## Real-Time Messaging
- Powered by Convex subscriptions
- Messages update instantly for all participants
- No manual polling required

## Conversation Sidebar
- Displays all active conversations
- Shows the latest message preview
- Conversations sorted by recent activity

## Typing Indicator
- Shows when another user is typing
- Uses a `typingUsers` field in the conversation document
- Automatically resets after inactivity

## Message Features
- Message timestamps
- Read/unread message tracking
- Message deletion
- Message reactions

## UX Improvements
- Smart auto-scroll for new messages
- Empty states for conversations, messages, and search
- Loading states
- Responsive layout

## Group Chat
- Create group conversations
- Multiple participants support
- Custom group names

---





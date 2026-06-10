export type Client = {
  id: string
  name: string
  logo: string | null
  notes: string | null
  created_at: string
  deleted_at: string | null
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Waiting for Client' | 'Done'
export type TaskOwner = 'Me' | 'Client'
export type AttachmentType = 'image' | 'file' | 'link'

export type Task = {
  id: string
  client_id: string
  meeting_action_item_id: string | null
  title: string
  owner: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  archived_at: string | null
  client?: Client
  updates?: TaskUpdate[]
}

export type TaskUpdate = {
  id: string
  task_id: string
  content: string
  created_at: string
  attachments?: TaskAttachment[]
}

export type TaskAttachment = {
  id: string
  task_update_id: string
  file_url: string
  file_name: string
  file_type: AttachmentType
  created_at: string
}

export type Meeting = {
  id: string
  client_id: string
  title: string
  meeting_date: string
  notes: string | null
  created_at: string
  deleted_at: string | null
  client?: Client
  action_items?: MeetingActionItem[]
}

export type MeetingActionItem = {
  id: string
  meeting_id: string
  title: string
  owner: string
  due_date: string | null
  created_at: string
}

export type Achievement = {
  id: string
  client_id: string
  title: string
  description: string | null
  comments: string | null
  achievement_date: string
  created_at: string
  deleted_at: string | null
  client?: Client
}
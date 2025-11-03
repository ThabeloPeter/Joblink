# Notification Components

Reusable notification components for displaying errors, success messages, info, and warnings.

## Usage

### Basic Usage with Hook

```tsx
'use client'

import { useNotify } from '@/components/ui/NotificationProvider'

export default function MyComponent() {
  const notify = useNotify()

  const handleSuccess = () => {
    notify.showSuccess('Operation completed successfully!')
  }

  const handleError = () => {
    notify.showError('Something went wrong', 'Error')
  }

  const handleInfo = () => {
    notify.showInfo('Here is some information', 'Info', 3000)
  }

  const handleWarning = () => {
    notify.showWarning('Please review this', 'Warning')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
    </div>
  )
}
```

### Available Methods

- `notify.showError(message, title?, duration?)` - Display error notification
- `notify.showSuccess(message, title?, duration?)` - Display success notification
- `notify.showInfo(message, title?, duration?)` - Display info notification
- `notify.showWarning(message, title?, duration?)` - Display warning notification

### Parameters

- `message` (required): The notification message text
- `title` (optional): A title for the notification
- `duration` (optional): How long to show the notification in milliseconds (default: 5000)

### Example in Form Submission

```tsx
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data)
    notify.showSuccess('Form submitted successfully!')
  } catch (error) {
    notify.showError(
      error.message || 'Failed to submit form',
      'Submission Error'
    )
  }
}
```

## Notification Types

- **Error** (red) - For errors and failures
- **Success** (green) - For successful operations
- **Info** (blue) - For informational messages
- **Warning** (yellow) - For warnings

## Styling

Notifications are styled with Tailwind CSS and include:
- Animated entry/exit using Framer Motion
- Color-coded by type
- Auto-dismiss after duration
- Manual close button
- Positioned at top-right by default


export interface User {
  id: string
  email: string
  role: 'admin' | 'company' | 'provider'
  companyId?: string | null
  company?: {
    id: string
    name: string
    status: string
    contactPerson?: string
    phone?: string
  } | null
}


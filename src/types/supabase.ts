
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      doctors: {
        Row: {
          id: string
          email: string
          name: string
          workplace: string
          identifier: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          workplace: string
          identifier: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          workplace?: string
          identifier?: string
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          identifier: string
          name: string
          age: number
          dob: string
          gender: string
          created_at: string
        }
        Insert: {
          id?: string
          identifier: string
          name: string
          age: number
          dob: string
          gender: string
          created_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          name?: string
          age?: number
          dob?: string
          gender?: string
          created_at?: string
        }
      }
      conditions: {
        Row: {
          id: string
          patient_id: string
          body_part: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          body_part: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          body_part?: string
          description?: string
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          patient_id: string
          name: string
          dosage: string
          since: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          dosage: string
          since: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          dosage?: string
          since?: string
          created_at?: string
        }
      }
      medical_history: {
        Row: {
          id: string
          patient_id: string
          date: string
          condition: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          condition: string
          notes: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          condition?: string
          notes?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          date: string
          type: string
          place: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          type: string
          place: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          type?: string
          place?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

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
          doctor_id?: string
          doctor_name?: string
        }
        Insert: {
          id?: string
          patient_id: string
          body_part: string
          description: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
        Update: {
          id?: string
          patient_id?: string
          body_part?: string
          description?: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
      }
      medications: {
        Row: {
          id: string
          patient_id: string
          name: string
          dosage: string
          since: string
          current: boolean
          created_at: string
          doctor_id?: string
          doctor_name?: string
        }
        Insert: {
          id?: string
          patient_id: string
          name: string
          dosage: string
          since: string
          current?: boolean
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
        Update: {
          id?: string
          patient_id?: string
          name?: string
          dosage?: string
          since?: string
          current?: boolean
          created_at?: string
          doctor_id?: string
          doctor_name?: string
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
          doctor_id?: string
          doctor_name?: string
          record_type?: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          condition: string
          notes: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
          record_type?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          condition?: string
          notes?: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
          record_type?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          date: string
          time: string
          type: string
          place: string
          created_at: string
          doctor_id?: string
          doctor_name?: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          time?: string
          type: string
          place: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          time?: string
          type?: string
          place?: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
      }
      appointment: {
        Row: {
          id: string
          patient_id: string
          date: string
          time?: string | null
          type: string
          place: string
          created_at: string
          doctor_id?: string
          doctor_name?: string
          doctor_workplace?: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          time?: string | null
          type: string
          place: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
          doctor_workplace?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          time?: string | null
          type?: string
          place?: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
          doctor_workplace?: string
        }
      }
      examinations: {
        Row: {
          id: string
          patient_id: string
          date: string
          name: string
          notes: string
          created_at: string
          doctor_id?: string
          doctor_name?: string
        }
        Insert: {
          id?: string
          patient_id: string
          date: string
          name: string
          notes: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
        }
        Update: {
          id?: string
          patient_id?: string
          date?: string
          name?: string
          notes?: string
          created_at?: string
          doctor_id?: string
          doctor_name?: string
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

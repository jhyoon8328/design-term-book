export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      data_guides: {
        Row: {
          id: string;
          category: string;
          situation: string;
          recommendation: string;
          reason: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          category: string;
          situation: string;
          recommendation: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          category?: string;
          situation?: string;
          recommendation?: string;
          reason?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      FashionTermBook: {
        Row: {
          id: string;
          seq: number;
          category: string | null;
          current_term: string | null;
          current_variants: string | null;
          standard_en: string | null;
          standard_en_short: string | null;
          korean_meaning: string | null;
          korean_short: string | null;
          notes: string | null;
          card_row: number | null;
          search_terms: string | null;
          image: string | null;
          use_in: boolean | null;
          use_out: boolean | null;
          use_yn: boolean | null;
          created_by: string | null;
          created_at: string | null;
          modified_by: string | null;
          modified_at: string | null;
        };
        Insert: any;
        Update: any;
      };
      FashionFiles: {
        Row: {
          id: string;
          fashion_term_book_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_type: string | null;
          seq: number | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: any;
        Update: any;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

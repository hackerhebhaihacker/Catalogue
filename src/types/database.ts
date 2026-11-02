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
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          mobile_number: string | null;
          role: "user" | "admin";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          mobile_number?: string | null;
          role?: "user" | "admin";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          mobile_number?: string | null;
          role?: "user" | "admin";
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          category_name: string;
          description: string | null;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_name: string;
          description?: string | null;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_name?: string;
          description?: string | null;
          slug?: string;
        };
      };
      products: {
        Row: {
          id: string;
          product_name: string;
          description: string;
          category_id: string | null;
          image_url: string | null;
          price: number | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_name: string;
          description: string;
          category_id?: string | null;
          image_url?: string | null;
          price?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_name?: string;
          description?: string;
          category_id?: string | null;
          image_url?: string | null;
          price?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "user" | "admin";
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductWithCategory = Product & {
  categories: Category | null;
};

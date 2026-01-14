import { supabase } from '@/integrations/supabase/client';

export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    const urlParts = imageUrl.split('/product-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    return !error;
  } catch {
    return false;
  }
}

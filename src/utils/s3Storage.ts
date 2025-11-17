import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

export const s3Storage = {
  async uploadFile(file: File, key?: string) {
    try {
      const fileKey = key || `uploads/${Date.now()}-${file.name}`;
      
      const result = await uploadData({
        path: fileKey,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      return { 
        success: true, 
        key: result.path,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },

  async getFileUrl(key: string) {
    try {
      const result = await getUrl({
        path: key,
        options: {
          expiresIn: 3600, // 1 hour
        },
      });

      return { 
        success: true, 
        url: result.url.toString(),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteFile(key: string) {
    try {
      await remove({ path: key });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async listFiles(prefix: string = 'uploads/') {
    try {
      const result = await list({
        path: prefix,
      });

      return { 
        success: true, 
        items: result.items,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

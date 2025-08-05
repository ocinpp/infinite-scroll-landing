export interface ImageItem {
  id: number;
  url: string;
  title: string;
  description: string;
}

export interface ImageData {
  images: ImageItem[];
}

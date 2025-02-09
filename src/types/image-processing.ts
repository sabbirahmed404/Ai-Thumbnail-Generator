export interface ImageProcessingInstruction {
  base: {
    size: {
      width: number;
      height: number;
    };
    format: 'jpg' | 'png';
  };
  enhancements: {
    filters?: Array<{
      type: 'contrast' | 'brightness' | 'saturation';
      value: number;
    }>;
    overlays?: Array<{
      type: 'text' | 'emoji';
      content: string;
      position: {
        x: number;
        y: number;
      };
      style: {
        font?: string;
        size: number;
        color?: string;
        outline?: string;
        outlineWidth?: number;
        weight?: string;
        alignment?: string;
        shadow?: {
          color: string;
          blur: number;
          offsetX: number;
          offsetY: number;
        };
      };
    }>;
    graphics?: Array<{
      type: 'logo' | 'image';
      path: string;
      position: {
        x: number;
        y: number;
      };
    }>;
  };
}

export interface ProcessedImage {
  url: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  instructions: ImageProcessingInstruction;
} 
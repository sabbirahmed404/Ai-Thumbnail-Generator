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
      type: 'text';
      content: string;
      position: {
        x: number;
        y: number;
      };
      style: {
        font: string;
        size: number;
        color: string;
        outline?: string;
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
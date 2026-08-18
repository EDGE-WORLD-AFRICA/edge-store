export type IToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "default"
  | "dark"
  | "custom";

export interface IToastOptions {
  title?: string;
  message: string;
  variant?: IToastVariant;
  duration?: number;
  dismissible?: boolean;
  customClass?: string;
}

export interface IToast extends IToastOptions {
  id: string;
  variant: IToastVariant;
  duration: number;
  dismissible: boolean;
  createdAt: number;
}
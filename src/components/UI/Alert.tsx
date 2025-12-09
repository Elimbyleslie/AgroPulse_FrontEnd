import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps {
  type?: "error" | "success" | "warning" | "info";
  title?: string;
  message?: string;
  children?: ReactNode;
}

export const Alert = ({
  type = "info",
  title,
  message,
  children,
}: AlertProps) => {
  const styles = {
    error: "bg-red-50 text-red-700 border-red-300",
    success: "bg-green-50 text-green-700 border-green-300",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-300",
    info: "bg-blue-50 text-blue-700 border-blue-300",
  };

  const icons = {
    error: <XCircle className="h-5 w-5 text-red-600" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  return (
    <div className={`border p-3 rounded-xl flex gap-3 items-start ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p>{message}</p>}
        {children}
      </div>
    </div>
  );
};

import { XCircle } from "lucide-react";

export const FormError = ({
  touched,
  error,
}: {
  touched?: boolean;
  error?: string;
}) => {
  if (!touched || !error) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <XCircle className="w-4 h-4" />
      {error}
    </p>
  );
};
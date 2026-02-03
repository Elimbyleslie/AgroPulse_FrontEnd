import { ReactNode} from 'react';

interface LoadingButtonProps {
  loading: boolean;
  children: ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ loading, children }) => (
  <span className={loading ? "opacity-50" : ""}>
    {children}
  </span>
);

export

default LoadingButton;
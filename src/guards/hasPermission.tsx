import React, { ReactElement } from "react";
import { useAppSelector } from "../hooks/store";
import { selectAuthenticatedUser } from "../store/auth/slice";
import Utils from "../lib/utils";
import Forbidden from "../pages/errors/Forbiden";

type Props = {
  children: ReactElement | null;
  requiredPermissions: string[];
  isLink?: boolean;
};

const HasPermissions: React.FC<Props> = ({
  children,
  requiredPermissions,
  isLink = true,
}) => {
  const auth = useAppSelector(selectAuthenticatedUser);

  if (auth && Utils.hasPermission(requiredPermissions)) {
    return children;
  }

  if (isLink) {
    return null;
  }

  return <Forbidden />;
};

export default HasPermissions;

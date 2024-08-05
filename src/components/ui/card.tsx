import { ReactNode } from "react";

export const Card = ({ children }: { children?: ReactNode }) => (
  <div className="flex min-w-[500px] flex-row justify-center rounded-lg bg-white p-10 dark:bg-[#0F172A]">
    {children}
  </div>
);

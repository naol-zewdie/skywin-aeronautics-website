import type { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-screen-xl px-6 py-4">{children}</div>;
}

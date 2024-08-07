"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import isAuth from "../../components/isAuth";

function Home() {
  const router = useRouter();

  const pathname = usePathname();
  useEffect(() => {
    router.push("/dashboard");
  }, []);

  return <></>;
}

export default isAuth(Home);

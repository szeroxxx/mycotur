import { useEffect } from "react";
import { useRouter } from "next/router";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/activity-map");
  }, [router]);

  return null;
}

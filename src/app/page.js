import { Suspense } from "react";
import HomePageClient from "./HomePageClient";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(to bottom, rgb(241, 245, 249) 0%, rgb(219, 234, 254) 50%, rgb(226, 232, 240) 100%)",
          }}
        >
          <p style={{ color: "rgb(71, 85, 105)", fontWeight: "500" }}>
            Cargando ranking…
          </p>
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}

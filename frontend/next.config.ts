import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.API_INTERNAL_BASE_URL ?? "http://localhost:8000";

    return [
      {
        source: "/api/students",
        destination: `${apiBaseUrl}/api/v1/students/`,
      },
      {
        source: "/api/classes",
        destination: `${apiBaseUrl}/api/v1/classes/`,
      },
      {
        source: "/api/teachers",
        destination: `${apiBaseUrl}/api/v1/teachers/`,
      },
      {
        source: "/api/students/:studentId/grades",
        destination: `${apiBaseUrl}/api/v1/students/:studentId/grades`,
      },
    ];
  },
};

export default nextConfig;

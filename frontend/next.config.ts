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
        source: "/api/students/:studentId",
        destination: `${apiBaseUrl}/api/v1/students/:studentId`,
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
      {
        source: "/api/grades",
        destination: `${apiBaseUrl}/api/v1/grades/`,
      },
      {
        source: "/api/attendance",
        destination: `${apiBaseUrl}/api/v1/attendance/`,
      },
    ];
  },
};

export default nextConfig;

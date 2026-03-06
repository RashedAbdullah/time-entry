export async function GET() {
  const report = `
March 2026 Report
------------------
1 Mar - 8h 30m
2 Mar - 7h 45m

Total: 153h 20m
`;

  return new Response(report, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
